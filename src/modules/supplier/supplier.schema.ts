import { z } from 'zod';
import { registry } from '../../config/openapi';

export const SupplierSchema = registry.register(
  'Supplier',
  z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
    nama: z.string().openapi({ example: 'Supplier PT Jaya Mandiri' }),
    alamat: z.string().nullable().openapi({ example: 'Jl. Industri No. 45, Jakarta' }),
    email: z.string().email().nullable().openapi({ example: 'supplier@jayamandiri.com' }),
    nomor_telepon: z.string().nullable().openapi({ example: '081234567890' }),
    deskripsi: z.string().nullable().openapi({ example: 'Penyedia bahan baku utama' }),
    user_id: z.number().int().openapi({ example: 2 }),
    dibuat_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    diperbarui_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
  })
);

export type Supplier = z.infer<typeof SupplierSchema>;

export const CreateSupplierSchema = registry.register(
  'CreateSupplier',
  z.object({
    body: z.object({
      nama: z.string().min(2),
      alamat: z.string().optional(),
      email: z.string().email().optional().nullable(),
      nomor_telepon: z.string().optional(),
      deskripsi: z.string().optional(),
      user_id: z.number().int(),
    }),
  })
);

export const UpdateSupplierSchema = registry.register(
  'UpdateSupplier',
  z.object({
    body: z.object({
      nama: z.string().min(2).optional(),
      alamat: z.string().optional(),
      email: z.string().email().optional().nullable(),
      nomor_telepon: z.string().optional(),
      deskripsi: z.string().optional(),
      user_id: z.number().int().optional(),
    }),
  })
);

export const SupplierIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
  }),
});

export const SupplierResponseSchema = z.object({
  data: SupplierSchema,
  message: z.string(),
});

export const SupplierListResponseSchema = z.object({
  data: z.array(SupplierSchema),
  message: z.string(),
});
