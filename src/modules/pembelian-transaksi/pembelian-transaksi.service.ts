import prisma from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreateTransaksiStokSchema, CreateTransaksiStokBulkSchema } from './pembelian-transaksi.schema';
import { z } from 'zod';
import { Transaksi_Stok } from '../../../generated/prisma';
import { RiwayatAktivitasService } from '../riwayat-aktivitas/riwayat-aktivitas.service';

type CreateTransaksiStokInput = z.infer<typeof CreateTransaksiStokSchema>['body'];
type CreateTransaksiStokBulkInput = z.infer<typeof CreateTransaksiStokBulkSchema>['body'];

export class TransaksiStokService {
  async getAll() {
    const transactions = await prisma.transaksi_Stok.findMany({
      orderBy: { dibuat_pada: 'desc' },
      include: {
        akun: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        stok: {
          select: {
            id: true,
            nama: true,
            kode_sku: true,
          },
        },
      },
    });
    return transactions.map((tx) => this.formatTransaction(tx));
  }

  async getById(id: number) {
    const tx = await prisma.transaksi_Stok.findUnique({
      where: { id },
      include: {
        akun: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        stok: {
          select: {
            id: true,
            nama: true,
            kode_sku: true,
          },
        },
      },
    });
    if (!tx) {
      throw new NotFoundError('Stock transaction not found', 'TRANSACTION_NOT_FOUND');
    }
    return this.formatTransaction(tx);
  }

  async create(data: CreateTransaksiStokInput, actorId: number) {
    // Perform atomically in a transaction to prevent race conditions
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Fetch stock item
      const stock = await tx.stok.findUnique({
        where: { id: data.stok_id },
      });
      if (!stock) {
        throw new NotFoundError('Stock item not found', 'STOCK_NOT_FOUND');
      }

      // 2. If detail_po_id is provided, verify it exists
      if (data.detail_po_id) {
        const poDetail = await tx.detail_PO.findUnique({
          where: { id: data.detail_po_id },
        });
        if (!poDetail) {
          throw new NotFoundError('PO Detail not found', 'PO_DETAIL_NOT_FOUND');
        }
      }

      // 3. Compute new stock quantities
      const jumlahSebelum = stock.jumlah_saat_ini;
      let jumlahSesudah = jumlahSebelum;

      if (data.jenis === 'masuk' || data.jenis === 'lainnya') {
        jumlahSesudah += data.jumlah;
      } else if (data.jenis === 'keluar') {
        jumlahSesudah -= data.jumlah;
        if (jumlahSesudah < 0) {
          throw new ConflictError(`Insufficient stock. Current: ${jumlahSebelum}, requested reduction: ${data.jumlah}`, 'INSUFFICIENT_STOCK');
        }
      }

      // 4. Update the stock quantity
      await tx.stok.update({
        where: { id: data.stok_id },
        data: { jumlah_saat_ini: jumlahSesudah },
      });

      // 5. Create transaction record
      const record = await tx.transaksi_Stok.create({
        data: {
          akun_id: actorId,
          stok_id: data.stok_id,
          detail_po_id: data.detail_po_id,
          jenis: data.jenis,
          jumlah: data.jumlah,
          jumlah_sebelum: jumlahSebelum,
          jumlah_sesudah: jumlahSesudah,
        },
      });

      return record;
    });

    const formatted = this.formatTransaction(transaction);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Transaksi_Stok',
      recordId: transaction.id.toString(),
      aksi: 'buat',
      dataBaru: formatted,
    });

    return formatted;
  }

  async createBulk(data: CreateTransaksiStokBulkInput, actorId: number) {
    // Perform all updates atomically in a single transaction to prevent race conditions and partial stock updates
    const transactions = await prisma.$transaction(async (tx) => {
      const records = [];

      for (const item of data.transaksi) {
        // 1. Fetch stock item
        const stock = await tx.stok.findUnique({
          where: { id: item.stok_id },
        });
        if (!stock) {
          throw new NotFoundError(`Stock item with ID ${item.stok_id} not found`, 'STOCK_NOT_FOUND');
        }

        // 2. If detail_po_id is provided, verify it exists
        if (item.detail_po_id) {
          const poDetail = await tx.detail_PO.findUnique({
            where: { id: item.detail_po_id },
          });
          if (!poDetail) {
            throw new NotFoundError(`PO Detail with ID ${item.detail_po_id} not found`, 'PO_DETAIL_NOT_FOUND');
          }
        }

        // 3. Compute new stock quantities
        const jumlahSebelum = stock.jumlah_saat_ini;
        let jumlahSesudah = jumlahSebelum;

        if (item.jenis === 'masuk' || item.jenis === 'lainnya') {
          jumlahSesudah += item.jumlah;
        } else if (item.jenis === 'keluar') {
          jumlahSesudah -= item.jumlah;
          if (jumlahSesudah < 0) {
            throw new ConflictError(
              `Insufficient stock for item "${stock.nama}" (ID ${item.stok_id}). Current: ${jumlahSebelum}, requested reduction: ${item.jumlah}`,
              'INSUFFICIENT_STOCK'
            );
          }
        }

        // 4. Update the stock quantity
        await tx.stok.update({
          where: { id: item.stok_id },
          data: { jumlah_saat_ini: jumlahSesudah },
        });

        // 5. Create transaction record
        const record = await tx.transaksi_Stok.create({
          data: {
            akun_id: actorId,
            stok_id: item.stok_id,
            detail_po_id: item.detail_po_id,
            jenis: item.jenis,
            jumlah: item.jumlah,
            jumlah_sebelum: jumlahSebelum,
            jumlah_sesudah: jumlahSesudah,
          },
        });

        records.push(record);
      }

      return records;
    });

    const formattedRecords = transactions.map((txRecord) => this.formatTransaction(txRecord));

    // Log to riwayat aktivitas for each created transaction
    for (const record of formattedRecords) {
      await RiwayatAktivitasService.log({
        akunId: actorId,
        namaTabel: 'Transaksi_Stok',
        recordId: record.id.toString(),
        aksi: 'buat',
        dataBaru: record,
      });
    }

    return formattedRecords;
  }

  async delete(id: number, actorId: number) {
    const oldTx = await this.getById(id);

    // Atomically reverse and delete in a transaction
    await prisma.$transaction(async (tx) => {
      const stock = await tx.stok.findUnique({
        where: { id: oldTx.stok_id },
      });
      if (!stock) {
        throw new NotFoundError('Stock item not found', 'STOCK_NOT_FOUND');
      }

      // Reverse calculations
      let reversedStock = stock.jumlah_saat_ini;
      if (oldTx.jenis === 'masuk' || oldTx.jenis === 'lainnya') {
        reversedStock -= oldTx.jumlah;
        if (reversedStock < 0) {
          throw new ConflictError('Cannot delete transaction: reversing it would result in negative stock quantity', 'REVERSAL_NEGATES_STOCK');
        }
      } else if (oldTx.jenis === 'keluar') {
        reversedStock += oldTx.jumlah;
      }

      // 1. Update stock
      await tx.stok.update({
        where: { id: oldTx.stok_id },
        data: { jumlah_saat_ini: reversedStock },
      });

      // 2. Delete transaction record
      await tx.transaksi_Stok.delete({
        where: { id },
      });
    });

    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Transaksi_Stok',
      recordId: id.toString(),
      aksi: 'hapus',
      dataLama: oldTx,
    });
  }

  private formatTransaction(tx: Transaksi_Stok & { akun?: any; stok?: any }) {
    return {
      ...tx,
      dibuat_pada: tx.dibuat_pada.toISOString(),
    };
  }
}
