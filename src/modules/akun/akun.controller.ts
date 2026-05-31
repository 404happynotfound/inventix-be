import { Request, Response } from 'express';
import { AkunService } from './akun.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class AkunController {
  private akunService = new AkunService();

  getAll = async (req: Request, res: Response) => {
    const akuns = await this.akunService.getAll();
    res.json(successResponse(akuns));
  };

  getById = async (req: Request, res: Response) => {
    const akun = await this.akunService.getById(Number(req.params.id));
    res.json(successResponse(akun));
  };

  getProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const user = await this.akunService.getById(userId);
    res.json(successResponse(user));
  };

  create = async (req: Request, res: Response) => {
    const akun = await this.akunService.create(req.body);
    res.json(successResponse(akun, 'Account created successfully'));
  };

  update = async (req: Request, res: Response) => {
    const akun = await this.akunService.update(Number(req.params.id), req.body);
    res.json(successResponse(akun, 'Account updated successfully'));
  };

  delete = async (req: Request, res: Response) => {
    await this.akunService.delete(Number(req.params.id));
    res.json(successResponse(null, 'Account deleted successfully'));
  };
}
