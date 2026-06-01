import cron from 'node-cron';
import logger from '../utils/logger';
import { NotifikasiService } from '../modules/notifikasi/notifikasi.service';

const notifikasiService = new NotifikasiService();

export const initializeCronJobs = () => {
  // Run notification check daily at 08:00
  cron.schedule('0 8 * * *', async () => {
    try {
      logger.info('Running scheduled notification check...');
      const result = await notifikasiService.performNotificationCheck();
      logger.info(`Notification check completed. Stok minimum: ${result.stok_minimum}, Kadaluwarsa: ${result.kadaluwarsa}`);
    } catch (error) {
      if (error instanceof Error) {
        // Menggabungkan string dengan backtick
        logger.error(`Error during scheduled notification check: ${error.message}`);
      } else {
        // Menggabungkan string dengan backtick
        logger.error(`Error during scheduled notification check: ${String(error)}`);
      }
    }
  });

  logger.info('Cron jobs initialized');
};