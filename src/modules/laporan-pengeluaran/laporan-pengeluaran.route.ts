import { Router } from 'express';
import { LaporanPengeluaranController } from './laporan-pengeluaran.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import {
  PengeluaranListResponseSchema,
  PengeluaranSummarySchema,
  PengeluaranQuerySchema,
  PengeluaranExportQuerySchema,
} from './laporan-pengeluaran.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new LaporanPengeluaranController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/laporan/pengeluaran',
  tags: ['Laporan Pengeluaran'],
  summary: 'Get expense report list',
  protected: true,
  request: { query: PengeluaranQuerySchema },
  responses: { 200: { description: 'Success', schema: PengeluaranListResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/laporan/pengeluaran/summary',
  tags: ['Laporan Pengeluaran'],
  summary: 'Get expense report summary',
  protected: true,
  responses: { 200: { description: 'Success', schema: PengeluaranSummarySchema } },
});

registerRoute({
  method: 'get',
  path: '/laporan/pengeluaran/export',
  tags: ['Laporan Pengeluaran'],
  summary: 'Export expense report to CSV',
  protected: true,
  request: { query: PengeluaranExportQuerySchema },
  responses: { 200: { description: 'CSV file' } },
});

// ROUTES
router.get('/summary',
  authenticate,
  validateResponse(PengeluaranSummarySchema),
  controller.getSummary
);
router.get('/export',
  authenticate,
  validateRequest(PengeluaranExportQuerySchema),
  controller.exportCSV
);
router.get('/',
  authenticate,
  validateRequest(PengeluaranQuerySchema),
  validateResponse(PengeluaranListResponseSchema),
  controller.getList
);

export default router;
