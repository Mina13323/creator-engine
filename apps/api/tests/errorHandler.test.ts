import { describe, it, expect, vi } from 'vitest';
import { errorHandler, AppError } from '../src/errorHandler';
import { ZodError } from 'zod';

describe('Error Handler Middleware', () => {
  const mockRequest = {} as any;
  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as any;
  const mockNext = vi.fn();

  it('should handle AppError correctly', () => {
    const error = new AppError('Test Error', 404, 'NOT_FOUND');
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Test Error'
      }
    });
  });

  it('should handle ZodError correctly', () => {
    const error = new ZodError([]);
    (error as any).errors = [{ code: 'custom', message: 'Invalid field', path: ['email'] }];
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: 'VALIDATION_ERROR',
        details: [{ path: 'email', message: 'Invalid field' }]
      })
    }));
  });

  it('should handle MongoServerError duplicate key correctly', () => {
    const error = new Error('E11000 duplicate key');
    error.name = 'MongoServerError';
    (error as any).code = 11000;
    
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'DUPLICATE_ENTRY'
      })
    }));
  });

  it('should handle AI provider errors correctly', () => {
    const error = new Error('Fireworks engine failed');
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(502);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'AI_PROVIDER_ERROR'
      })
    }));
  });
});
