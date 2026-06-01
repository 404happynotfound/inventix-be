import { z } from 'zod';
import { registry } from '../../config/openapi';

const PengeluaranItemSchema = registry.register(
  'PengeluaranItem',
  z.object({
    id: z.number().int(),
    nomor_po: z.string(),
    tanggal_po: z.string().datetime(),
    supplier_nama: z.string(),
    supplier_id: z.number().int(),
    barang_nama: z.string(),
    barang_kode_sku: z.string(),
    jumlah_dipesan: z.number().int(),
    jumlah_diterima: z.number().int(),
    harga_satuan: z.number(),
    subtotal: z.number(),
    status: z.string(),
  })
);

export const PengeluaranListResponseSchema = registry.register(
  'PengeluaranListResponse',
  z.object({
    data: z.array(PengeluaranItemSchema),
    pagination: z.object({
      total: z.number().int(),
      page: z.number().int(),
      limit: z.number().int(),
      total_pages: z.number().int(),
    }),
    message: z.string(),
  })
);

export const PengeluaranSummarySchema = registry.register(
  'PengeluaranSummary',
  z.object({
    data: z.object({
      total_pengeluaran: z.number(),
      jumlah_transaksi: z.number(),
      rata_rata_pengeluaran: z.number(),
    }),
    message: z.string(),
  })
);

export const PengeluaranQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  id_supplier: z.coerce.number().int().optional(),
});

export const PengeluaranExportQuerySchema = z.object({
  format: z.enum(['csv']).default('csv'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  id_supplier: z.coerce.number().int().optional(),
});
