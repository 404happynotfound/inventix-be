import { Response } from 'express';
import { WasteService } from './waste.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { format } from 'fast-csv';

export class WasteController {
  private service = new WasteService();

  create = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const waste = await this.service.create(req.body, actorId);
    res.status(201).json(successResponse(waste, 'Waste record created successfully'));
  };

  getAll = async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;
    const startDate = req.query.start_date as string | undefined;
    const endDate = req.query.end_date as string | undefined;

    const result = await this.service.getAll(page, limit, search, startDate, endDate);
    res.json(successResponse(result.data, 'Waste records retrieved', result.pagination));
  };

  exportCSV = async (req: AuthRequest, res: Response) => {
    const startDate = req.query.start_date as string | undefined;
    const endDate = req.query.end_date as string | undefined;

    const data = await this.service.exportToCSV(startDate, endDate);

    const csvData = data.map(d => ({
      'Tanggal': new Date(d.tanggal_waste).toLocaleDateString('id-ID'),
      'Barang': d.barang.nama,
      'SKU': d.barang.kode_sku,
      'Jumlah Terbuang': d.jumlah_terbuang,
      'Estimasi Kerugian': Number(d.estimasi_kerugian),
      'Keterangan': d.keterangan || '-',
      'Dicatat Oleh': d.akun.nama,
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan-waste.csv');

    const stream = format({ headers: true });
    stream.pipe(res);
    csvData.forEach(row => stream.write(row));
    stream.end();
  };
}
