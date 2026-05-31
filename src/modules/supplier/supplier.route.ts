import { Router } from 'express';
import { SupplierController } from './supplier.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import { 
  SupplierResponseSchema, 
  SupplierListResponseSchema, 
  CreateSupplierSchema, 
  UpdateSupplierSchema, 
  SupplierIdParamSchema 
} from './supplier.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new SupplierController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/supplier',
  tags: ['Supplier'],
  summary: 'Get all suppliers',
  protected: true,
  responses: { 200: { description: 'Success', schema: SupplierListResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/supplier/{id}',
  tags: ['Supplier'],
  summary: 'Get supplier by ID',
  protected: true,
  request: { params: SupplierIdParamSchema },
  responses: { 200: { description: 'Success', schema: SupplierResponseSchema } },
});

registerRoute({
  method: 'post',
  path: '/supplier',
  tags: ['Supplier'],
  summary: 'Create new supplier',
  protected: true,
  request: { body: CreateSupplierSchema },
  responses: { 201: { description: 'Created', schema: SupplierResponseSchema } },
});

registerRoute({
  method: 'put',
  path: '/supplier/{id}',
  tags: ['Supplier'],
  summary: 'Update supplier',
  protected: true,
  request: { params: SupplierIdParamSchema, body: UpdateSupplierSchema },
  responses: { 200: { description: 'Updated', schema: SupplierResponseSchema } },
});

registerRoute({
  method: 'delete',
  path: '/supplier/{id}',
  tags: ['Supplier'],
  summary: 'Delete supplier',
  protected: true,
  request: { params: SupplierIdParamSchema },
  responses: { 200: { description: 'Deleted' } },
});

// ROUTE DEFINITIONS
router.get('/',
  authenticate,
  validateResponse(SupplierListResponseSchema),
  controller.getAll
);

router.get('/:id',
  authenticate,
  validateRequest(SupplierIdParamSchema),
  validateResponse(SupplierResponseSchema),
  controller.getById
);

router.post('/',
  authenticate,
  validateRequest(CreateSupplierSchema),
  validateResponse(SupplierResponseSchema),
  controller.create
);

router.put('/:id',
  authenticate,
  validateRequest(SupplierIdParamSchema),
  validateRequest(UpdateSupplierSchema),
  validateResponse(SupplierResponseSchema),
  controller.update
);

router.delete('/:id',
  authenticate,
  validateRequest(SupplierIdParamSchema),
  controller.delete
);

export default router;
