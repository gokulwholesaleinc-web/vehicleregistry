import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { verifyAuditIntegrity } from './auditLogger';
import { AuditEvent } from '@shared/schema';

const router = Router();

// Note: Admin middleware (isAdminJWT) should be applied when mounting this router

// Get audit events with filtering and pagination  
router.get('/events', async (req, res) => {
  try {
    const query = z.object({
      actor: z.string().optional(),
      action: z.string().optional(),
      resource: z.string().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
      offset: z.string().regex(/^\d+$/).transform(Number).default('0')
    }).parse(req.query);
    
    const events = await storage.getAuditEvents({
      actor: query.actor,
      action: query.action,
      resource: query.resource,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: Math.min(query.limit, 1000), // Cap at 1000 for performance
      offset: query.offset
    });
    
    const totalCount = await storage.getAuditEventCount({
      actor: query.actor,
      action: query.action,
      resource: query.resource,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined
    });
    
    res.json({
      ok: true,
      data: {
        events,
        pagination: {
          total: totalCount,
          limit: query.limit,
          offset: query.offset,
          hasNext: query.offset + query.limit < totalCount
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching audit events:', error);
    res.status(500).json({
      ok: false,
      error: { message: 'Failed to fetch audit events' }
    });
  }
});

// Get specific audit event
router.get('/events/:id', async (req, res) => {
  try {
    const event = await storage.getAuditEvent(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        ok: false,
        error: { message: 'Audit event not found' }
      });
    }
    
    res.json({
      ok: true,
      data: event
    });
    
  } catch (error) {
    console.error('Error fetching audit event:', error);
    res.status(500).json({
      ok: false,
      error: { message: 'Failed to fetch audit event' }
    });
  }
});

// Verify audit log integrity
router.post('/verify', async (req, res) => {
  try {
    const body = z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional()
    }).parse(req.body);
    
    const result = await verifyAuditIntegrity(
      body.startDate ? new Date(body.startDate) : undefined,
      body.endDate ? new Date(body.endDate) : undefined
    );
    
    res.json({
      ok: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error verifying audit integrity:', error);
    res.status(500).json({
      ok: false,
      error: { message: 'Failed to verify audit integrity' }
    });
  }
});

// Get audit statistics
router.get('/stats', async (req, res) => {
  try {
    const query = z.object({
      days: z.string().regex(/^\d+$/).transform(Number).default('7')
    }).parse(req.query);
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - query.days);
    
    const events = await storage.getAuditEvents({
      startDate,
      endDate,
      limit: 10000
    });
    
    // Calculate statistics
    const stats = {
      totalEvents: events.length,
      actorCounts: {} as Record<string, number>,
      actionCounts: {} as Record<string, number>,
      resourceCounts: {} as Record<string, number>,
      dailyCounts: {} as Record<string, number>,
      errorCounts: 0,
      successCounts: 0
    };
    
    events.forEach((event: AuditEvent) => {
      // Actor stats
      stats.actorCounts[event.actor] = (stats.actorCounts[event.actor] || 0) + 1;
      
      // Action stats
      stats.actionCounts[event.action] = (stats.actionCounts[event.action] || 0) + 1;
      
      // Resource stats
      stats.resourceCounts[event.resource] = (stats.resourceCounts[event.resource] || 0) + 1;
      
      // Daily stats
      const day = event.timestamp.toISOString().split('T')[0];
      stats.dailyCounts[day] = (stats.dailyCounts[day] || 0) + 1;
      
      // Success/error stats
      if (event.responseStatus && event.responseStatus >= 400) {
        stats.errorCounts++;
      } else {
        stats.successCounts++;
      }
    });
    
    res.json({
      ok: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({
      ok: false,
      error: { message: 'Failed to fetch audit statistics' }
    });
  }
});

// Export audit data (CSV format)
router.get('/export', async (req, res) => {
  try {
    const query = z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      format: z.enum(['csv', 'json']).default('csv')
    }).parse(req.query);
    
    const events = await storage.getAuditEvents({
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: 50000 // Large export limit
    });
    
    if (query.format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.json"`);
      return res.json(events);
    }
    
    // CSV format
    const csvHeaders = [
      'ID', 'Timestamp', 'Request ID', 'Actor', 'Action', 'Resource', 'Resource ID',
      'Method', 'Path', 'IP Address', 'Response Status', 'Hash'
    ];
    
    const csvRows = events.map((event: AuditEvent) => [
      event.id,
      event.timestamp.toISOString(),
      event.requestId,
      event.actor,
      event.action,
      event.resource,
      event.resourceId || '',
      event.method,
      event.path,
      event.ipAddress || '',
      event.responseStatus || '',
      event.hash
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: any[]) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting audit data:', error);
    res.status(500).json({
      ok: false,
      error: { message: 'Failed to export audit data' }
    });
  }
});

export default router;