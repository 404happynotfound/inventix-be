import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateResponse } from '../../middlewares/validateResponse';
import { GetUserResponseSchema } from './user.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const userController = new UserController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'get',
  path: '/user/profile',
  tags: ['User'],
  summary: 'Get current user profile',
  protected: true,
  responses: { 200: { description: 'Success', schema: GetUserResponseSchema } },
});

// ROUTE DEFINITIONS
router.get('/profile',
  authenticate,
  validateResponse(GetUserResponseSchema),
  userController.getProfile
);

export default router;
