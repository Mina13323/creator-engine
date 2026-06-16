import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  FIREWORKS_API_KEY: z.string().min(1, 'FIREWORKS_API_KEY is required'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
  
  // Rate Limiting (environment driven)
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_GENERAL: z.coerce.number().default(100),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().default(20),
  RATE_LIMIT_MAX_AI: z.coerce.number().default(500),
  
  PORT: z.string().default('5000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
