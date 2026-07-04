import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('Security Regression Tests', () => {
  it('should enforce security headers via helmet', async () => {
    const res = await request(app).get('/api/health').catch(() => ({ headers: {} }));
    // We expect at least one security header from helmet (like X-DNS-Prefetch-Control or Content-Security-Policy)
    // If the route doesn't exist, it might 404, but helmet still sets headers
    const actualRes = await request(app).get('/api/not-found-route');
    expect(actualRes.headers['x-dns-prefetch-control']).toBe('off');
    expect(actualRes.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('should restrict unauthenticated AI access', async () => {
    const res = await request(app).post('/api/founder/analyze');
    // Expect 401 instead of proceeding to AI generation
    expect(res.status).toBe(401);
  });

  it('should apply rate limiting headers', async () => {
    const res = await request(app).get('/api/health'); // Assuming health route or a 404 route falls under general limiter
    // express-rate-limit should set RateLimit-Limit or similar (if standardHeaders: true is set)
    expect(res.headers).toHaveProperty('ratelimit-limit');
    expect(res.headers).toHaveProperty('ratelimit-remaining');
  });
});
