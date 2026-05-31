import prisma from '../../config/prisma';
import { Riwayat_Aktivitas, Aksi } from '../../../generated/prisma';

export class RiwayatAktivitasService {
  async getAll() {
    const logs = await prisma.riwayat_Aktivitas.findMany({
      include: {
        akun: {
          select: {
            id: true,
            nama: true,
            email: true,
            peran: true,
          },
        },
      },
      orderBy: { dilakukan_pada: 'desc' },
    });
    return logs.map((log) => this.formatLog(log));
  }

  async getById(id: number) {
    const log = await prisma.riwayat_Aktivitas.findUnique({
      where: { id },
      include: {
        akun: {
          select: {
            id: true,
            nama: true,
            email: true,
            peran: true,
          },
        },
      },
    });
    if (!log) return null;
    return this.formatLog(log);
  }

  private formatLog(log: Riwayat_Aktivitas & { akun?: any }) {
    return {
      ...log,
      dilakukan_pada: log.dilakukan_pada.toISOString(),
    };
  }

  static async log(params: {
    akunId: number;
    namaTabel: string;
    recordId: string;
    aksi: 'buat' | 'edit' | 'hapus';
    dataLama?: any;
    dataBaru?: any;
  }) {
    try {
      await prisma.riwayat_Aktivitas.create({
        data: {
          akun_id: params.akunId,
          nama_tabel: params.namaTabel,
          record_id: params.recordId,
          aksi: params.aksi,
          data_lama: params.dataLama ? JSON.parse(JSON.stringify(params.dataLama)) : undefined,
          data_baru: params.dataBaru ? JSON.parse(JSON.stringify(params.dataBaru)) : undefined,
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
}
