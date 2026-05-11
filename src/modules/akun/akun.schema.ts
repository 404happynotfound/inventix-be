import { z } from 'zod';
import { registry } from '../../config/openapi';

export const UserSchema = registry.register(
  'User',
  z.object({
    id: z.number().openapi({ example: 1 }),
    email: z.email().openapi({ example: 'user@example.com' }),
    name: z.string().openapi({ example: 'John Doe' }),
    createdAt: z.iso.datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    updatedAt: z.iso.datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
  })
);

export type User = z.infer<typeof UserSchema>;

export const GetUserResponseSchema = z.object({
  data: UserSchema,
  message: z.string(),
});
