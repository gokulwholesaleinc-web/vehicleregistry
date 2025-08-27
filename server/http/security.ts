import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { getEnv, isDevelopment } from '../security/environment';
import { enforceVINUniqueness, vinTransferGuard } from '../security/vinSecurity';

function buildAllowlist() {
  const env = getEnv();
  const list = new Set<string>();
  
  // Environment-based origins
  if (env.FRONTEND_BASE) list.add(env.FRONTEND_BASE);
  if (env.REPLIT_HOST) {
    list.add(`https://${env.REPLIT_HOST}`);
    list.add(`http://${env.REPLIT_HOST}`);
  }
  
  // Replit domains (comma-separated list)
  if (env.REPLIT_DOMAINS) {
    env.REPLIT_DOMAINS.split(',').forEach(domain => {
      const trimmedDomain = domain.trim();
      if (trimmedDomain) {
        list.add(`https://${trimmedDomain}`);
        list.add(`http://${trimmedDomain}`);
      }
    });
  }
  
  // Custom CORS origins from environment
  if (env.CORS_ALLOWED_ORIGINS) {
    env.CORS_ALLOWED_ORIGINS.split(',').forEach(origin => {
      list.add(origin.trim());
    });
  }
  
  // Development origins
  if (isDevelopment()) {
    list.add('http://localhost:5173');
    list.add('http://127.0.0.1:5173');
    list.add('http://localhost:5000');
    list.add('http://127.0.0.1:5000');
  }
  
  return Array.from(list);
}

export function applySecurity(app: Express) {
  const env = getEnv();
  const isDev = isDevelopment();
  
  // Compression for better performance
  app.use(compression());
  
  // Request logging (less verbose in production)
  app.use(morgan(isDev ? 'dev' : 'combined'));
  
  // Enhanced Helmet configuration
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Fix favicon and static asset CORP warnings
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'sameorigin' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: false, // Disabled as modern browsers handle this
    
    contentSecurityPolicy: isDev ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com", "https://apis.google.com", "https://replit.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:", "https://*.gstatic.com", "https://accounts.google.com"],
        connectSrc: ["'self'", "wss:", "ws:", "https://accounts.google.com", "https://apis.google.com"],
        frameSrc: ["'self'", "https://accounts.google.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        scriptSrcAttr: ["'none'"]
      }
    } : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    }
  }));
  
  // Enhanced CORS configuration
  const allowlist = buildAllowlist();
  
  app.use(cors({
    origin(origin, cb) {
      // Allow same-origin requests (no origin header)
      if (!origin) return cb(null, true);
      
      // Check allowlist
      const isAllowed = allowlist.some(allowed => {
        // Support wildcards for subdomains
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return allowed === origin;
      });
      
      if (isAllowed) {
        return cb(null, true);
      }
      
      console.warn(`🚫 CORS blocked: ${origin} not in allowlist:`, allowlist);
      return cb(new Error(`CORS policy violation: Origin ${origin} not allowed`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    credentials: true,
    maxAge: 86400, // 24 hours preflight cache
    optionsSuccessStatus: 200 // Legacy browsers support
  }));
  
  // Rate limiting - more aggressive in production
  const rateLimitConfig = {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      ok: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests in development
    skip: isDev ? (req: any, res: any) => res.statusCode < 400 : undefined
  };
  
  // Global rate limiter
  app.use('/api/', rateLimit(rateLimitConfig));
  
  // Stricter rate limiting for auth endpoints
  app.use('/api/auth/', rateLimit({
    ...rateLimitConfig,
    max: Math.floor(env.RATE_LIMIT_MAX_REQUESTS / 5), // 1/5 of normal limit
    message: {
      ok: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later'
      }
    }
  }));
  
  // VIN security middleware
  app.use('/api/', enforceVINUniqueness);
  app.use('/api/', vinTransferGuard);
  
  // Security headers middleware
  app.use((req, res, next) => {
    // Additional security headers
    res.setHeader('X-Request-ID', req.headers['x-request-id'] || 'unknown');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
    
    // Remove server fingerprinting
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    next();
  });
  
  // Preflight for all routes
  app.options('*', cors());
  
  console.log('🔒 Security middleware applied:', {
    environment: env.NODE_ENV,
    corsOrigins: allowlist.length,
    rateLimitWindow: `${env.RATE_LIMIT_WINDOW_MS}ms`,
    rateLimitMax: env.RATE_LIMIT_MAX_REQUESTS
  });
}