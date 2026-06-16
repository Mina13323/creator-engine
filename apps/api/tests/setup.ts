import { vi } from 'vitest';

// Mock mongoose
vi.mock('mongoose', () => {
  return {
    connect: vi.fn().mockResolvedValue(true),
    default: {
      connect: vi.fn().mockResolvedValue(true),
    }
  };
});

// Mock database models so they don't crash
vi.mock('@creator/database', () => {
  return {
    connectDB: vi.fn().mockResolvedValue(true),
    User: { modelName: 'User', findOne: vi.fn(), create: vi.fn() },
    Project: { modelName: 'Project', findOne: vi.fn(), create: vi.fn() },
    VentureState: { modelName: 'VentureState', findOne: vi.fn(), create: vi.fn() },
  };
});

// Mock Sentry
vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  setupExpressErrorHandler: vi.fn(),
}));

// Set dummy env variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test_secret';
process.env.FIREWORKS_API_KEY = 'test_fireworks';
process.env.GOOGLE_CLIENT_ID = 'test_google';
process.env.GOOGLE_CLIENT_SECRET = 'test_google_sec';
process.env.SESSION_SECRET = 'test_session';
process.env.NODE_ENV = 'test';
