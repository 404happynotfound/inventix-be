import bcrypt from 'bcrypt';
import prisma from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreateAkunSchema, UpdateAkunSchema } from './akun.schema';
import { z } from 'zod';
import { Akun, Prisma } from '../../../generated/prisma';

type CreateAkunInput = z.infer<typeof CreateAkunSchema>['body'];
type UpdateAkunInput = z.infer<typeof UpdateAkunSchema>['body'];

export class AkunService {
  async getAll() {
    const akuns = await prisma.akun.findMany();
    return akuns.map((akun) => this.omitPassword(akun));
  }

  async getById(id: number) {
    const akun = await prisma.akun.findUnique({ where: { id } });
    if (!akun) {
      throw new NotFoundError('Akun tidak ditemukan', 'ACCOUNT_NOT_FOUND');
    }
    return this.omitPassword(akun);
  }

  async create(data: CreateAkunInput) {
    const existing = await prisma.akun.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError('Email sudah digunakan', 'EMAIL_IN_USE');
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

  async update(id: number, data: UpdateAkunInput) {
    await this.getById(id);

    if (data.email) {
      const existing = await prisma.akun.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw new ConflictError('Email sudah digunakan', 'EMAIL_IN_USE');
      }
    }

    const updateData: Prisma.AkunUpdateInput = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.akun.update({
      where: { id },
      data: updateData,
    });
    return this.omitPassword(updated);
  }

  async delete(id: number) {
    await this.getById(id);
    await prisma.akun.delete({ where: { id } });
  }

  private omitPassword(akun: Akun) {
    const { password, ...akunWithoutPassword } = akun;
    return {
      ...akunWithoutPassword,
      dibuat_pada: akunWithoutPassword.dibuat_pada.toISOString(),
      diperbarui_pada: akunWithoutPassword.diperbarui_pada.toISOString(),
    };
  }
}
