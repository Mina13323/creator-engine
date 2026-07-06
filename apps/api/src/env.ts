import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return value;
}, z.boolean());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
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

  // Production payment/storage providers
  PAYMOB_API_KEY: z.string().optional(),
  PAYMOB_HMAC: z.string().optional(),
  PAYMOB_INTEGRATION_ID: z.string().optional(),
  PAYMOB_IFRAME_ID: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Weekly report and content flag email delivery
  WEEKLY_REPORT_ENABLED: booleanFromEnv.default(false),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: booleanFromEnv.default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  WEEKLY_REPORT_RECIPIENTS: z.string().optional(),
  CONTENT_FLAG_ALERT_RECIPIENTS: z.string().optional(),
  WEEKLY_REPORT_CHECK_INTERVAL_MS: z.coerce.number().default(60 * 60 * 1000),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
