import { Response } from 'express';
import { NotifikasiService } from './notifikasi.service';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class NotifikasiController {
  private service = new NotifikasiService();

  getAll = async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const isRead = req.query.is_read ? req.query.is_read === 'true' : undefined;
    const jenis = req.query.jenis as string | undefined;

    const result = await this.service.getAll(page, limit, isRead, jenis);
    res.json(successResponse(result.data, 'Notifications retrieved successfully', result.pagination));
  };

  markAsRead = async (req: AuthRequest, res: Response) => {
    const notification = await this.service.markAsRead(Number(req.params.id));
    res.json(successResponse(notification, 'Notification marked as read'));
  };

  markAllAsRead = async (req: AuthRequest, res: Response) => {
    await this.service.markAllAsRead();
    res.json(successResponse(null, 'All notifications marked as read'));
  };

  checkNotifications = async (req: AuthRequest, res: Response) => {
    const result = await this.service.checkNotifications();
    res.json(successResponse(result, 'Notification check completed'));
  };
}
