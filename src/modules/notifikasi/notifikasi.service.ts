import prisma from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';
import { JenisNotifikasi } from '../../../generated/prisma';

export class NotifikasiService {
  async getAll(page: number = 1, limit: number = 10, isRead?: boolean, jenis?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (isRead !== undefined) where.is_read = isRead;
    if (jenis) where.jenis_notif = jenis;

    const [notifications, total] = await Promise.all([
      prisma.notifikasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dibuat_pada: 'desc' },
        include: {
          barang: {
            select: {
              id: true,
              nama: true,
              kode_sku: true,
            },
          },
        },
      }),
      prisma.notifikasi.count({ where }),
    ]);

    return {
      data: notifications.map(n => this.formatNotifikasi(n)),
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: number) {
    const notification = await prisma.notifikasi.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundError('Notifikasi tidak ditemukan', 'NOTIFIKASI_NOT_FOUND');
    }

    const updated = await prisma.notifikasi.update({
      where: { id },
      data: { is_read: true },
      include: {
        barang: {
          select: {
            id: true,
            nama: true,
            kode_sku: true,
          },
        },
      },
    });

    return this.formatNotifikasi(updated);
  }

  async markAllAsRead() {
    await prisma.notifikasi.updateMany({
      where: { is_read: false },
      data: { is_read: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async checkNotifications() {
    const results = await this.performNotificationCheck();
    return results;
  }

  async performNotificationCheck() {
    // Check for stok_minimum using Prisma Client
    const lowStockItems = await prisma.stok.findMany({
      where: {
        jumlah_saat_ini: {
          lt: 10,
        },
      },
      select: {
        id: true,
        nama: true,
        kode_sku: true,
        jumlah_saat_ini: true,
      },
    });

    for (const item of lowStockItems) {
      await this.createNotifikasiIfNotExists(
        item.id,
        'stok_minimum' as const,
        `Stok barang ${item.nama} (${item.kode_sku}) telah mencapai atau berada di bawah stok minimum.`
      );
    }

    // Check for expiry date (7 days from now)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiryItems = await prisma.stok.findMany({
      where: {
        AND: [
          { tanggal_kedaluwarsa: { not: null } },
          { tanggal_kedaluwarsa: { lte: sevenDaysFromNow } },
          { tanggal_kedaluwarsa: { gt: new Date() } },
        ],
      },
      select: {
        id: true,
        nama: true,
        kode_sku: true,
        tanggal_kedaluwarsa: true,
      },
    });

    for (const item of expiryItems) {
      await this.createNotifikasiIfNotExists(
        item.id,
        'kadaluwarsa' as const,
        `Barang ${item.nama} (${item.kode_sku}) akan kadaluwarsa pada ${item.tanggal_kedaluwarsa?.toLocaleDateString('id-ID')}`
      );
    }

    return {
      stok_minimum: lowStockItems.length,
      kadaluwarsa: expiryItems.length,
      total: lowStockItems.length + expiryItems.length,
    };
  }

  private async createNotifikasiIfNotExists(idBarang: number, jenisNotif: JenisNotifikasi, pesan: string) {
    const exists = await prisma.notifikasi.findFirst({
      where: {
        id_barang: idBarang,
        jenis_notif: jenisNotif,
        is_read: false,
      },
    });

    if (!exists) {
      await prisma.notifikasi.create({
        data: {
          id_barang: idBarang,
          jenis_notif: jenisNotif,
          pesan,
        },
      });
    }
  }

  private formatNotifikasi(notif: any) {
    return {
      id: notif.id,
      id_barang: notif.id_barang,
      jenis_notif: notif.jenis_notif,
      pesan: notif.pesan,
      is_read: notif.is_read,
      dibuat_pada: notif.dibuat_pada.toISOString(),
      barang: notif.barang ? {
        id: notif.barang.id,
        nama: notif.barang.nama,
        kode_sku: notif.barang.kode_sku,
      } : undefined,
    };
  }
}
