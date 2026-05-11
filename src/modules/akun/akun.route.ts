import { Router } from 'express';
import { AkunController } from './akun.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import { 
  AkunResponseSchema, 
  AkunListResponseSchema, 
  CreateAkunSchema, 
  UpdateAkunSchema, 
  AkunIdParamSchema 
} from './akun.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const akunController = new AkunController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/akun',
  tags: ['Akun'],
  summary: 'Get all accounts',
  protected: true,
  responses: { 200: { description: 'Success', schema: AkunListResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/akun/profile',
  tags: ['Akun'],
  summary: 'Get current user profile',
  protected: true,
  responses: { 200: { description: 'Success', schema: AkunResponseSchema } },
});

registerRoute({
  method: 'get',
  path: '/akun/{id}',
  tags: ['Akun'],
  summary: 'Get account by ID',
  protected: true,
  request: { params: AkunIdParamSchema },
  responses: { 200: { description: 'Success', schema: AkunResponseSchema } },
});

registerRoute({
  method: 'post',
  path: '/akun',
  tags: ['Akun'],
  summary: 'Create new account',
  protected: true,
  request: { body: CreateAkunSchema },
  responses: { 201: { description: 'Created', schema: AkunResponseSchema } },
});

registerRoute({
  method: 'put',
  path: '/akun/{id}',
  tags: ['Akun'],
  summary: 'Update account',
  protected: true,
  request: { params: AkunIdParamSchema, body: UpdateAkunSchema },
  responses: { 200: { description: 'Updated', schema: AkunResponseSchema } },
});

registerRoute({
  method: 'delete',
  path: '/akun/{id}',
  tags: ['Akun'],
  summary: 'Delete account',
  protected: true,
  request: { params: AkunIdParamSchema },
  responses: { 200: { description: 'Deleted' } },
});

// ROUTE DEFINITIONS
router.get('/',
  authenticate,
  validateResponse(AkunListResponseSchema),
  akunController.getAll
);

router.get('/profile',
  authenticate,
  validateResponse(AkunResponseSchema),
  akunController.getProfile
);

router.get('/:id',
  authenticate,
  validateRequest(AkunIdParamSchema),
  validateResponse(AkunResponseSchema),
  akunController.getById
);

router.post('/',
  authenticate,
  validateRequest(CreateAkunSchema),
  validateResponse(AkunResponseSchema),
  akunController.create
);

router.put('/:id',
  authenticate,
  validateRequest(AkunIdParamSchema),
  validateRequest(UpdateAkunSchema),
  validateResponse(AkunResponseSchema),
  akunController.update
);

router.delete('/:id',
  authenticate,
  validateRequest(AkunIdParamSchema),
  akunController.delete
);

export default router;
