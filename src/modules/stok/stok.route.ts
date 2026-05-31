import { Router } from 'express';
import { StokController } from './stok.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import { 
  StokResponseSchema, 
  StokListResponseSchema, 
  CreateStokSchema, 
  UpdateStokSchema, 
  StokIdParamSchema 
} from './stok.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new StokController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/stok',
  tags: ['Stok'],
  summary: 'Get all stock items',
  protected: true,
  responses: { 200: { description: 'Success', schema: StokListResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/stok/{id}',
  tags: ['Stok'],
  summary: 'Get stock item by ID',
  protected: true,
  request: { params: StokIdParamSchema },
  responses: { 200: { description: 'Success', schema: StokResponseSchema } },
});

registerRoute({
  method: 'post',
  path: '/stok',
  tags: ['Stok'],
  summary: 'Create new stock item',
  protected: true,
  request: { body: CreateStokSchema },
  responses: { 201: { description: 'Created', schema: StokResponseSchema } },
});

registerRoute({
  method: 'put',
  path: '/stok/{id}',
  tags: ['Stok'],
  summary: 'Update stock item',
  protected: true,
  request: { params: StokIdParamSchema, body: UpdateStokSchema },
  responses: { 200: { description: 'Updated', schema: StokResponseSchema } },
});

registerRoute({
  method: 'delete',
  path: '/stok/{id}',
  tags: ['Stok'],
  summary: 'Delete stock item',
  protected: true,
  request: { params: StokIdParamSchema },
  responses: { 200: { description: 'Deleted' } },
});

// ROUTE DEFINITIONS
router.get('/',
  authenticate,
  validateResponse(StokListResponseSchema),
  controller.getAll
);

router.get('/:id',
  authenticate,
  validateRequest(StokIdParamSchema),
  validateResponse(StokResponseSchema),
  controller.getById
);

router.post('/',
  authenticate,
  validateRequest(CreateStokSchema),
  validateResponse(StokResponseSchema),
  controller.create
);

router.put('/:id',
  authenticate,
  validateRequest(StokIdParamSchema),
  validateRequest(UpdateStokSchema),
  validateResponse(StokResponseSchema),
  controller.update
);

router.delete('/:id',
  authenticate,
  validateRequest(StokIdParamSchema),
  controller.delete
);

export default router;
