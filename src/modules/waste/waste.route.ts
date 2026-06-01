import { Router } from 'express';
import { WasteController } from './waste.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import {
  WasteListResponseSchema,
  WasteResponseSchema,
  CreateWasteSchema,
  WasteQuerySchema,
  WasteExportQuerySchema,
} from './waste.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new WasteController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'post',
  path: '/waste',
  tags: ['Waste'],
  summary: 'Create waste record',
  protected: true,
  request: { body: CreateWasteSchema },
  responses: { 201: { description: 'Created', schema: WasteResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/waste',
  tags: ['Waste'],
  summary: 'Get waste records',
  protected: true,
  request: { query: WasteQuerySchema },
  responses: { 200: { description: 'Success', schema: WasteListResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/waste/export',
  tags: ['Waste'],
  summary: 'Export waste records to CSV',
  protected: true,
  request: { query: WasteExportQuerySchema },
  responses: { 200: { description: 'CSV file' } },
});

// ROUTES
router.post('/', authenticate, validateRequest(CreateWasteSchema), controller.create);
router.get('/export', authenticate, controller.exportCSV);
router.get('/', authenticate, controller.getAll);

export default router;
