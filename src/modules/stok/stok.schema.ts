import { z } from 'zod';
import { registry } from '../../config/openapi';

export const StokSchema = registry.register(
  'Stok',
  z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
    nama: z.string().openapi({ example: 'Kabel UTP Cat6' }),
    kode_sku: z.string().openapi({ example: 'SKU-UTP-6-001' }),
    klasifikasi_id: z.number().int().openapi({ example: 1 }),
    supplier_id: z.number().int().openapi({ example: 1 }),
    satuan: z.string().openapi({ example: 'Meter' }),
    jumlah_saat_ini: z.number().int().openapi({ example: 100 }),
    tanggal_kedaluwarsa: z.string().datetime().nullable().optional().openapi({ example: '2027-12-31T00:00:00Z' }),
    dibuat_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    diperbarui_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    klasifikasi: z.object({
      id: z.number(),
      jenis: z.string(),
    }).optional(),
    supplier: z.object({
      id: z.number(),
      nama: z.string(),
    }).optional(),
  })
);

export type Stok = z.infer<typeof StokSchema>;

export const CreateStokSchema = registry.register(
  'CreateStok',
  z.object({
    body: z.object({
      nama: z.string().min(2),
      kode_sku: z.string().min(2),
      klasifikasi_id: z.number().int(),
      supplier_id: z.number().int(),
      satuan: z.string().min(1),
      jumlah_saat_ini: z.number().int().default(0),
      tanggal_kedaluwarsa: z.string().datetime().optional().nullable(),
    }),
  })
);

export const UpdateStokSchema = registry.register(
  'UpdateStok',
  z.object({
    body: z.object({
      nama: z.string().min(2).optional(),
      kode_sku: z.string().min(2).optional(),
      klasifikasi_id: z.number().int().optional(),
      supplier_id: z.number().int().optional(),
      satuan: z.string().min(1).optional(),
      jumlah_saat_ini: z.number().int().optional(),
      tanggal_kedaluwarsa: z.string().datetime().optional().nullable(),
    }),
  })
);

export const StokIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
  }),
});

export const StokResponseSchema = z.object({
  data: StokSchema,
  message: z.string(),
});

export const StokListResponseSchema = z.object({
  data: z.array(StokSchema),
  message: z.string(),
});
