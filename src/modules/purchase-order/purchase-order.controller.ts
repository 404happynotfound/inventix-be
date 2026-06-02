import { Response } from 'express';
import { PurchaseOrderService } from './purchase-order.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class PurchaseOrderController {
  private service = new PurchaseOrderService();

  getAll = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const pos = await this.service.getAll(actorId);
    res.json(successResponse(pos));
  };

  getById = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const po = await this.service.getById(Number(req.params.id), actorId);
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

  ownerApprove = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const po = await this.service.ownerApprove(Number(req.params.id), actorId);
    res.json(successResponse(po, 'Purchase Order approved by owner'));
  };

  ownerReject = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const po = await this.service.ownerReject(Number(req.params.id), actorId);
    res.json(successResponse(po, 'Purchase Order rejected by owner'));
  };

  supplierConfirm = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const po = await this.service.supplierConfirm(Number(req.params.id), actorId);
    res.json(successResponse(po, 'Purchase Order confirmed by supplier, stock updated'));
  };

  supplierReject = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const po = await this.service.supplierReject(Number(req.params.id), actorId);
    res.json(successResponse(po, 'Purchase Order rejected by supplier'));
  };
}
