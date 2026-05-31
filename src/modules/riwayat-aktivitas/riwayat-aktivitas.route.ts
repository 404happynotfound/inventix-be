import { Router } from 'express';
import { RiwayatAktivitasController } from './riwayat-aktivitas.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import { 
  RiwayatAktivitasResponseSchema, 
  RiwayatAktivitasListResponseSchema, 
  RiwayatAktivitasIdParamSchema 
} from './riwayat-aktivitas.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new RiwayatAktivitasController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/riwayat-aktivitas',
  tags: ['Riwayat Aktivitas'],
  summary: 'Get all activity logs',
  protected: true,
  responses: { 200: { description: 'Success', schema: RiwayatAktivitasListResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/riwayat-aktivitas/{id}',
  tags: ['Riwayat Aktivitas'],
  summary: 'Get activity log by ID',
  protected: true,
  request: { params: RiwayatAktivitasIdParamSchema },
  responses: { 200: { description: 'Success', schema: RiwayatAktivitasResponseSchema } },
});

// ROUTE DEFINITIONS
router.get('/',
  authenticate,
  validateResponse(RiwayatAktivitasListResponseSchema),
  controller.getAll
);

router.get('/:id',
  authenticate,
  validateRequest(RiwayatAktivitasIdParamSchema),
  validateResponse(RiwayatAktivitasResponseSchema),
  controller.getById
);

export default router;
