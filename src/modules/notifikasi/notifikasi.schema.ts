import { z } from 'zod';
import { registry } from '../../config/openapi';

export const NotifikasiSchema = registry.register(
  'Notifikasi',
  z.object({
    id: z.number().int().openapi({ example: 1 }),
    id_barang: z.number().int().openapi({ example: 1 }),
    // Menambahkan 'approval' ke dalam enum jenis_notif
    jenis_notif: z.enum(['stok_minimum', 'kadaluwarsa', 'approval']).openapi({ example: 'approval' }),
    pesan: z.string().openapi({ example: 'Stok minimal untuk produk X' }),
    is_read: z.boolean().openapi({ example: false }),
    dibuat_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    barang: z.object({
      id: z.number(),
      nama: z.string(),
      kode_sku: z.string(),
    }).optional(),
  })
);

export const NotifikasiListResponseSchema = registry.register(
  'NotifikasiListResponse',
  z.object({
    data: z.array(NotifikasiSchema),
    pagination: z.object({
      total: z.number().int(),
      page: z.number().int(),
      limit: z.number().int(),
      total_pages: z.number().int(),
    }),
    message: z.string(),
  })
);

export const NotifikasiResponseSchema = registry.register(
  'NotifikasiResponse',
  z.object({
    data: NotifikasiSchema,
    message: z.string(),
  })
);

export const NotifikasiQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).openapi({ example: 1 }),
  limit: z.coerce.number().int().positive().default(10).openapi({ example: 10 }),
  is_read: z.coerce.boolean().optional().openapi({ example: false }),
  // Menambahkan 'approval' ke dalam opsi query pencarian
  jenis: z.enum(['stok_minimum', 'kadaluwarsa', 'approval']).optional().openapi({ example: 'approval' }),
});

export const MarkNotifikasiReadSchema = registry.register(
  'MarkNotifikasiRead',
  z.object({
    body: z.object({}).optional(),
  })
);

export const CheckNotifikasiSchema = registry.register(
  'CheckNotifikasi',
  z.object({
    body: z.object({}).optional(),
  })
);