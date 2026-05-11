import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { z } from 'zod';
import { RegisterRequestSchema, LoginRequestSchema } from './auth.schema';
import { ConflictError, UnauthorizedError } from '../../utils/errors';

type RegisterInput = z.infer<typeof RegisterRequestSchema>['body'];
type LoginInput = z.infer<typeof LoginRequestSchema>['body'];

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictError('Email already in use', 'EMAIL_IN_USE');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    return this.generateAuthResponse(user);
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: any) {
    const secret = process.env.JWT_SECRET || 'supersecret';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1d' });
    
    const { password, ...userWithoutPassword } = user;
    
    return {
      token,
      user: {
        ...userWithoutPassword,
        createdAt: userWithoutPassword.createdAt.toISOString(),
        updatedAt: userWithoutPassword.updatedAt.toISOString(),
      },
    };
  }
}
