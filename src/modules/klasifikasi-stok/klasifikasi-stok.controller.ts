import { Response } from 'express';
import { KlasifikasiStokService } from './klasifikasi-stok.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class KlasifikasiStokController {
  private service = new KlasifikasiStokService();

  getAll = async (req: AuthRequest, res: Response) => {
    const records = await this.service.getAll();
    res.json(successResponse(records));
  };

  getById = async (req: AuthRequest, res: Response) => {
    const record = await this.service.getById(Number(req.params.id));
    res.json(successResponse(record));
  };

  create = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const record = await this.service.create(req.body, actorId);
    res.status(201).json(successResponse(record, 'Stock classification created successfully'));
  };

  update = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const record = await this.service.update(Number(req.params.id), req.body, actorId);
    res.json(successResponse(record, 'Stock classification updated successfully'));
  };

  delete = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    await this.service.delete(Number(req.params.id), actorId);
    res.json(successResponse(null, 'Stock classification deleted successfully'));
  };
}
