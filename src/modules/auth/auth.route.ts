import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validate';
import { validateResponse } from '../../middlewares/validateResponse';
import { RegisterRequestSchema, LoginRequestSchema, AuthResponseSchema } from './auth.schema';
import { registerRoute } from '../../utils/openapi';

const router = Router();
const authController = new AuthController();

// REGISTER ROUTE DOCS
registerRoute({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: { body: RegisterRequestSchema },
  responses: { 200: { description: 'Success', schema: AuthResponseSchema } },
});

registerRoute({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'User login',
  request: { body: LoginRequestSchema },
  responses: { 200: { description: 'Success', schema: AuthResponseSchema } },
});

// ROUTE DEFINITIONS
router.post(
  '/register',
  validateRequest(RegisterRequestSchema),
  validateResponse(AuthResponseSchema),
  authController.register
);

router.post(
  '/login',
  validateRequest(LoginRequestSchema),
  validateResponse(AuthResponseSchema),
  authController.login
);

export default router;
