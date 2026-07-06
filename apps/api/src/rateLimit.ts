import rateLimit from 'express-rate-limit';
import { env } from './env';

// General endpoints rate limiter (e.g., getting states, projects)
export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 10000 : env.RATE_LIMIT_MAX_GENERAL,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.'
  }
});

// Authentication endpoints rate limiter (e.g., login, signup)
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 10000 : env.RATE_LIMIT_MAX_AUTH,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.'
  }
});

// AI generation endpoints rate limiter (aggressively protected)
export const aiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_AI,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI generations requested. Please wait before trying again.'
  }
});
