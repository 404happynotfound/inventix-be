import { Response } from 'express';
import { StokService } from './stok.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class StokController {
  private service = new StokService();

  getAll = async (req: AuthRequest, res: Response) => {
    const stocks = await this.service.getAll();
    res.json(successResponse(stocks));
  };

  getById = async (req: AuthRequest, res: Response) => {
    const stock = await this.service.getById(Number(req.params.id));
    res.json(successResponse(stock));
  };

  create = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const stock = await this.service.create(req.body, actorId);
    res.status(201).json(successResponse(stock, 'Stock item created successfully'));
  };

  update = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const stock = await this.service.update(Number(req.params.id), req.body, actorId);
    res.json(successResponse(stock, 'Stock item updated successfully'));
  };

  delete = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    await this.service.delete(Number(req.params.id), actorId);
    res.json(successResponse(null, 'Stock item deleted successfully'));
  };
}
