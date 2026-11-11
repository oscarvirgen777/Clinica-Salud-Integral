import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Error interno del servidor';

  console.error(`[ERROR] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

// Helper para lanzar errores con status code
export function httpError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}   