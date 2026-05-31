import { Response } from 'express';
import { PurchaseOrderService } from './purchase-order.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class PurchaseOrderController {
  private service = new PurchaseOrderService();

  getAll = async (req: AuthRequest, res: Response) => {
    const pos = await this.service.getAll();
    res.json(successResponse(pos));
  };

  getById = async (req: AuthRequest, res: Response) => {
    const po = await this.service.getById(Number(req.params.id));
    res.json(successResponse(po));
  };

  create = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const po = await this.service.create(req.body, actorId);
    res.status(201).json(successResponse(po, 'Purchase Order created successfully'));
  };

  update = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const po = await this.service.update(Number(req.params.id), req.body, actorId);
    res.json(successResponse(po, 'Purchase Order updated successfully'));
  };

  delete = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    await this.service.delete(Number(req.params.id), actorId);
    res.json(successResponse(null, 'Purchase Order deleted successfully'));
  };
}
