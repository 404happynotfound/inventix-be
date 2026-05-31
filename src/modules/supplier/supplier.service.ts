import prisma from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreateSupplierSchema, UpdateSupplierSchema } from './supplier.schema';
import { z } from 'zod';
import { Supplier } from '../../../generated/prisma';
import { RiwayatAktivitasService } from '../riwayat-aktivitas/riwayat-aktivitas.service';

type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>['body'];
type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>['body'];

export class SupplierService {
  async getAll() {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { dibuat_pada: 'desc' },
      include: {
        akun: {
          select: {
            nama: true,
            email: true,
            peran: true,
          },
        },
      },
    });
    return suppliers.map((supplier) => this.formatSupplier(supplier));
  }

  async getById(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        akun: {
          select: {
            nama: true,
            email: true,
            peran: true,
          },
        },
      },
    });
    if (!supplier) {
      throw new NotFoundError('Supplier not found', 'SUPPLIER_NOT_FOUND');
    }
    return this.formatSupplier(supplier);
  }

  async create(data: CreateSupplierInput, actorId: number) {
    // 1. Verify Akun exists
    const user = await prisma.akun.findUnique({ where: { id: data.user_id } });
    if (!user) {
      throw new NotFoundError('Associated user account not found', 'USER_NOT_FOUND');
    }

    // 2. Verify user_id is not already linked to another supplier
    const existingLink = await prisma.supplier.findUnique({ where: { user_id: data.user_id } });
    if (existingLink) {
      throw new ConflictError('User is already assigned to another supplier', 'USER_ALREADY_ASSIGNED');
    }

    const supplier = await prisma.supplier.create({
      data,
    });

    const formatted = this.formatSupplier(supplier);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Supplier',
      recordId: supplier.id.toString(),
      aksi: 'buat',
      dataBaru: formatted,
    });

    return formatted;
  }

  async update(id: number, data: UpdateSupplierInput, actorId: number) {
    const oldSupplier = await this.getById(id);

    if (data.user_id && data.user_id !== oldSupplier.user_id) {
      // 1. Verify Akun exists
      const user = await prisma.akun.findUnique({ where: { id: data.user_id } });
      if (!user) {
        throw new NotFoundError('Associated user account not found', 'USER_NOT_FOUND');
      }

      // 2. Verify user_id is not already linked to another supplier
      const existingLink = await prisma.supplier.findUnique({ where: { user_id: data.user_id } });
      if (existingLink) {
        throw new ConflictError('User is already assigned to another supplier', 'USER_ALREADY_ASSIGNED');
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data,
    });

    const formatted = this.formatSupplier(supplier);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Supplier',
      recordId: id.toString(),
      aksi: 'edit',
      dataLama: oldSupplier,
      dataBaru: formatted,
    });

    return formatted;
  }

  async delete(id: number, actorId: number) {
    const oldSupplier = await this.getById(id);

    // Check if supplier is linked to existing stock or purchase orders
    const stockCount = await prisma.stok.count({ where: { supplier_id: id } });
    if (stockCount > 0) {
      throw new ConflictError('Cannot delete supplier because it is linked to existing stocks', 'SUPPLIER_HAS_STOCKS');
    }

    const poCount = await prisma.purchase_Order.count({ where: { supplier_id: id } });
    if (poCount > 0) {
      throw new ConflictError('Cannot delete supplier because it is linked to existing purchase orders', 'SUPPLIER_HAS_POS');
    }

    await prisma.supplier.delete({ where: { id } });

    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Supplier',
      recordId: id.toString(),
      aksi: 'hapus',
      dataLama: oldSupplier,
    });
  }

  private formatSupplier(supplier: Supplier & { akun?: any }) {
    return {
      ...supplier,
      dibuat_pada: supplier.dibuat_pada.toISOString(),
      diperbarui_pada: supplier.diperbarui_pada.toISOString(),
    };
  }
}
