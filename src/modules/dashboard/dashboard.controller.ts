import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class DashboardController {
  private service = new DashboardService();

  getSummary = async (req: AuthRequest, res: Response) => {
    const summary = await this.service.getSummary();
    res.json(successResponse(summary, 'Dashboard summary retrieved'));
  };

  getTrenPengeluaran = async (req: AuthRequest, res: Response) => {
    const periode = (req.query.periode as string) || 'daily';
    const startDate = req.query.start as string | undefined;
    const endDate = req.query.end as string | undefined;

    const trend = await this.service.getTrenPengeluaran(periode, startDate, endDate);
    res.json(successResponse(trend, 'Expenditure trend retrieved'));
  };

  getStokRendah = async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await this.service.getStokRendah(page, limit);
    res.json(successResponse(result.data, 'Low stock items retrieved', result.pagination));
  };

  getKadaluarsa = async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const days = Number(req.query.days) || 7;

    const result = await this.service.getKadaluarsa(page, limit, days);
    res.json(successResponse(result.data, 'Expired items retrieved', result.pagination));
  };

  getWasteSummary = async (req: AuthRequest, res: Response) => {
    const periode = (req.query.periode as string) || 'daily';
    const startDate = req.query.start as string | undefined;
    const endDate = req.query.end as string | undefined;

    const summary = await this.service.getWasteSummary(periode, startDate, endDate);
    res.json(successResponse(summary, 'Waste summary retrieved'));
  };
}
