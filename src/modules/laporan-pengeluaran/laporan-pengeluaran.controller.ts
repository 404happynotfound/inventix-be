import { Response } from 'express';
import { LaporanPengeluaranService } from './laporan-pengeluaran.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { format } from 'fast-csv';

export class LaporanPengeluaranController {
  private service = new LaporanPengeluaranService();

  getList = async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const startDate = req.query.start_date as string | undefined;
    const endDate = req.query.end_date as string | undefined;
    const supplierId = req.query.id_supplier ? Number(req.query.id_supplier) : undefined;

    const result = await this.service.getPengeluaranList(page, limit, search, status, startDate, endDate, supplierId);
    res.json(successResponse(result.data, 'Expense report retrieved', result.pagination));
  };

  getSummary = async (req: AuthRequest, res: Response) => {
    const startDate = req.query.start_date as string | undefined;
    const endDate = req.query.end_date as string | undefined;
    const supplierId = req.query.id_supplier ? Number(req.query.id_supplier) : undefined;

    const summary = await this.service.getSummary(startDate, endDate, supplierId);
    res.json(successResponse(summary, 'Expense summary retrieved'));
  };

  exportCSV = async (req: AuthRequest, res: Response) => {
    const startDate = req.query.start_date as string | undefined;
    const endDate = req.query.end_date as string | undefined;
    const supplierId = req.query.id_supplier ? Number(req.query.id_supplier) : undefined;

    const data = await this.service.exportToCSV(startDate, endDate, supplierId);

    const csvData = data.map(d => ({
      'Nomor PO': d.nomor_po,
      'Tanggal PO': new Date(d.tanggal_po).toLocaleDateString('id-ID'),
      'Supplier': d.supplier_nama,
      'Barang': d.barang_nama,
      'SKU': d.barang_kode_sku,
      'Jumlah Dipesan': d.jumlah_dipesan,
      'Jumlah Diterima': d.jumlah_diterima,
      'Harga Satuan': d.harga_satuan,
      'Subtotal': Number(d.subtotal),
      'Status': d.status,
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan-pengeluaran.csv');

    const stream = format({ headers: true });
    stream.pipe(res);
    csvData.forEach(row => stream.write(row));
    stream.end();
  };
}
