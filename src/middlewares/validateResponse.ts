import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '../utils/logger';

export const validateResponse = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;

    res.json = function (body) {
      // Validate only successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          schema.parse(body);
        } catch (error) {
          if (error instanceof ZodError) {
            const zodError = error as ZodError<any>;
            logger.error({
              msg: 'Response validation failed',
              path: req.path,
              method: req.method,
              issues: zodError.issues,
            });
            return originalSend.call(this, {
              message: 'Internal Server Error - Response Contract Violation',
              error: {
                code: 'RESPONSE_VALIDATION_ERROR',
                details: zodError.issues.map((e: any) => ({
                  field: e.path.join('.'),
                  issue: e.message,
                })),
              },
            });
          }
        }
      }
      return originalSend.call(this, body);
    };

    next();
  };
};