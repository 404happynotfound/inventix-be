import { z } from 'zod';
import { registry } from '../../config/openapi';

export const JenisTransaksiEnum = z.enum(['masuk', 'keluar', 'lainnya']);

export const TransaksiStokSchema = registry.register(
  'TransaksiStok',
  z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
    akun_id: z.number().int().openapi({ example: 1 }),
    stok_id: z.number().int().openapi({ example: 1 }),
    detail_po_id: z.number().int().nullable().optional().openapi({ example: null }),
    jenis: JenisTransaksiEnum.openapi({ example: 'masuk' }),
    jumlah: z.number().int().openapi({ example: 10 }),
    jumlah_sebelum: z.number().int().openapi({ example: 50 }),
    jumlah_sesudah: z.number().int().openapi({ example: 60 }),
    dibuat_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    akun: z.object({
      id: z.number(),
      nama: z.string(),
      email: z.string(),
    }).optional(),
    stok: z.object({
      id: z.number(),
      nama: z.string(),
      kode_sku: z.string(),
    }).optional(),
  })
);

export type TransaksiStok = z.infer<typeof TransaksiStokSchema>;

export const CreateTransaksiStokSchema = registry.register(
  'CreateTransaksiStok',
  z.object({
    body: z.object({
      stok_id: z.number().int(),
      jenis: JenisTransaksiEnum,
      jumlah: z.number().int().positive(),
      detail_po_id: z.number().int().optional().nullable(),
    }),
  })
);

export const TransaksiStokIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
  }),
});

export const TransaksiStokResponseSchema = z.object({
  data: TransaksiStokSchema,
  message: z.string(),
});

export const TransaksiStokListResponseSchema = z.object({
  data: z.array(TransaksiStokSchema),
  message: z.string(),
});

export const CreateTransaksiStokBulkSchema = registry.register(
  'CreateTransaksiStokBulk',
  z.object({
    body: z.object({
      transaksi: z.array(
        z.object({
          stok_id: z.number().int().openapi({ example: 1 }),
          jenis: JenisTransaksiEnum.openapi({ example: 'keluar' }),
          jumlah: z.number().int().positive().openapi({ example: 5 }),
          detail_po_id: z.number().int().optional().nullable().openapi({ example: null }),
        })
      ).nonempty().openapi({ description: 'Array of transactions to execute atomically' }),
    }),
  })
);

export const TransaksiStokBulkResponseSchema = z.object({
  data: z.array(TransaksiStokSchema),
  message: z.string(),
});

