import { Request, Response } from 'express';
import { RiwayatAktivitasService } from './riwayat-aktivitas.service';
import { successResponse } from '../../utils/response';
import { NotFoundError } from '../../utils/errors';

export class RiwayatAktivitasController {
  private riwayatService = new RiwayatAktivitasService();

  getAll = async (req: Request, res: Response) => {
    const logs = await this.riwayatService.getAll();
    res.json(successResponse(logs));
  };

  getById = async (req: Request, res: Response) => {
    const log = await this.riwayatService.getById(Number(req.params.id));
    if (!log) {
      throw new NotFoundError('Log aktivitas tidak ditemukan', 'ACTIVITY_LOG_NOT_FOUND');
    }
    res.json(successResponse(log));
  };
}
