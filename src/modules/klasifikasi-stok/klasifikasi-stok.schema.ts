import { z } from 'zod';
import { registry } from '../../config/openapi';

export const KlasifikasiStokSchema = registry.register(
  'KlasifikasiStok',
  z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
    jenis: z.string().openapi({ example: 'Elektronik' }),
    deskripsi: z.string().nullable().openapi({ example: 'Barang elektronik konsumen' }),
    dibuat_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
    diperbarui_pada: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
  })
);

export type KlasifikasiStok = z.infer<typeof KlasifikasiStokSchema>;

export const CreateKlasifikasiStokSchema = registry.register(
  'CreateKlasifikasiStok',
  z.object({
    body: z.object({
      jenis: z.string().min(2),
      deskripsi: z.string().optional(),
    }),
  })
);

export const UpdateKlasifikasiStokSchema = registry.register(
  'UpdateKlasifikasiStok',
  z.object({
    body: z.object({
      jenis: z.string().min(2).optional(),
      deskripsi: z.string().optional(),
    }),
  })
);

export const KlasifikasiStokIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().openapi({ example: 1 }),
  }),
});

export const KlasifikasiStokResponseSchema = z.object({
  data: KlasifikasiStokSchema,
  message: z.string(),
});

export const KlasifikasiStokListResponseSchema = z.object({
  data: z.array(KlasifikasiStokSchema),
  message: z.string(),
});
