import { Router } from 'express';
import { TransaksiStokController } from './pembelian-transaksi.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import { 
  TransaksiStokResponseSchema, 
  TransaksiStokListResponseSchema, 
  CreateTransaksiStokSchema, 
  TransaksiStokIdParamSchema,
  CreateTransaksiStokBulkSchema,
  TransaksiStokBulkResponseSchema
} from './pembelian-transaksi.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new TransaksiStokController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/pembelian-transaksi',
  tags: ['Pembelian Transaksi (Stock Transactions)'],
  summary: 'Get all stock transactions',
  protected: true,
  responses: { 200: { description: 'Success', schema: TransaksiStokListResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/pembelian-transaksi/{id}',
  tags: ['Pembelian Transaksi (Stock Transactions)'],
  summary: 'Get stock transaction by ID',
  protected: true,
  request: { params: TransaksiStokIdParamSchema },
  responses: { 200: { description: 'Success', schema: TransaksiStokResponseSchema } },
});

registerRoute({
  method: 'post',
  path: '/pembelian-transaksi',
  tags: ['Pembelian Transaksi (Stock Transactions)'],
  summary: 'Create and record new stock transaction (automatic stock adjustment)',
  protected: true,
  request: { body: CreateTransaksiStokSchema },
  responses: { 201: { description: 'Created', schema: TransaksiStokResponseSchema } },
});

registerRoute({
  method: 'post',
  path: '/pembelian-transaksi/bulk',
  tags: ['Pembelian Transaksi (Stock Transactions)'],
  summary: 'Create and record new bulk stock transactions atomically',
  protected: true,
  request: { body: CreateTransaksiStokBulkSchema },
  responses: { 201: { description: 'Created', schema: TransaksiStokBulkResponseSchema } },
});

registerRoute({
  method: 'delete',
  path: '/pembelian-transaksi/{id}',
  tags: ['Pembelian Transaksi (Stock Transactions)'],
  summary: 'Reverse and delete stock transaction',
  protected: true,
  request: { params: TransaksiStokIdParamSchema },
  responses: { 200: { description: 'Deleted/Reversed' } },
});

// ROUTE DEFINITIONS
router.get('/',
  authenticate,
  validateResponse(TransaksiStokListResponseSchema),
  controller.getAll
);

router.get('/:id',
  authenticate,
  validateRequest(TransaksiStokIdParamSchema),
  validateResponse(TransaksiStokResponseSchema),
  controller.getById
);

router.post('/',
  authenticate,
  validateRequest(CreateTransaksiStokSchema),
  validateResponse(TransaksiStokResponseSchema),
  controller.create
);

router.post('/bulk',
  authenticate,
  validateRequest(CreateTransaksiStokBulkSchema),
  validateResponse(TransaksiStokBulkResponseSchema),
  controller.createBulk
);

router.delete('/:id',
  authenticate,
  validateRequest(TransaksiStokIdParamSchema),
  controller.delete
);

export default router;
