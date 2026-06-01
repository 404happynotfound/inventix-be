import { Response } from 'express';
import { TransaksiStokService } from './pembelian-transaksi.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class TransaksiStokController {
  private service = new TransaksiStokService();

  getAll = async (req: AuthRequest, res: Response) => {
    const transactions = await this.service.getAll();
    res.json(successResponse(transactions));
  };

  getById = async (req: AuthRequest, res: Response) => {
    const tx = await this.service.getById(Number(req.params.id));
    res.json(successResponse(tx));
  };

  create = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const tx = await this.service.create(req.body, actorId);
    res.status(201).json(successResponse(tx, 'Stock transaction recorded successfully'));
  };

  createBulk = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const txs = await this.service.createBulk(req.body, actorId);
    res.status(201).json(successResponse(txs, 'Bulk stock transactions recorded successfully'));
  };

  delete = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    await this.service.delete(Number(req.params.id), actorId);
    res.json(successResponse(null, 'Stock transaction reversed and deleted successfully'));
  };
}
