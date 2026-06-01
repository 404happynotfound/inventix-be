import { env } from './config/env';
import { initializeCronJobs } from './config/cron';
import app from './app';
import logger from './utils/logger';

// Initialize cron jobs
initializeCronJobs();

app.listen(env.PORT, () => {
  logger.info(`Server is running on http://localhost:${env.PORT}`);
  logger.info(`API Documentation available at http://localhost:${env.PORT}/docs`);
});
