import prisma from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { Decimal } from 'decimal.js';

type CreateWasteInput = {
  id_barang: number;
  jumlah_terbuang: number;
  keterangan?: string;
};

export class WasteService {
  private notifikasiService = new NotifikasiService();

  async create(data: CreateWasteInput, actorId: number) {
    // 1. Check barang exists
    const barang = await prisma.stok.findUnique({ where: { id: data.id_barang } });
    if (!barang) {
      throw new NotFoundError('Item not found', 'BARANG_NOT_FOUND');
    }

    // 2. Check sufficient stock
    if (barang.jumlah_saat_ini < data.jumlah_terbuang) {
      throw new ConflictError('Insufficient stock for waste reporting', 'INSUFFICIENT_STOCK');
    }

    // 3. Get harga_satuan dari Detail_PO (terakhir)
    const lastDetailPO = await prisma.detail_PO.findFirst({
      where: { stok_id: data.id_barang },
      orderBy: { dibuat_pada: 'desc' },
      select: { harga_satuan: true },
    });

    const estimasiKerugian = lastDetailPO ? data.jumlah_terbuang * lastDetailPO.harga_satuan : 0;

    // 4. Create waste record
    const waste = await prisma.waste.create({
      data: {
        id_barang: data.id_barang,
        id_akun: actorId,
        jumlah_terbuang: data.jumlah_terbuang,
        estimasi_kerugian: new Decimal(estimasiKerugian),
        keterangan: data.keterangan,
        tanggal_waste: new Date(),
      },
    });

    // 5. Decrease stock
    const newStock = barang.jumlah_saat_ini - data.jumlah_terbuang;
    await prisma.stok.update({
      where: { id: data.id_barang },
      data: { jumlah_saat_ini: newStock },
    });

    // 6. Insert into riwayat_aktivitas
    await prisma.riwayat_Aktivitas.create({
      data: {
        akun_id: actorId,
        nama_tabel: 'Waste',
        record_id: waste.id.toString(),
        aksi: 'buat',
        data_baru: {
          id_barang: data.id_barang,
          jumlah_terbuang: data.jumlah_terbuang,
          estimasi_kerugian: estimasiKerugian,
        },
      },
    });

    // 7. Trigger notification check
    await this.notifikasiService.performNotificationCheck();

    return this.formatWaste(waste, barang);
  }

  async getAll(page: number = 1, limit: number = 10, search?: string, startDate?: string, endDate?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { barang: { nama: { contains: search, mode: 'insensitive' } } },
        { barang: { kode_sku: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (startDate) {
      where.tanggal_waste = { gte: new Date(startDate) };
    }
    if (endDate) {
      if (where.tanggal_waste) {
        where.tanggal_waste.lte = new Date(endDate);
      } else {
        where.tanggal_waste = { lte: new Date(endDate) };
      }
    }

    const [waste, total] = await Promise.all([
      prisma.waste.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal_waste: 'desc' },
        include: {
          barang: {
            select: {
              id: true,
              nama: true,
              kode_sku: true,
            },
          },
          akun: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      }),
      prisma.waste.count({ where }),
    ]);

    return {
      data: waste.map(w => this.formatWaste(w, w.barang)),
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async exportToCSV(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate) {
      where.tanggal_waste = { gte: new Date(startDate) };
    }
    if (endDate) {
      if (where.tanggal_waste) {
        where.tanggal_waste.lte = new Date(endDate);
      } else {
        where.tanggal_waste = { lte: new Date(endDate) };
      }
    }

    const waste = await prisma.waste.findMany({
      where,
      orderBy: { tanggal_waste: 'desc' },
      include: {
        barang: {
          select: {
            nama: true,
            kode_sku: true,
          },
        },
        akun: {
          select: {
            nama: true,
          },
        },
      },
    });

    return waste;
  }

  private formatWaste(waste: any, barang?: any) {
    return {
      id: waste.id,
      id_barang: waste.id_barang,
      id_akun: waste.id_akun,
      jumlah_terbuang: waste.jumlah_terbuang,
      estimasi_kerugian: Number(waste.estimasi_kerugian || 0),
      tanggal_waste: waste.tanggal_waste.toISOString().split('T')[0],
      keterangan: waste.keterangan,
      dibuat_pada: waste.dibuat_pada.toISOString(),
      barang: barang ? {
        id: barang.id,
        nama: barang.nama,
        kode_sku: barang.kode_sku,
      } : undefined,
    };
  }
}
