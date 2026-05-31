import { Router } from 'express';
import { KlasifikasiStokController } from './klasifikasi-stok.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import { 
  KlasifikasiStokResponseSchema, 
  KlasifikasiStokListResponseSchema, 
  CreateKlasifikasiStokSchema, 
  UpdateKlasifikasiStokSchema, 
  KlasifikasiStokIdParamSchema 
} from './klasifikasi-stok.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const controller = new KlasifikasiStokController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/klasifikasi-stok',
  tags: ['Klasifikasi Stok'],
  summary: 'Get all stock classifications',
  protected: true,
  responses: { 200: { description: 'Success', schema: KlasifikasiStokListResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/klasifikasi-stok/{id}',
  tags: ['Klasifikasi Stok'],
  summary: 'Get stock classification by ID',
  protected: true,
  request: { params: KlasifikasiStokIdParamSchema },
  responses: { 200: { description: 'Success', schema: KlasifikasiStokResponseSchema } },
});

registerRoute({
  method: 'post',
  path: '/klasifikasi-stok',
  tags: ['Klasifikasi Stok'],
  summary: 'Create new stock classification',
  protected: true,
  request: { body: CreateKlasifikasiStokSchema },
  responses: { 201: { description: 'Created', schema: KlasifikasiStokResponseSchema } },
});

registerRoute({
  method: 'put',
  path: '/klasifikasi-stok/{id}',
  tags: ['Klasifikasi Stok'],
  summary: 'Update stock classification',
  protected: true,
  request: { params: KlasifikasiStokIdParamSchema, body: UpdateKlasifikasiStokSchema },
  responses: { 200: { description: 'Updated', schema: KlasifikasiStokResponseSchema } },
});

registerRoute({
  method: 'delete',
  path: '/klasifikasi-stok/{id}',
  tags: ['Klasifikasi Stok'],
  summary: 'Delete stock classification',
  protected: true,
  request: { params: KlasifikasiStokIdParamSchema },
  responses: { 200: { description: 'Deleted' } },
});

// ROUTE DEFINITIONS
router.get('/',
  authenticate,
  validateResponse(KlasifikasiStokListResponseSchema),
  controller.getAll
);

router.get('/:id',
  authenticate,
  validateRequest(KlasifikasiStokIdParamSchema),
  validateResponse(KlasifikasiStokResponseSchema),
  controller.getById
);

router.post('/',
  authenticate,
  validateRequest(CreateKlasifikasiStokSchema),
  validateResponse(KlasifikasiStokResponseSchema),
  controller.create
);

router.put('/:id',
  authenticate,
  validateRequest(KlasifikasiStokIdParamSchema),
  validateRequest(UpdateKlasifikasiStokSchema),
  validateResponse(KlasifikasiStokResponseSchema),
  controller.update
);

router.delete('/:id',
  authenticate,
  validateRequest(KlasifikasiStokIdParamSchema),
  controller.delete
);

export default router;
