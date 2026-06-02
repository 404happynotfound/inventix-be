import prisma from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreateKlasifikasiStokSchema, UpdateKlasifikasiStokSchema } from './klasifikasi-stok.schema';
import { z } from 'zod';
import { Klasifikasi_Stok } from '../../../generated/prisma';
import { RiwayatAktivitasService } from '../riwayat-aktivitas/riwayat-aktivitas.service';

type CreateKlasifikasiStokInput = z.infer<typeof CreateKlasifikasiStokSchema>['body'];
type UpdateKlasifikasiStokInput = z.infer<typeof UpdateKlasifikasiStokSchema>['body'];

export class KlasifikasiStokService {
  async getAll() {
    const records = await prisma.klasifikasi_Stok.findMany({
      orderBy: { dibuat_pada: 'desc' },
    });
    return records.map((record) => this.formatRecord(record));
  }

  async getById(id: number) {
    const record = await prisma.klasifikasi_Stok.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundError('Klasifikasi stok tidak ditemukan', 'STOCK_CLASSIFICATION_NOT_FOUND');
    }
    return this.formatRecord(record);
  }

  async create(data: CreateKlasifikasiStokInput, actorId: number) {
    const existing = await prisma.klasifikasi_Stok.findFirst({
      where: { jenis: { equals: data.jenis, mode: 'insensitive' } },
    });
    if (existing) {
      throw new ConflictError('Tipe klasifikasi stok sudah ada', 'CLASSIFICATION_EXISTS');
    }

    const record = await prisma.klasifikasi_Stok.create({
      data,
    });

    const formatted = this.formatRecord(record);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Klasifikasi_Stok',
      recordId: record.id.toString(),
      aksi: 'buat',
      dataBaru: formatted,
    });

    return formatted;
  }

  async update(id: number, data: UpdateKlasifikasiStokInput, actorId: number) {
    const oldRecord = await this.getById(id);

    if (data.jenis) {
      const existing = await prisma.klasifikasi_Stok.findFirst({
        where: { 
          jenis: { equals: data.jenis, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictError('Tipe klasifikasi stok sudah ada', 'CLASSIFICATION_EXISTS');
      }
    }

    const record = await prisma.klasifikasi_Stok.update({
      where: { id },
      data,
    });

    const formatted = this.formatRecord(record);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Klasifikasi_Stok',
      recordId: id.toString(),
      aksi: 'edit',
      dataLama: oldRecord,
      dataBaru: formatted,
    });

    return formatted;
  }

  async delete(id: number, actorId: number) {
    const oldRecord = await this.getById(id);

    // Check if classification is in use by stocks
    const stockCount = await prisma.stok.count({ where: { klasifikasi_id: id } });
    if (stockCount > 0) {
      throw new ConflictError('Tidak dapat menghapus klasifikasi karena saat ini terhubung dengan stok yang ada', 'CLASSIFICATION_IN_USE');
    }

    await prisma.klasifikasi_Stok.delete({ where: { id } });

    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Klasifikasi_Stok',
      recordId: id.toString(),
      aksi: 'hapus',
      dataLama: oldRecord,
    });
  }

  private formatRecord(record: Klasifikasi_Stok) {
    return {
      ...record,
      dibuat_pada: record.dibuat_pada.toISOString(),
      diperbarui_pada: record.diperbarui_pada.toISOString(),
    };
  }
}
