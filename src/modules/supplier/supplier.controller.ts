import { Response } from 'express';
import { SupplierService } from './supplier.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class SupplierController {
  private service = new SupplierService();

  getAll = async (req: AuthRequest, res: Response) => {
    const suppliers = await this.service.getAll();
    res.json(successResponse(suppliers));
  };

  getById = async (req: AuthRequest, res: Response) => {
    const supplier = await this.service.getById(Number(req.params.id));
    res.json(successResponse(supplier));
  };

  create = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const supplier = await this.service.create(req.body, actorId);
    res.status(201).json(successResponse(supplier, 'Supplier created successfully'));
  };

  update = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    const supplier = await this.service.update(Number(req.params.id), req.body, actorId);
    res.json(successResponse(supplier, 'Supplier updated successfully'));
  };

  delete = async (req: AuthRequest, res: Response) => {
    const actorId = req.user!.id;
    await this.service.delete(Number(req.params.id), actorId);
    res.json(successResponse(null, 'Supplier deleted successfully'));
  };
}
