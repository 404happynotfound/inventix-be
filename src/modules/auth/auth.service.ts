import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { z } from 'zod';
import { RegisterRequestSchema, LoginRequestSchema } from './auth.schema';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import { env } from '../../config/env';

type RegisterInput = z.infer<typeof RegisterRequestSchema>['body'];
type LoginInput = z.infer<typeof LoginRequestSchema>['body'];

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.akun.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictError('Email sudah digunakan', 'EMAIL_IN_USE');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.akun.create({
      data: {
        email: data.email,
        password: hashedPassword,
        nama: data.nama,
        peran: data.peran,
      },
    });

    return this.generateAuthResponse(user);
  }

  async login(data: LoginInput) {
    const user = await prisma.akun.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedError('Kredensial tidak valid', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Kredensial tidak valid', 'INVALID_CREDENTIALS');
    }

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: any) {
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    const { password, ...userWithoutPassword } = user;
    
    return {
      token,
      user: {
        ...userWithoutPassword,
        dibuat_pada: userWithoutPassword.dibuat_pada.toISOString(),
        diperbarui_pada: userWithoutPassword.diperbarui_pada.toISOString(),
      },
    };
  }
}
