import prisma from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreateStokSchema, UpdateStokSchema } from './stok.schema';
import { z } from 'zod';
import { Stok } from '../../../generated/prisma';
import { RiwayatAktivitasService } from '../riwayat-aktivitas/riwayat-aktivitas.service';

type CreateStokInput = z.infer<typeof CreateStokSchema>['body'];
type UpdateStokInput = z.infer<typeof UpdateStokSchema>['body'];

export class StokService {
  async getAll() {
    const stocks = await prisma.stok.findMany({
      orderBy: { dibuat_pada: 'desc' },
      include: {
        klasifikasi: {
          select: {
            id: true,
            jenis: true,
          },
        },
        supplier: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });
    return stocks.map((stock) => this.formatStock(stock));
  }

  async getById(id: number) {
    const stock = await prisma.stok.findUnique({
      where: { id },
      include: {
        klasifikasi: {
          select: {
            id: true,
            jenis: true,
          },
        },
        supplier: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });
    if (!stock) {
      throw new NotFoundError('Stock item not found', 'STOCK_NOT_FOUND');
    }
    return this.formatStock(stock);
  }

  async create(data: CreateStokInput, actorId: number) {
    // 1. SKU uniqueness check
    const skuExists = await prisma.stok.findUnique({ where: { kode_sku: data.kode_sku } });
    if (skuExists) {
      throw new ConflictError('SKU code already exists', 'SKU_ALREADY_EXISTS');
    }

    // 2. Classification exists check
    const classification = await prisma.klasifikasi_Stok.findUnique({ where: { id: data.klasifikasi_id } });
    if (!classification) {
      throw new NotFoundError('Stock classification not found', 'CLASSIFICATION_NOT_FOUND');
    }

    // 3. Supplier exists check
    const supplier = await prisma.supplier.findUnique({ where: { id: data.supplier_id } });
    if (!supplier) {
      throw new NotFoundError('Supplier not found', 'SUPPLIER_NOT_FOUND');
    }

    const stock = await prisma.stok.create({
      data: {
        ...data,
        tanggal_kedaluwarsa: data.tanggal_kedaluwarsa ? new Date(data.tanggal_kedaluwarsa) : null,
      },
    });

    const formatted = this.formatStock(stock);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Stok',
      recordId: stock.id.toString(),
      aksi: 'buat',
      dataBaru: formatted,
    });

    return formatted;
  }

  async update(id: number, data: UpdateStokInput, actorId: number) {
    const oldStock = await this.getById(id);

    // 1. SKU uniqueness check if changed
    if (data.kode_sku && data.kode_sku !== oldStock.kode_sku) {
      const skuExists = await prisma.stok.findUnique({ where: { kode_sku: data.kode_sku } });
      if (skuExists) {
        throw new ConflictError('SKU code already exists', 'SKU_ALREADY_EXISTS');
      }
    }

    // 2. Classification exists check if changed
    if (data.klasifikasi_id && data.klasifikasi_id !== oldStock.klasifikasi_id) {
      const classification = await prisma.klasifikasi_Stok.findUnique({ where: { id: data.klasifikasi_id } });
      if (!classification) {
        throw new NotFoundError('Stock classification not found', 'CLASSIFICATION_NOT_FOUND');
      }
    }

    // 3. Supplier exists check if changed
    if (data.supplier_id && data.supplier_id !== oldStock.supplier_id) {
      const supplier = await prisma.supplier.findUnique({ where: { id: data.supplier_id } });
      if (!supplier) {
        throw new NotFoundError('Supplier not found', 'SUPPLIER_NOT_FOUND');
      }
    }

    const updateData: any = { ...data };
    if (data.tanggal_kedaluwarsa !== undefined) {
      updateData.tanggal_kedaluwarsa = data.tanggal_kedaluwarsa ? new Date(data.tanggal_kedaluwarsa) : null;
    }

    const stock = await prisma.stok.update({
      where: { id },
      data: updateData,
    });

    const formatted = this.formatStock(stock);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Stok',
      recordId: id.toString(),
      aksi: 'edit',
      dataLama: oldStock,
      dataBaru: formatted,
    });

    return formatted;
  }

  async delete(id: number, actorId: number) {
    const oldStock = await this.getById(id);

    // Check usage in transactions or purchase order details
    const txCount = await prisma.transaksi_Stok.count({ where: { stok_id: id } });
    if (txCount > 0) {
      throw new ConflictError('Cannot delete stock item because it has associated transactions', 'STOCK_HAS_TRANSACTIONS');
    }

    const poCount = await prisma.detail_PO.count({ where: { stok_id: id } });
    if (poCount > 0) {
      throw new ConflictError('Cannot delete stock item because it is referenced in purchase orders', 'STOCK_HAS_PO_DETAILS');
    }

    await prisma.stok.delete({ where: { id } });

    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Stok',
      recordId: id.toString(),
      aksi: 'hapus',
      dataLama: oldStock,
    });
  }

  private formatStock(stock: Stok & { klasifikasi?: any; supplier?: any }) {
    return {
      ...stock,
      tanggal_kedaluwarsa: stock.tanggal_kedaluwarsa ? stock.tanggal_kedaluwarsa.toISOString() : null,
      dibuat_pada: stock.dibuat_pada.toISOString(),
      diperbarui_pada: stock.diperbarui_pada.toISOString(),
    };
  }
}
