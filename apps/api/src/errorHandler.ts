import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = err.issues.map((e: any) => ({ path: e.path.join('.'), message: e.message }));
  } else if (err.name === 'MongoServerError' || err.name === 'ValidationError' || err.name === 'CastError') {
    statusCode = 500;
    code = 'DATABASE_ERROR';
    message = 'A database operation failed';
    if (err.code === 11000) {
      statusCode = 409;
      code = 'DUPLICATE_ENTRY';
      message = 'A resource with that unique field already exists';
    }
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid or expired authentication token';
  } else if (err.message && err.message.toLowerCase().includes('fireworks')) {
    statusCode = 502;
    code = 'AI_PROVIDER_ERROR';
    message = 'The AI provider failed to process the request';
  } else if (err.message) {
    // For standard unhandled errors, log the details internally but return generic response to client
    // unless it's safe to bubble up (like auth or specific operational errors).
    // We intentionally don't assign err.message to 'message' variable to prevent leaking stack details.
    console.error(`[Unhandled Error]`, err);
  } else {
    console.error(`[Unknown Error]`, err);
  }

  // Always log to console for internal visibility
  if (!(err instanceof AppError && err.statusCode < 500)) {
    Sentry.captureException(err, {
      tags: {
        error_code: code,
        is_database_error: code === 'DATABASE_ERROR' ? 'true' : 'false',
        ai_provider: code === 'AI_PROVIDER_ERROR' ? 'fireworks' : 'none'
      }
    });
    console.error(`[Error] ${code}: ${err.message || err}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  });
};
