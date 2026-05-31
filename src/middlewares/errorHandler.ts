import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../../generated/prisma';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Hanya log ke logger pusat jika ini BUKAN AppError (error sistem/tidak terduga)
  // AppError sudah ditangani oleh httpLogger (pino-http) sehingga tidak double log
  if (!(err instanceof AppError)) {
    logger.error({
      msg: err.message || 'Unexpected Error',
      stack: err.stack,
      ...(err.details && { details: err.details }),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      message: err.message,
      error: {
        code: err.code,
        details: err.details,
      },
    });
  }

  if (err instanceof ZodError) {
    const zodError = err as ZodError<any>;
    return res.status(400).json({
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: zodError.issues.map((e: any) => ({
          field: e.path.join('.'),
          issue: e.message,
        })),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'Conflict',
        error: {
          code: 'UNIQUE_CONSTRAINT_FAILED',
          details: [{ issue: `Unique constraint failed on the fields: ${(err.meta?.target as string[])?.join(', ')}` }],
        },
      });
    }
  }

  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    message,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      details: err.details || [],
    },
  });
};