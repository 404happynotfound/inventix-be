import prisma from '../../config/prisma';

export class DashboardService {
  async getSummary() {
    const [totalBarang, totalSupplier, stokRendahCount, kadaluarsaCount] = await Promise.all([
      prisma.stok.count(),
      prisma.supplier.count(),
      this.countStokRendah(),
      this.countKadaluarsa(),
    ]);

    const totalStokValue = await this.calculateTotalStokValue();

    return {
      total_barang: totalBarang,
      total_supplier: totalSupplier,
      total_stok_value: totalStokValue,
      stok_rendah_count: stokRendahCount,
      barang_kadaluwarsa: kadaluarsaCount,
    };
  }

  async getTrenPengeluaran(periode: string = 'daily', startDate?: string, endDate?: string) {
    let intervalQuery = `DATE_TRUNC('day', po.tanggal_po)`;

    if (periode === 'weekly') {
      intervalQuery = `DATE_TRUNC('week', po.tanggal_po)`;
    } else if (periode === 'monthly') {
      intervalQuery = `DATE_TRUNC('month', po.tanggal_po)`;
    }

    let query = `
      SELECT 
        ${intervalQuery}::DATE as periode,
        COUNT(po.id) as jumlah_transaksi,
        SUM(po.total_nilai) as total_pengeluaran
      FROM "Purchase_Order" po
      WHERE po.status IN ('DISETUJUI', 'DIKIRIM', 'SELESAI')
    `;

    const params: any[] = [];
    if (startDate) {
      query += ` AND po.tanggal_po >= $${params.length + 1}::DATE`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND po.tanggal_po <= $${params.length + 1}::DATE`;
      params.push(endDate);
    }

    query += ` GROUP BY periode ORDER BY periode DESC LIMIT 30`;

    const result = await prisma.$queryRawUnsafe(query, ...params);
    return (result as any[]).map(r => ({
      periode: new Date(r.periode).toISOString().split('T')[0],
      total_pengeluaran: Number(r.total_pengeluaran || 0),
      jumlah_transaksi: Number(r.jumlah_transaksi),
    }));
  }

  async getStokRendah(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [stokRendah, total] = await Promise.all([
      prisma.stok.findMany({
        where: {
          jumlah_saat_ini: {
            lt: 10,
          },
        },
        include: {
          supplier: {
            select: {
              nama: true,
            },
          },
        },
        orderBy: {
          jumlah_saat_ini: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.stok.count({
        where: {
          jumlah_saat_ini: {
            lt: 10,
          },
        },
      }),
    ]);

    return {
      data: stokRendah.map(d => ({
        id: d.id,
        nama: d.nama,
        kode_sku: d.kode_sku,
        jumlah_saat_ini: d.jumlah_saat_ini,
        supplier_nama: d.supplier.nama,
      })),
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getKadaluarsa(page: number = 1, limit: number = 10, days: number = 7) {
    const skip = (page - 1) * limit;
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const [expiredItems, total] = await Promise.all([
      prisma.stok.findMany({
        where: {
          tanggal_kedaluwarsa: {
            not: null,
            lte: targetDate,
            gt: now,
          },
        },
        orderBy: {
          tanggal_kedaluwarsa: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.stok.count({
        where: {
          tanggal_kedaluwarsa: {
            not: null,
            lte: targetDate,
            gt: now,
          },
        },
      }),
    ]);

    return {
      data: expiredItems.map(d => {
        const differenceInTime = d.tanggal_kedaluwarsa!.getTime() - now.getTime();
        const hari_tersisa = Math.ceil(differenceInTime / (1000 * 3600 * 24));
        return {
          id: d.id,
          nama: d.nama,
          kode_sku: d.kode_sku,
          tanggal_kedaluwarsa: d.tanggal_kedaluwarsa!.toISOString(),
          hari_tersisa,
          jumlah_saat_ini: d.jumlah_saat_ini,
        };
      }),
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getWasteSummary(periode: string = 'daily', startDate?: string, endDate?: string) {
    let intervalQuery = `DATE_TRUNC('day', w.tanggal_waste)`;

    if (periode === 'weekly') {
      intervalQuery = `DATE_TRUNC('week', w.tanggal_waste)`;
    } else if (periode === 'monthly') {
      intervalQuery = `DATE_TRUNC('month', w.tanggal_waste)`;
    }

    let query = `
      SELECT 
        ${intervalQuery}::DATE as periode,
        COUNT(*) as jumlah_barang_terbuang,
        SUM(w.jumlah_terbuang) as total_waste,
        SUM(w.estimasi_kerugian) as estimasi_kerugian
      FROM "Waste" w
      WHERE 1=1
    `;

    const params: any[] = [];
    if (startDate) {
      query += ` AND w.tanggal_waste >= $${params.length + 1}::DATE`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND w.tanggal_waste <= $${params.length + 1}::DATE`;
      params.push(endDate);
    }

    query += ` GROUP BY periode ORDER BY periode DESC LIMIT 30`;

    const result = await prisma.$queryRawUnsafe(query, ...params);
    return (result as any[]).map(r => ({
      periode: new Date(r.periode).toISOString().split('T')[0],
      total_waste: Number(r.total_waste),
      estimasi_kerugian: Number(r.estimasi_kerugian || 0),
      jumlah_barang_terbuang: Number(r.jumlah_barang_terbuang),
    }));
  }

  private async countStokRendah(): Promise<number> {
    return prisma.stok.count({
      where: {
        jumlah_saat_ini: {
          lt: 10,
        },
      },
    });
  }

  private async countKadaluarsa(): Promise<number> {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return prisma.stok.count({
      where: {
        tanggal_kedaluwarsa: {
          not: null,
          lte: nextWeek,
          gt: now,
        },
      },
    });
  }

  private async calculateTotalStokValue(): Promise<number> {
    const result = await prisma.stok.aggregate({
      _sum: {
        jumlah_saat_ini: true,
      },
    });
    return result._sum.jumlah_saat_ini || 0;
  }
}
