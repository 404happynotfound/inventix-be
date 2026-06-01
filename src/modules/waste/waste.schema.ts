import { z } from 'zod';
import { registry } from '../../config/openapi';

export const WasteSchema = registry.register(
  'Waste',
  z.object({
    id: z.number().int().openapi({ example: 1 }),
    id_barang: z.number().int().openapi({ example: 1 }),
    id_akun: z.number().int().openapi({ example: 1 }),
    jumlah_terbuang: z.number().int().openapi({ example: 5 }),
    estimasi_kerugian: z.number().openapi({ example: 50000 }),
    tanggal_waste: z.string().openapi({ example: '2023-01-01' }),
    keterangan: z.string().optional().openapi({ example: 'Rusak karena pengiriman' }),
    dibuat_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    barang: z.object({
      id: z.number(),
      nama: z.string(),
      kode_sku: z.string(),
    }).optional(),
    akun: z.object({
      id: z.number(),
      nama: z.string(),
    }).optional(),
  })
);

export const WasteListResponseSchema = registry.register(
  'WasteListResponse',
  z.object({
    data: z.array(WasteSchema),
    pagination: z.object({
      total: z.number().int(),
      page: z.number().int(),
      limit: z.number().int(),
      total_pages: z.number().int(),
    }),
    message: z.string(),
  })
);

export const WasteResponseSchema = registry.register(
  'WasteResponse',
  z.object({
    data: WasteSchema,
    message: z.string(),
  })
);

export const CreateWasteSchema = registry.register(
  'CreateWaste',
  z.object({
    body: z.object({
      id_barang: z.number().int(),
      jumlah_terbuang: z.number().int().positive(),
      keterangan: z.string().optional(),
    }),
  })
);

export const WasteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).openapi({ example: 1 }),
  limit: z.coerce.number().int().positive().default(10).openapi({ example: 10 }),
  search: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export const WasteExportQuerySchema = z.object({
  format: z.enum(['csv']).default('csv'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});
