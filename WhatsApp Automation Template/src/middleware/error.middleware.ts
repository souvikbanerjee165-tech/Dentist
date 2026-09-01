import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errorCode: string;

  constructor(message: string, statusCode: number = 500, errorCode: string = 'InternalError') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = (err as AppError).statusCode || 500;
  const errorCode = (err as AppError).errorCode || 'InternalServerError';

  // Log error with request ID and method
  console.error(`❌ [${req.method}] ${req.originalUrl} - Error:`, err.message);

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred.',
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
};
