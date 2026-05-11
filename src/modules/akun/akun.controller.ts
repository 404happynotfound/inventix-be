import { Response } from 'express';
import { UserService } from './user.service';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { successResponse } from '../../utils/response';

export class UserController {
  private userService = new UserService();

  getProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const user = await this.userService.getProfile(userId);
    res.json(successResponse(user));
  };
}
