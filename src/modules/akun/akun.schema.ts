import { z } from 'zod';
import { registry } from '../../config/openapi';

export const PeranEnum = z.enum(['ADMIN', 'SUPPLIER', 'PEMBELI']);

export const AkunSchema = registry.register(
  'Akun',
  z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
    nama: z.string().openapi({ example: 'John Doe' }),
    email: z.string().email().openapi({ example: 'user@example.com' }),
    peran: PeranEnum.openapi({ example: 'PEMBELI' }),
    dibuat_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    diperbarui_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
  })
);

export type Akun = z.infer<typeof AkunSchema>;

export const CreateAkunSchema = registry.register(
  'CreateAkun',
  z.object({
    body: z.object({
      nama: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      peran: PeranEnum.default('PEMBELI'),
    }),
  })
);

export const UpdateAkunSchema = registry.register(
  'UpdateAkun',
  z.object({
    body: z.object({
      nama: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      peran: PeranEnum.optional(),
    }),
  })
);

export const AkunIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
  }),
});

export const AkunResponseSchema = z.object({
  data: AkunSchema,
  message: z.string(),
});

export const AkunListResponseSchema = z.object({
  data: z.array(AkunSchema),
  message: z.string(),
});
