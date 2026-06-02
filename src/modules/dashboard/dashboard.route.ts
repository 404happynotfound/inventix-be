import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import {
  DashboardSummarySchema,
  TrenPengeluaranSchema,
  StokRendahSchema,
  KadaluarsaSchema,
  WasteSummarySchema,
  DashboardQuerySchema,
} from './dashboard.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new DashboardController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/dashboard/summary',
  tags: ['Dashboard'],
  summary: 'Get dashboard summary',
  protected: true,
  responses: { 200: { description: 'Success', schema: DashboardSummarySchema } },
});

registerRoute({
  method: 'get',
  path: '/dashboard/tren-pengeluaran',
  tags: ['Dashboard'],
  summary: 'Get expenditure trend',
  protected: true,
  request: { query: DashboardQuerySchema },
  responses: { 200: { description: 'Success', schema: TrenPengeluaranSchema } },
});

registerRoute({
  method: 'get',
  path: '/dashboard/stok-rendah',
  tags: ['Dashboard'],
  summary: 'Get low stock items',
  protected: true,
  request: { query: DashboardQuerySchema },
  responses: { 200: { description: 'Success', schema: StokRendahSchema } },
});

registerRoute({
  method: 'get',
  path: '/dashboard/kadaluarsa',
  tags: ['Dashboard'],
  summary: 'Get expired items',
  protected: true,
  request: { query: DashboardQuerySchema },
  responses: { 200: { description: 'Success', schema: KadaluarsaSchema } },
});

registerRoute({
  method: 'get',
  path: '/dashboard/waste-summary',
  tags: ['Dashboard'],
  summary: 'Get waste summary',
  protected: true,
  request: { query: DashboardQuerySchema },
  responses: { 200: { description: 'Success', schema: WasteSummarySchema } },
});

// ROUTES
router.get('/summary',
  authenticate,
  validateResponse(DashboardSummarySchema),
  controller.getSummary
);
router.get('/tren-pengeluaran',
  authenticate,
  validateRequest(DashboardQuerySchema),
  validateResponse(TrenPengeluaranSchema),
  controller.getTrenPengeluaran
);
router.get('/stok-rendah',
  authenticate,
  validateRequest(DashboardQuerySchema),
  validateResponse(StokRendahSchema),
  controller.getStokRendah
);
router.get('/kadaluarsa',
  authenticate,
  validateRequest(DashboardQuerySchema),
  validateResponse(KadaluarsaSchema),
  controller.getKadaluarsa
);
router.get('/waste-summary',
  authenticate,
  validateRequest(DashboardQuerySchema),
  validateResponse(WasteSummarySchema),
  controller.getWasteSummary
);

export default router;
