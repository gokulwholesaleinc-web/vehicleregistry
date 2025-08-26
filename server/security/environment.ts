import { z } from 'zod';
import { config } from 'dotenv';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  DATABASE_URL: z.string().url().min(1, 'Database URL is required'),
  
  // Security requirements
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  
  // Optional environment variables
  FRONTEND_BASE: z.string().url().optional(),
  REPLIT_HOST: z.string().optional(),
  REPLIT_DOMAINS: z.string().optional(),
  
  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),
  
  // CORS settings
  CORS_ALLOWED_ORIGINS: z.string().optional(),
});

let validatedEnv: z.infer<typeof envSchema>;

export function validateEnvironment() {
  // Load environment variables
  config();
  
  try {
    validatedEnv = envSchema.parse(process.env);
    console.log('✅ Environment validation successful');
    
    // Additional security checks
    if (validatedEnv.NODE_ENV === 'production') {
      if (!validatedEnv.JWT_SECRET) {
        throw new Error('JWT_SECRET is required in production');
      }
      
      if (validatedEnv.SESSION_SECRET.length < 64) {
        console.warn('⚠️  Consider using a longer session secret in production (64+ characters)');
      }
    }
    
    return validatedEnv;
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    process.exit(1);
  }
}

export function getEnv(): z.infer<typeof envSchema> {
  if (!validatedEnv) {
    return validateEnvironment();
  }
  return validatedEnv;
}

export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}