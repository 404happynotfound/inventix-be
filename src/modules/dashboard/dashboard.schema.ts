import { z } from 'zod';
import { registry } from '../../config/openapi';

export const DashboardSummarySchema = registry.register(
  'DashboardSummary',
  z.object({
    data: z.object({
      total_barang: z.number().int(),
      total_supplier: z.number().int(),
      total_stok_value: z.number(),
      stok_rendah_count: z.number().int(),
      barang_kadaluwarsa: z.number().int(),
    }),
    message: z.string(),
  })
);

export const TrenPengeluaranSchema = registry.register(
  'TrenPengeluaran',
  z.object({
    data: z.array(z.object({
      periode: z.string(),
      total_pengeluaran: z.number(),
      jumlah_transaksi: z.number(),
    })),
    message: z.string(),
  })
);

export const StokRendahSchema = registry.register(
  'StokRendah',
  z.object({
    data: z.array(z.object({
      id: z.number().int(),
      nama: z.string(),
      kode_sku: z.string(),
      jumlah_saat_ini: z.number().int(),
      supplier_nama: z.string(),
    })),
    pagination: z.object({
      total: z.number().int(),
      page: z.number().int(),
      limit: z.number().int(),
      total_pages: z.number().int(),
    }),
    message: z.string(),
  })
);

export const KadaluarsaSchema = registry.register(
  'Kadaluarsa',
  z.object({
    data: z.array(z.object({
      id: z.number().int(),
      nama: z.string(),
      kode_sku: z.string(),
      tanggal_kedaluwarsa: z.string().datetime(),
      hari_tersisa: z.number().int(),
      jumlah_saat_ini: z.number().int(),
    })),
    pagination: z.object({
      total: z.number().int(),
      page: z.number().int(),
      limit: z.number().int(),
      total_pages: z.number().int(),
    }),
    message: z.string(),
  })
);

export const WasteSummarySchema = registry.register(
  'WasteSummary',
  z.object({
    data: z.array(z.object({
      periode: z.string(),
      total_waste: z.number(),
      estimasi_kerugian: z.number(),
      jumlah_barang_terbuang: z.number().int(),
    })),
    message: z.string(),
  })
);

export const DashboardQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  periode: z.enum(['daily', 'weekly', 'monthly']).optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  days: z.coerce.number().int().default(7),
});
