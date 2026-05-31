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
    let dateFormat = '%Y-%m-%d';
    let intervalQuery = `DATE_TRUNC('day', po.tanggal_po)`;

    if (periode === 'weekly') {
      intervalQuery = `DATE_TRUNC('week', po.tanggal_po)`;
    } else if (periode === 'monthly') {
      intervalQuery = `DATE_TRUNC('month', po.tanggal_po)`;
    }

    let query = `
      SELECT 
        ${intervalQuery}::DATE as periode,
        COUNT(DISTINCT po.id) as jumlah_transaksi,
        SUM(dp.jumlah_dipesan * dp.harga_satuan) as total_pengeluaran
      FROM "Detail_PO" dp
      JOIN "Purchase_Order" po ON dp.po_id = po.id
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

    const result = await prisma.$queryRaw`
      SELECT 
        s.id,
        s.nama,
        s.kode_sku,
        s.jumlah_saat_ini,
        sup.nama as supplier_nama,
        COUNT(*) OVER() as total
      FROM "Stok" s
      JOIN "Supplier" sup ON s.supplier_id = sup.id
      WHERE s.jumlah_saat_ini < COALESCE((SELECT stok_minimum FROM "Klasifikasi_Stok" WHERE id = s.klasifikasi_id), 10)
      ORDER BY s.jumlah_saat_ini ASC
      LIMIT ${limit}
      OFFSET ${skip}
    `;

    const data = (result as any[]);
    const total = data[0]?.total || 0;

    return {
      data: data.map(d => ({
        id: d.id,
        nama: d.nama,
        kode_sku: d.kode_sku,
        jumlah_saat_ini: d.jumlah_saat_ini,
        supplier_nama: d.supplier_nama,
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
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const result = await prisma.$queryRaw`
      SELECT 
        s.id,
        s.nama,
        s.kode_sku,
        s.tanggal_kedaluwarsa,
        s.jumlah_saat_ini,
        COUNT(*) OVER() as total,
        EXTRACT(DAY FROM (s.tanggal_kedaluwarsa - NOW())) as hari_tersisa
      FROM "Stok" s
      WHERE s.tanggal_kedaluwarsa IS NOT NULL
        AND s.tanggal_kedaluwarsa <= ${targetDate}::TIMESTAMP
        AND s.tanggal_kedaluwarsa > NOW()
      ORDER BY s.tanggal_kedaluwarsa ASC
      LIMIT ${limit}
      OFFSET ${skip}
    `;

    const data = (result as any[]);
    const total = data[0]?.total || 0;

    return {
      data: data.map(d => ({
        id: d.id,
        nama: d.nama,
        kode_sku: d.kode_sku,
        tanggal_kedaluwarsa: d.tanggal_kedaluwarsa?.toISOString(),
        hari_tersisa: Math.ceil(d.hari_tersisa),
        jumlah_saat_ini: d.jumlah_saat_ini,
      })),
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
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Stok" s
      WHERE s.jumlah_saat_ini < COALESCE((SELECT stok_minimum FROM "Klasifikasi_Stok" WHERE id = s.klasifikasi_id), 10)
    `;
    return Number((result as any[])[0]?.count || 0);
  }

  private async countKadaluarsa(): Promise<number> {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Stok" s
      WHERE s.tanggal_kedaluwarsa IS NOT NULL
        AND s.tanggal_kedaluwarsa <= ${nextWeek}::TIMESTAMP
        AND s.tanggal_kedaluwarsa > NOW()
    `;
    return Number((result as any[])[0]?.count || 0);
  }

  private async calculateTotalStokValue(): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT COALESCE(SUM(CAST(s.jumlah_saat_ini AS BIGINT)), 0) as total_value
      FROM "Stok" s
    `;
    return Number((result as any[])[0]?.total_value || 0);
  }
}
