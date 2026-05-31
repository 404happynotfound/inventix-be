import prisma from '../../config/prisma';

export class LaporanPengeluaranService {
  async getPengeluaranList(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    supplierId?: number
  ) {
    const skip = (page - 1) * limit;
    
    let query = `
      SELECT 
        dp.id,
        po.nomor_po,
        po.tanggal_po,
        s.nama as supplier_nama,
        s.id as supplier_id,
        st.nama as barang_nama,
        st.kode_sku as barang_kode_sku,
        dp.jumlah_dipesan,
        dp.jumlah_diterima,
        dp.harga_satuan,
        (dp.jumlah_dipesan * dp.harga_satuan) as subtotal,
        po.status
      FROM "Detail_PO" dp
      JOIN "Purchase_Order" po ON dp.po_id = po.id
      JOIN "Supplier" s ON po.supplier_id = s.id
      JOIN "Stok" st ON dp.stok_id = st.id
      WHERE 1=1
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push(`(st.nama ILIKE $${conditions.length + 1} OR st.kode_sku ILIKE $${conditions.length + 1} OR s.nama ILIKE $${conditions.length + 1})`);
      params.push(`%${search}%`);
    }

    if (status) {
      conditions.push(`po.status = $${params.length + 1}`);
      params.push(status);
    }

    if (startDate) {
      conditions.push(`po.tanggal_po >= $${params.length + 1}::DATE`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`po.tanggal_po <= $${params.length + 1}::DATE`);
      params.push(endDate);
    }

    if (supplierId) {
      conditions.push(`s.id = $${params.length + 1}`);
      params.push(supplierId);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_query`;
    const dataQuery = `${query} ORDER BY po.tanggal_po DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const [countResult, data] = await Promise.all([
      prisma.$queryRawUnsafe(countQuery, ...params),
      prisma.$queryRawUnsafe(dataQuery, ...params, limit, skip),
    ]);

    const total = (countResult as any[])[0]?.total || 0;

    return {
      data: (data as any[]).map(d => this.formatPengeluaran(d)),
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getSummary(
    startDate?: string,
    endDate?: string,
    supplierId?: number
  ) {
    let query = `
      SELECT 
        COUNT(DISTINCT po.id) as jumlah_transaksi,
        SUM(dp.jumlah_dipesan * dp.harga_satuan) as total_pengeluaran
      FROM "Detail_PO" dp
      JOIN "Purchase_Order" po ON dp.po_id = po.id
      JOIN "Supplier" s ON po.supplier_id = s.id
      WHERE po.status IN ('DISETUJUI', 'DIKIRIM', 'SELESAI')
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (startDate) {
      conditions.push(`po.tanggal_po >= $${params.length + 1}::DATE`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`po.tanggal_po <= $${params.length + 1}::DATE`);
      params.push(endDate);
    }

    if (supplierId) {
      conditions.push(`s.id = $${params.length + 1}`);
      params.push(supplierId);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    const result = await prisma.$queryRawUnsafe(query, ...params);
    const data = (result as any[])[0];

    const totalPengeluaran = Number(data?.total_pengeluaran || 0);
    const jumlahTransaksi = Number(data?.jumlah_transaksi || 0);
    const rataRataPengeluaran = jumlahTransaksi > 0 ? totalPengeluaran / jumlahTransaksi : 0;

    return {
      total_pengeluaran: totalPengeluaran,
      jumlah_transaksi: jumlahTransaksi,
      rata_rata_pengeluaran: Math.round(rataRataPengeluaran),
    };
  }

  async exportToCSV(
    startDate?: string,
    endDate?: string,
    supplierId?: number
  ) {
    let query = `
      SELECT 
        dp.id,
        po.nomor_po,
        po.tanggal_po,
        s.nama as supplier_nama,
        st.nama as barang_nama,
        st.kode_sku as barang_kode_sku,
        dp.jumlah_dipesan,
        dp.jumlah_diterima,
        dp.harga_satuan,
        (dp.jumlah_dipesan * dp.harga_satuan) as subtotal,
        po.status
      FROM "Detail_PO" dp
      JOIN "Purchase_Order" po ON dp.po_id = po.id
      JOIN "Supplier" s ON po.supplier_id = s.id
      JOIN "Stok" st ON dp.stok_id = st.id
      WHERE 1=1
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (startDate) {
      conditions.push(`po.tanggal_po >= $${params.length + 1}::DATE`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`po.tanggal_po <= $${params.length + 1}::DATE`);
      params.push(endDate);
    }

    if (supplierId) {
      conditions.push(`s.id = $${params.length + 1}`);
      params.push(supplierId);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY po.tanggal_po DESC`;

    const result = await prisma.$queryRawUnsafe(query, ...params);
    return result as any[];
  }

  private formatPengeluaran(data: any) {
    return {
      id: data.id,
      nomor_po: data.nomor_po,
      tanggal_po: new Date(data.tanggal_po).toISOString(),
      supplier_nama: data.supplier_nama,
      supplier_id: data.supplier_id,
      barang_nama: data.barang_nama,
      barang_kode_sku: data.barang_kode_sku,
      jumlah_dipesan: data.jumlah_dipesan,
      jumlah_diterima: data.jumlah_diterima,
      harga_satuan: Number(data.harga_satuan),
      subtotal: Number(data.subtotal),
      status: data.status,
    };
  }
}
