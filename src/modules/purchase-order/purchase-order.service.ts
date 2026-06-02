import prisma from '../../config/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreatePurchaseOrderSchema, UpdatePurchaseOrderSchema } from './purchase-order.schema';
import { z } from 'zod';
import { Purchase_Order, Detail_PO, StatusPO } from '../../../generated/prisma';
import { RiwayatAktivitasService } from '../riwayat-aktivitas/riwayat-aktivitas.service';

type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderSchema>['body'];
type UpdatePurchaseOrderInput = z.infer<typeof UpdatePurchaseOrderSchema>['body'];

export class PurchaseOrderService {
  async getAll() {
    const pos = await prisma.purchase_Order.findMany({
      orderBy: { dibuat_pada: 'desc' },
      include: {
        pembuat: {
          select: { id: true, nama: true },
        },
        penyetuju: {
          select: { id: true, nama: true },
        },
        supplier: {
          select: { id: true, nama: true },
        },
        detail_po: {
          include: {
            stok: {
              select: { id: true, nama: true, kode_sku: true },
            },
          },
        },
      },
    });
    return pos.map((po) => this.formatPO(po));
  }

  async getById(id: number) {
    const po = await prisma.purchase_Order.findUnique({
      where: { id },
      include: {
        pembuat: {
          select: { id: true, nama: true },
        },
        penyetuju: {
          select: { id: true, nama: true },
        },
        supplier: {
          select: { id: true, nama: true },
        },
        detail_po: {
          include: {
            stok: {
              select: { id: true, nama: true, kode_sku: true },
            },
          },
        },
      },
    });
    if (!po) {
      throw new NotFoundError('Purchase Order not found', 'PO_NOT_FOUND');
    }
    return this.formatPO(po);
  }

  async create(data: CreatePurchaseOrderInput, actorId: number) {
    // Automate unique PO number if not provided
    const nomorPo = data.nomor_po || `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const poWithDetails = await prisma.$transaction(async (tx) => {
      // 1. Verify supplier
      const supplier = await tx.supplier.findUnique({ where: { id: data.supplier_id } });
      if (!supplier) {
        throw new NotFoundError('Supplier not found', 'SUPPLIER_NOT_FOUND');
      }

      // 2. Verify all stock items and calculate total value
      let calculatedTotal = 0;
      for (const item of data.detail_po) {
        const stock = await tx.stok.findUnique({ where: { id: item.stok_id } });
        if (!stock) {
          throw new NotFoundError(`Stock item with ID ${item.stok_id} not found`, 'STOCK_NOT_FOUND');
        }
        calculatedTotal += item.jumlah_dipesan * item.harga_satuan;
      }

      // 3. Determine status based on amount threshold
      const poStatus = calculatedTotal >= 500000 ? 'MENUNGGU_PERSETUJUAN' : 'DISETUJUI';

      // 4. Create PO header
      const po = await tx.purchase_Order.create({
        data: {
          nomor_po: nomorPo,
          dibuat_oleh: actorId,
          supplier_id: data.supplier_id,
          total_nilai: BigInt(calculatedTotal),
          catatan: data.catatan,
          status: poStatus,
          status_supplier: 'MENUNGGU_KONFIRMASI',
        },
      });

      // 4. Create PO details
      for (const item of data.detail_po) {
        await tx.detail_PO.create({
          data: {
            po_id: po.id,
            stok_id: item.stok_id,
            jumlah_dipesan: item.jumlah_dipesan,
            jumlah_diterima: item.jumlah_diterima || 0,
            harga_satuan: item.harga_satuan,
          },
        });
      }

      // Fetch created PO with details to return
      return tx.purchase_Order.findUnique({
        where: { id: po.id },
        include: {
          detail_po: true,
        },
      });
    });

    const formatted = this.formatPO(poWithDetails!);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Purchase_Order',
      recordId: formatted.id.toString(),
      aksi: 'buat',
      dataBaru: formatted,
    });

    return formatted;
  }

  async update(id: number, data: UpdatePurchaseOrderInput, actorId: number) {
    const oldPO = await this.getById(id);

    if (oldPO.status === 'SELESAI' || oldPO.status === 'DIBATALKAN') {
      throw new ConflictError(`Cannot update Purchase Order because it is already in ${oldPO.status} state`, 'PO_IMMUTABLE');
    }

    const updatedPO = await prisma.$transaction(async (tx) => {
      // 1. Process Stock reception if PO is being set to completed (SELESAI)
      if (data.status === 'SELESAI' && oldPO.status !== 'SELESAI') {
        const poDetails = await tx.detail_PO.findMany({ where: { po_id: id } });
        
        for (const item of poDetails) {
          const jumlahTerima = item.jumlah_diterima > 0 ? item.jumlah_diterima : item.jumlah_dipesan;
          
          // Fetch current stock
          const stock = await tx.stok.findUnique({ where: { id: item.stok_id } });
          if (!stock) {
            throw new NotFoundError(`Stock item ${item.stok_id} not found during stock reception`, 'STOCK_NOT_FOUND');
          }

          const stockBefore = stock.jumlah_saat_ini;
          const stockAfter = stockBefore + jumlahTerima;

          // Update stock qty
          await tx.stok.update({
            where: { id: item.stok_id },
            data: { jumlah_saat_ini: stockAfter },
          });

          // Update actual received qty in Detail_PO if it was 0
          if (item.jumlah_diterima === 0) {
            await tx.detail_PO.update({
              where: { id: item.id },
              data: { jumlah_diterima: jumlahTerima },
            });
          }

          // Create stock incoming transaction record
          await tx.transaksi_Stok.create({
            data: {
              akun_id: actorId,
              stok_id: item.stok_id,
              detail_po_id: item.id,
              jenis: 'masuk',
              jumlah: jumlahTerima,
              jumlah_sebelum: stockBefore,
              jumlah_sesudah: stockAfter,
            },
          });
        }
      }

      // 2. Perform detail updates if provided
      if (data.detail_po) {
        // Drop existing details and create new ones (or do upserts)
        await tx.detail_PO.deleteMany({ where: { po_id: id } });
        
        let calculatedTotal = 0;
        for (const item of data.detail_po) {
          const stock = await tx.stok.findUnique({ where: { id: item.stok_id } });
          if (!stock) {
            throw new NotFoundError(`Stock item with ID ${item.stok_id} not found`, 'STOCK_NOT_FOUND');
          }
          calculatedTotal += item.jumlah_dipesan * item.harga_satuan;

          await tx.detail_PO.create({
            data: {
              po_id: id,
              stok_id: item.stok_id,
              jumlah_dipesan: item.jumlah_dipesan,
              jumlah_diterima: item.jumlah_diterima || 0,
              harga_satuan: item.harga_satuan,
            },
          });
        }
        
        // Save recalculated total
        data.supplier_id = data.supplier_id || oldPO.supplier_id;
        (data as any).total_nilai = BigInt(calculatedTotal);
      }

      // 3. Prepare update data
      const updatePayload: any = { ...data };
      delete updatePayload.detail_po; // remove nested array before updating PO table

      if (data.disetujui_oleh) {
        updatePayload.tanggal_disetujui = new Date();
      }
      if (data.tanggal_disetujui) updatePayload.tanggal_disetujui = new Date(data.tanggal_disetujui);
      if (data.tanggal_konfirmasi_supplier) updatePayload.tanggal_konfirmasi_supplier = new Date(data.tanggal_konfirmasi_supplier);
      if (data.tanggal_kedatangan) updatePayload.tanggal_kedatangan = new Date(data.tanggal_kedatangan);

      // 4. Update PO header
      return tx.purchase_Order.update({
        where: { id },
        data: updatePayload,
        include: {
          detail_po: true,
        },
      });
    });

    const formatted = this.formatPO(updatedPO);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Purchase_Order',
      recordId: id.toString(),
      aksi: 'edit',
      dataLama: oldPO,
      dataBaru: formatted,
    });

    return formatted;
  }

  async delete(id: number, actorId: number) {
    const oldPO = await this.getById(id);

    if (oldPO.status === 'SELESAI') {
      throw new ConflictError('Cannot delete a completed Purchase Order', 'PO_COMPLETED_INDESTRUCTIBLE');
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete PO details
      await tx.detail_PO.deleteMany({ where: { po_id: id } });

      // 2. Delete PO header
      await tx.purchase_Order.delete({ where: { id } });
    });

    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Purchase_Order',
      recordId: id.toString(),
      aksi: 'hapus',
      dataLama: oldPO,
    });
  }

  async ownerApprove(id: number, ownerId: number) {
    const po = await this.getById(id);

    if (po.status !== 'MENUNGGU_PERSETUJUAN') {
      throw new ConflictError('PO is not awaiting owner approval', 'PO_NOT_PENDING');
    }

    const updated = await prisma.purchase_Order.update({
      where: { id },
      data: {
        status: 'DISETUJUI',
        disetujui_oleh: ownerId,
        tanggal_disetujui: new Date(),
      },
      include: { detail_po: true },
    });

    const formatted = this.formatPO(updated);
    await RiwayatAktivitasService.log({
      akunId: ownerId,
      namaTabel: 'Purchase_Order',
      recordId: id.toString(),
      aksi: 'edit',
      dataLama: po,
      dataBaru: formatted,
    });

    return formatted;
  }

  async ownerReject(id: number, ownerId: number) {
    const po = await this.getById(id);

    if (po.status !== 'MENUNGGU_PERSETUJUAN') {
      throw new ConflictError('PO is not awaiting owner approval', 'PO_NOT_PENDING');
    }

    const updated = await prisma.purchase_Order.update({
      where: { id },
      data: {
        status: 'DITOLAK',
        disetujui_oleh: ownerId,
        tanggal_disetujui: new Date(),
      },
      include: { detail_po: true },
    });

    const formatted = this.formatPO(updated);
    await RiwayatAktivitasService.log({
      akunId: ownerId,
      namaTabel: 'Purchase_Order',
      recordId: id.toString(),
      aksi: 'edit',
      dataLama: po,
      dataBaru: formatted,
    });

    return formatted;
  }

  async supplierConfirm(id: number, actorId: number) {
    const po = await this.getById(id);

    if (po.status !== 'DISETUJUI') {
      throw new ConflictError('PO must be approved by owner before supplier can confirm', 'PO_NOT_APPROVED');
    }
    if (po.status_supplier === 'DIKONFIRMASI') {
      throw new ConflictError('PO already confirmed by supplier', 'PO_ALREADY_CONFIRMED');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update PO status
      const updatedPO = await tx.purchase_Order.update({
        where: { id },
        data: {
          status_supplier: 'DIKONFIRMASI',
          status: 'SELESAI',
          tanggal_konfirmasi_supplier: new Date(),
        },
        include: { detail_po: true },
      });

      // 2. Increment stock for each detail item
      for (const item of updatedPO.detail_po) {
        const jumlahTerima = item.jumlah_diterima > 0 ? item.jumlah_diterima : item.jumlah_dipesan;

        const stock = await tx.stok.findUnique({ where: { id: item.stok_id } });
        if (!stock) continue;

        const stockBefore = stock.jumlah_saat_ini;
        const stockAfter = stockBefore + jumlahTerima;

        await tx.stok.update({
          where: { id: item.stok_id },
          data: { jumlah_saat_ini: stockAfter },
        });

        if (item.jumlah_diterima === 0) {
          await tx.detail_PO.update({
            where: { id: item.id },
            data: { jumlah_diterima: jumlahTerima },
          });
        }

        await tx.transaksi_Stok.create({
          data: {
            akun_id: actorId,
            stok_id: item.stok_id,
            detail_po_id: item.id,
            jenis: 'masuk',
            jumlah: jumlahTerima,
            jumlah_sebelum: stockBefore,
            jumlah_sesudah: stockAfter,
          },
        });
      }

      return updatedPO;
    });

    const formatted = this.formatPO(updated);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Purchase_Order',
      recordId: id.toString(),
      aksi: 'edit',
      dataLama: po,
      dataBaru: formatted,
    });

    return formatted;
  }

  async supplierReject(id: number, actorId: number) {
    const po = await this.getById(id);

    if (po.status !== 'DISETUJUI') {
      throw new ConflictError('PO must be approved before supplier can reject', 'PO_NOT_APPROVED');
    }
    if (po.status_supplier !== 'MENUNGGU_KONFIRMASI') {
      throw new ConflictError('PO supplier status is not pending', 'PO_SUPPLIER_NOT_PENDING');
    }

    const updated = await prisma.purchase_Order.update({
      where: { id },
      data: {
        status_supplier: 'DITOLAK',
        status: 'DITOLAK',
        tanggal_konfirmasi_supplier: new Date(),
      },
      include: { detail_po: true },
    });

    const formatted = this.formatPO(updated);
    await RiwayatAktivitasService.log({
      akunId: actorId,
      namaTabel: 'Purchase_Order',
      recordId: id.toString(),
      aksi: 'edit',
      dataLama: po,
      dataBaru: formatted,
    });

    return formatted;
  }

  private formatPO(po: any) {
    const formatted = { ...po };
    
    // Safely convert BigInt to string for JSON output
    if (po.total_nilai !== undefined) {
      formatted.total_nilai = po.total_nilai.toString();
    }
    
    // Format dates
    if (po.tanggal_po) formatted.tanggal_po = po.tanggal_po.toISOString();
    if (po.tanggal_disetujui) formatted.tanggal_disetujui = po.tanggal_disetujui.toISOString();
    if (po.tanggal_konfirmasi_supplier) formatted.tanggal_konfirmasi_supplier = po.tanggal_konfirmasi_supplier.toISOString();
    if (po.tanggal_kedatangan) formatted.tanggal_kedatangan = po.tanggal_kedatangan.toISOString();
    if (po.dibuat_pada) formatted.dibuat_pada = po.dibuat_pada.toISOString();
    if (po.diperbarui_pada) formatted.diperbarui_pada = po.diperbarui_pada.toISOString();

    if (po.detail_po) {
      formatted.detail_po = po.detail_po.map((item: any) => ({
        ...item,
        dibuat_pada: item.dibuat_pada.toISOString(),
      }));
    }

    return formatted;
  }
}
