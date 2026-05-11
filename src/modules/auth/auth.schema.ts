import { z } from 'zod';
import { registry } from '../../config/openapi';
import { UserSchema } from '../user/user.schema';

export const RegisterRequestSchema = registry.register(
  'RegisterRequest',
  z.object({
    body: z.object({
      email: z.email().openapi({ example: 'user@example.com' }),
      password: z.string().min(6).openapi({ example: 'secret123' }),
      name: z.string().min(2).openapi({ example: 'John Doe' }),
    }),
  })
);

export const LoginRequestSchema = registry.register(
  'LoginRequest',
  z.object({
    body: z.object({
      email: z.email().openapi({ example: 'user@example.com' }),
      password: z.string().openapi({ example: 'secret123' }),
    }),
  })
);

export const AuthResponseSchema = registry.register(
  'AuthResponse',
  z.object({
    data: z.object({
      token: z.string(),
      user: UserSchema,
    }),
    message: z.string(),
  })
);
