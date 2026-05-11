import { UserRepository } from './user.repository';
import { NotFoundError } from '../../utils/errors';

export class UserService {
  private userRepository = new UserRepository();

  async getProfile(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    // Omit password
    const { password, ...userWithoutPassword } = user;
    // Map dates to strings for Zod validation
    return {
      ...userWithoutPassword,
      createdAt: userWithoutPassword.createdAt.toISOString(),
      updatedAt: userWithoutPassword.updatedAt.toISOString(),
    };
  }
}
