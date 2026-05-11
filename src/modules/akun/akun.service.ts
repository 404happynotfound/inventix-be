import bcrypt from 'bcrypt';
import prisma from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreateAkunSchema, UpdateAkunSchema } from './akun.schema';
import { z } from 'zod';
import { akun, Prisma } from '@prisma/client';

type CreateAkunInput = z.infer<typeof CreateAkunSchema>['body'];
type UpdateAkunInput = z.infer<typeof UpdateAkunSchema>['body'];

export class AkunService {
  async getAll() {
    const akuns = await prisma.akun.findMany();
    return akuns.map((akun) => this.omitPassword(akun));
  }

  async getById(uniqueID: number) {
    const akun = await prisma.akun.findUnique({ where: { uniqueID } });
    if (!akun) {
      throw new NotFoundError('Account not found', 'ACCOUNT_NOT_FOUND');
    }
    return this.omitPassword(akun);
  }

  async create(data: CreateAkunInput) {
    const existing = await prisma.akun.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError('Email already in use', 'EMAIL_IN_USE');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.akun.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return this.omitPassword(user);
  }

  async update(uniqueID: number, data: UpdateAkunInput) {
    await this.getById(uniqueID);

    if (data.email) {
      const existing = await prisma.akun.findUnique({ where: { email: data.email } });
      if (existing && existing.uniqueID !== uniqueID) {
        throw new ConflictError('Email already in use', 'EMAIL_IN_USE');
      }
    }

    const updateData: Prisma.akunUpdateInput = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.akun.update({
      where: { uniqueID },
      data: updateData,
    });
    return this.omitPassword(updated);
  }

  async delete(uniqueID: number) {
    await this.getById(uniqueID);
    await prisma.akun.delete({ where: { uniqueID } });
  }

  private omitPassword(akun: akun) {
    const { password, ...akunWithoutPassword } = akun;
    return {
      ...akunWithoutPassword,
      dibuat_pada: akunWithoutPassword.dibuat_pada.toISOString(),
      diperbarui_pada: akunWithoutPassword.diperbarui_pada.toISOString(),
    };
  }
}
