import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../utils/response';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    res.json(successResponse(result, 'User registered successfully'));
  };

  login = async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    res.json(successResponse(result, 'Login successful'));
  };
}
