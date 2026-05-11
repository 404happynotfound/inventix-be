import { registry } from '../config/openapi';
import { z } from 'zod';

export interface RouteConfig {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  tags?: string[];
  summary?: string;
  description?: string;
  request?: {
    body?: z.ZodObject<any>;
    params?: z.ZodObject<any>;
    query?: z.ZodObject<any>;
  };
  responses: {
    [statusCode: number]: {
      description: string;
      schema?: z.ZodTypeAny;
    };
  };
  protected?: boolean;
}

/**
 * Helper untuk mendaftarkan route ke OpenAPI documentation secara semi-otomatis.
 */
export const registerRoute = (config: RouteConfig) => {
  registry.registerPath({
    method: config.method,
    path: config.path,
    tags: config.tags,
    summary: config.summary,
    description: config.description,
    security: config.protected ? [{ bearerAuth: [] }] : undefined,
    request: {
      body: config.request?.body ? {
        content: {
          'application/json': {
            // Jika schema memiliki properti 'body', ambil isinya saja untuk dokumentasi body
            schema: config.request.body.shape.body || config.request.body,
          },
        },
      } : undefined,
      params: config.request?.params?.shape.params || config.request?.params,
      query: config.request?.query?.shape.query || config.request?.query,
    },
    responses: Object.fromEntries(
      Object.entries(config.responses).map(([code, res]) => [
        code,
        {
          description: res.description,
          content: res.schema ? { 'application/json': { schema: res.schema } } : undefined,
        },
      ])
    ),
  });
};
