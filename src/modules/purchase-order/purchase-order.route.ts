import { Router } from 'express';
import { PurchaseOrderController } from './purchase-order.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import { 
  PurchaseOrderResponseSchema, 
  PurchaseOrderListResponseSchema, 
  CreatePurchaseOrderSchema, 
  UpdatePurchaseOrderSchema, 
  PurchaseOrderIdParamSchema 
} from './purchase-order.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new PurchaseOrderController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/purchase-order',
  tags: ['Purchase Order'],
  summary: 'Get all purchase orders',
  protected: true,
  responses: { 200: { description: 'Success', schema: PurchaseOrderListResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/purchase-order/{id}',
  tags: ['Purchase Order'],
  summary: 'Get purchase order by ID (with details)',
  protected: true,
  request: { params: PurchaseOrderIdParamSchema },
  responses: { 200: { description: 'Success', schema: PurchaseOrderResponseSchema } },
});

registerRoute({
  method: 'post',
  path: '/purchase-order',
  tags: ['Purchase Order'],
  summary: 'Create new purchase order (header + nested details)',
  protected: true,
  request: { body: CreatePurchaseOrderSchema },
  responses: { 201: { description: 'Created', schema: PurchaseOrderResponseSchema } },
});

registerRoute({
  method: 'put',
  path: '/purchase-order/{id}',
  tags: ['Purchase Order'],
  summary: 'Update purchase order (or receive stock when setting status to SELESAI)',
  protected: true,
  request: { params: PurchaseOrderIdParamSchema, body: UpdatePurchaseOrderSchema },
  responses: { 200: { description: 'Updated', schema: PurchaseOrderResponseSchema } },
});

registerRoute({
  method: 'delete',
  path: '/purchase-order/{id}',
  tags: ['Purchase Order'],
  summary: 'Delete purchase order',
  protected: true,
  request: { params: PurchaseOrderIdParamSchema },
  responses: { 200: { description: 'Deleted' } },
});

// ROUTE DEFINITIONS
router.get('/',
  authenticate,
  validateResponse(PurchaseOrderListResponseSchema),
  controller.getAll
);

router.get('/:id',
  authenticate,
  validateRequest(PurchaseOrderIdParamSchema),
  validateResponse(PurchaseOrderResponseSchema),
  controller.getById
);

router.post('/',
  authenticate,
  validateRequest(CreatePurchaseOrderSchema),
  validateResponse(PurchaseOrderResponseSchema),
  controller.create
);

router.put('/:id',
  authenticate,
  validateRequest(PurchaseOrderIdParamSchema),
  validateRequest(UpdatePurchaseOrderSchema),
  validateResponse(PurchaseOrderResponseSchema),
  controller.update
);

router.delete('/:id',
  authenticate,
  validateRequest(PurchaseOrderIdParamSchema),
  controller.delete
);

export default router;
