import { z } from 'zod';
import { registry } from '../../config/openapi';

export const AksiEnum = z.enum(['buat', 'edit', 'hapus']);

export const RiwayatAktivitasSchema = registry.register(
  'RiwayatAktivitas',
  z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
    akun_id: z.number().int().openapi({ example: 1 }),
    nama_tabel: z.string().openapi({ example: 'Stok' }),
    record_id: z.string().openapi({ example: '5' }),
    aksi: AksiEnum.openapi({ example: 'buat' }),
    data_lama: z.any().nullable().openapi({ example: null }),
    data_baru: z.any().nullable().openapi({ example: { nama: 'Stok Baru' } }),
    dilakukan_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    akun: z.object({
      id: z.number(),
      nama: z.string(),
      email: z.string(),
      peran: z.string(),
    }).optional(),
  })
);

export type RiwayatAktivitas = z.infer<typeof RiwayatAktivitasSchema>;

export const RiwayatAktivitasIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
  }),
});

export const RiwayatAktivitasResponseSchema = z.object({
  data: RiwayatAktivitasSchema,
  message: z.string(),
});

export const RiwayatAktivitasListResponseSchema = z.object({
  data: z.array(RiwayatAktivitasSchema),
  message: z.string(),
});
