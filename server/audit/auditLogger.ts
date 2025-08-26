import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { storage } from '../storage';
import { InsertAuditEvent } from '@shared/schema';

// Request context for audit logging
interface AuditContext {
  requestId: string;
  actor: string;
  ipAddress: string;
  userAgent: string;
  startTime: number;
}

// Global context storage using AsyncLocalStorage for thread safety
import { AsyncLocalStorage } from 'async_hooks';
const auditContext = new AsyncLocalStorage<AuditContext>();

// Sensitive fields to redact from request/response bodies
const SENSITIVE_FIELDS = [
  'password', 'token', 'secret', 'key', 'auth', 'authorization',
  'apikey', 'api_key', 'access_token', 'refresh_token', 'jwt',
  'session', 'cookie', 'csrf', 'ssn', 'social_security'
];

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      (sanitized as any)[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      (sanitized as any)[key] = sanitizeObject(value);
    } else {
      (sanitized as any)[key] = value;
    }
  }
  
  return sanitized;
}

async function getLastAuditHash(): Promise<string | null> {
  try {
    return await storage.getLastAuditEventHash();
  } catch (error) {
    console.error('Failed to retrieve last audit hash:', error);
    return null;
  }
}

function computeAuditHash(event: Omit<InsertAuditEvent, 'hash'>, previousHash: string | null): string {
  const payload = {
    ...event,
    previousHash: previousHash || 'GENESIS'
  };
  
  // Create deterministic hash
  const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(sortedPayload).digest('hex');
}

// Request context middleware - captures environmental data
export function auditRequestContext(req: Request, res: Response, next: NextFunction) {
  const context: AuditContext = {
    requestId: nanoid(),
    actor: (req as any).user?.id || 'anonymous',
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    startTime: Date.now()
  };
  
  // Store context for this request
  auditContext.run(context, () => {
    // Set request ID header for client correlation
    res.setHeader('X-Request-ID', context.requestId);
    next();
  });
}

// Manual audit logging for sensitive actions
export async function logAuditEvent(
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: any
): Promise<void> {
  const context = auditContext.getStore();
  
  if (!context) {
    console.warn('Audit event logged outside of request context');
    return;
  }
  
  try {
    const previousHash = await getLastAuditHash();
    
    const eventData: Omit<InsertAuditEvent, 'hash'> = {
      requestId: context.requestId,
      actor: context.actor,
      action,
      resource,
      resourceId: resourceId || null,
      method: 'MANUAL',
      path: '/manual',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestBody: metadata ? sanitizeObject(metadata) : null,
      responseStatus: null,
      metadata: metadata ? sanitizeObject(metadata) : null,
      previousHash
    };
    
    const hash = computeAuditHash(eventData, previousHash);
    
    await storage.createAuditEvent({
      ...eventData,
      hash
    });
    
  } catch (error) {
    // Audit failures should not interrupt business logic
    console.error('Failed to log audit event:', error);
  }
}

// Auto-instrumentation middleware for mutating requests
export function auditAutoInstrumentation(req: Request, res: Response, next: NextFunction) {
  const context = auditContext.getStore();
  
  if (!context) {
    return next();
  }
  
  // Only audit mutating operations
  const mutateMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!mutateMethods.includes(req.method)) {
    return next();
  }
  
  // Skip health checks and non-API routes
  if (!req.path.startsWith('/api/') || req.path.includes('/health')) {
    return next();
  }
  
  // Capture original response.json to intercept response
  const originalJson = res.json.bind(res);
  let responseBody: any;
  
  res.json = function(body: any) {
    responseBody = body;
    return originalJson(body);
  };
  
  // Log after response is sent
  res.on('finish', async () => {
    try {
      const previousHash = await getLastAuditHash();
      
      // Extract resource information from path
      const pathParts = req.path.split('/').filter(Boolean);
      const resource = pathParts[2] || 'unknown'; // /api/v1/vehicles -> vehicles
      const resourceId = pathParts[3] || null;
      
      const eventData: Omit<InsertAuditEvent, 'hash'> = {
        requestId: context.requestId,
        actor: context.actor,
        action: `${req.method}_${resource.toUpperCase()}`,
        resource,
        resourceId,
        method: req.method,
        path: req.path,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        requestBody: sanitizeObject(req.body),
        responseStatus: res.statusCode,
        metadata: {
          query: req.query,
          params: req.params,
          responseTime: Date.now() - context.startTime,
          success: res.statusCode < 400
        },
        previousHash
      };
      
      const hash = computeAuditHash(eventData, previousHash);
      
      await storage.createAuditEvent({
        ...eventData,
        hash
      });
      
    } catch (error) {
      console.error('Auto-audit logging failed:', error);
    }
  });
  
  next();
}

// Verify audit log integrity
export async function verifyAuditIntegrity(startDate?: Date, endDate?: Date): Promise<{
  isValid: boolean;
  brokenChains: Array<{ eventId: string; expectedHash: string; actualHash: string }>;
  totalEvents: number;
}> {
  try {
    const events = await storage.getAuditEvents({
      startDate,
      endDate,
      limit: 10000 // Adjust based on performance needs
    });
    
    const brokenChains: Array<{ eventId: string; expectedHash: string; actualHash: string }> = [];
    let previousHash: string | null = null;
    
    for (const event of events) {
      const expectedHash = computeAuditHash(
        {
          requestId: event.requestId,
          actor: event.actor,
          action: event.action,
          resource: event.resource,
          resourceId: event.resourceId,
          method: event.method,
          path: event.path,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          requestBody: event.requestBody,
          responseStatus: event.responseStatus,
          metadata: event.metadata,
          previousHash
        },
        previousHash
      );
      
      if (event.hash !== expectedHash) {
        brokenChains.push({
          eventId: event.id,
          expectedHash,
          actualHash: event.hash
        });
      }
      
      previousHash = event.hash;
    }
    
    return {
      isValid: brokenChains.length === 0,
      brokenChains,
      totalEvents: events.length
    };
    
  } catch (error) {
    console.error('Audit integrity verification failed:', error);
    throw error;
  }
}