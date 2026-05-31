import { z } from 'zod';
import { registry } from '../../config/openapi';

export const StatusPOEnum = z.enum([
  'DRAFT',
  'MENUNGGU_PERSETUJUAN',
  'DISETUJUI',
  'DITOLAK',
  'DIKIRIM',
  'SELESAI',
  'DIBATALKAN'
]);

export const StatusSupplierPOEnum = z.enum([
  'MENUNGGU_KONFIRMASI',
  'DIKONFIRMASI',
  'DITOLAK'
]);

export const DetailPOInputSchema = z.object({
  stok_id: z.number().int(),
  jumlah_dipesan: z.number().int().positive(),
  harga_satuan: z.number().int().positive(),
  jumlah_diterima: z.number().int().default(0),
});

export const DetailPOSchema = z.object({
  id: z.number().int(),
  po_id: z.number().int(),
  stok_id: z.number().int(),
  jumlah_dipesan: z.number().int(),
  jumlah_diterima: z.number().int(),
  harga_satuan: z.number().int(),
  dibuat_pada: z.string().datetime(),
  stok: z.object({
    id: z.number(),
    nama: z.string(),
    kode_sku: z.string(),
  }).optional(),
});

export const PurchaseOrderSchema = registry.register(
  'PurchaseOrder',
  z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
    nomor_po: z.string().openapi({ example: 'PO-20260530-0001' }),
    dibuat_oleh: z.number().int().openapi({ example: 1 }),
    disetujui_oleh: z.number().int().nullable().openapi({ example: null }),
    supplier_id: z.number().int().openapi({ example: 1 }),
    status: StatusPOEnum.openapi({ example: 'DRAFT' }),
    status_supplier: StatusSupplierPOEnum.openapi({ example: 'MENUNGGU_KONFIRMASI' }),
    total_nilai: z.string().openapi({ example: '1500000' }), // Stringified BigInt in JSON representation
    tanggal_po: z.string().datetime().openapi({ example: '2026-05-30T00:00:00Z' }),
    tanggal_disetujui: z.string().datetime().nullable().openapi({ example: null }),
    tanggal_konfirmasi_supplier: z.string().datetime().nullable().openapi({ example: null }),
    tanggal_kedatangan: z.string().datetime().nullable().openapi({ example: null }),
    catatan: z.string().nullable().openapi({ example: 'Segera kirim' }),
    dibuat_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    diperbarui_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    detail_po: z.array(DetailPOSchema).optional(),
    pembuat: z.object({
      id: z.number(),
      nama: z.string(),
    }).optional(),
    supplier: z.object({
      id: z.number(),
      nama: z.string(),
    }).optional(),
  })
);

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;

export const CreatePurchaseOrderSchema = registry.register(
  'CreatePurchaseOrder',
  z.object({
    body: z.object({
      nomor_po: z.string().optional(),
      supplier_id: z.number().int(),
      catatan: z.string().optional(),
      detail_po: z.array(DetailPOInputSchema).min(1),
    }),
  })
);

export const UpdatePurchaseOrderSchema = registry.register(
  'UpdatePurchaseOrder',
  z.object({
    body: z.object({
      supplier_id: z.number().int().optional(),
      status: StatusPOEnum.optional(),
      status_supplier: StatusSupplierPOEnum.optional(),
      disetujui_oleh: z.number().int().optional().nullable(),
      tanggal_disetujui: z.string().datetime().optional().nullable(),
      tanggal_konfirmasi_supplier: z.string().datetime().optional().nullable(),
      tanggal_kedatangan: z.string().datetime().optional().nullable(),
      catatan: z.string().optional(),
      detail_po: z.array(z.object({
        id: z.number().int().optional(), // If provided, update. If omitted, create.
        stok_id: z.number().int(),
        jumlah_dipesan: z.number().int().positive(),
        harga_satuan: z.number().int().positive(),
        jumlah_diterima: z.number().int().default(0),
      })).optional(),
    }),
  })
);

export const PurchaseOrderIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
  }),
});

export const PurchaseOrderResponseSchema = z.object({
  data: PurchaseOrderSchema,
  message: z.string(),
});

export const PurchaseOrderListResponseSchema = z.object({
  data: z.array(PurchaseOrderSchema),
  message: z.string(),
});
