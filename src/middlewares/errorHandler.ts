import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../../generated/prisma';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

const translateZodIssue = (e: any): string => {
  switch (e.code) {
    case 'invalid_type':
      if (e.received === 'undefined') {
        return 'Wajib diisi';
      }
      return `Tipe tidak valid: diharapkan ${e.expected}, tetapi menerima ${e.received}`;
    case 'too_small':
      if (e.type === 'string') {
        return `Minimal harus ${e.minimum} karakter`;
      }
      if (e.type === 'number') {
        return `Nilai minimal adalah ${e.minimum}`;
      }
      return `Ukuran minimal adalah ${e.minimum}`;
    case 'too_big':
      if (e.type === 'string') {
        return `Maksimal harus ${e.maximum} karakter`;
      }
      if (e.type === 'number') {
        return `Nilai maksimal adalah ${e.maximum}`;
      }
      return `Ukuran maksimal adalah ${e.maximum}`;
    case 'invalid_string':
      if (e.validation === 'email') {
        return 'Format email tidak valid';
      }
      if (e.validation === 'url') {
        return 'Format URL tidak valid';
      }
      return 'Format tidak valid';
    case 'invalid_enum_value':
      return `Nilai tidak valid. Harus salah satu dari: ${e.options?.join(', ')}`;
    case 'custom':
      return e.message;
    default:
      return e.message || 'Validasi gagal';
  }
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Hanya log ke logger pusat jika ini BUKAN AppError (error sistem/tidak terduga)
  // AppError sudah ditangani oleh httpLogger (pino-http) sehingga tidak double log
  if (!(err instanceof AppError)) {
    logger.error({
      msg: err.message || 'Kesalahan tidak terduga',
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
      message: 'Validasi gagal',
      error: {
        code: 'VALIDATION_ERROR',
        details: zodError.issues.map((e: any) => ({
          field: e.path.join('.'),
          issue: translateZodIssue(e),
        })),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'Konflik',
        error: {
          code: 'UNIQUE_CONSTRAINT_FAILED',
          details: [{ issue: `Pelanggaran batas keunikan pada field: ${(err.meta?.target as string[])?.join(', ')}` }],
        },
      });
    }
  }

  const statusCode = err.status || 500;
  const message = err.message || 'Kesalahan Server Internal';

  return res.status(statusCode).json({
    message,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      details: err.details || [],
    },
  });
};