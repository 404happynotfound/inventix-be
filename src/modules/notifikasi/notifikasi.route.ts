import { Router } from 'express';
import { NotifikasiController } from './notifikasi.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateResponse } from '../../middlewares/validateResponse';
import {
  NotifikasiListResponseSchema,
  NotifikasiResponseSchema,
  NotifikasiQuerySchema,
} from './notifikasi.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new NotifikasiController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/notifikasi',
  tags: ['Notifikasi'],
  summary: 'Get all notifications with pagination',
  protected: true,
  request: { query: NotifikasiQuerySchema },
  responses: { 200: { description: 'Success', schema: NotifikasiListResponseSchema } },
});

registerRoute({
  method: 'patch',
  path: '/notifikasi/{id}/read',
  tags: ['Notifikasi'],
  summary: 'Mark notification as read',
  protected: true,
  responses: { 200: { description: 'Success', schema: NotifikasiResponseSchema } },
});

registerRoute({
  method: 'patch',
  path: '/notifikasi/read-all',
  tags: ['Notifikasi'],
  summary: 'Mark all notifications as read',
  protected: true,
  responses: { 200: { description: 'Success' } },
});

registerRoute({
  method: 'post',
  path: '/notifikasi/check',
  tags: ['Notifikasi'],
  summary: 'Manually trigger notification check',
  protected: true,
  responses: { 200: { description: 'Success' } },
});

// ROUTES
router.get('/', authenticate, controller.getAll);
router.patch('/read-all', authenticate, controller.markAllAsRead);
router.patch('/:id/read', authenticate, controller.markAsRead);
router.post('/check', authenticate, controller.checkNotifications);

export default router;
