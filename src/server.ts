import { env } from './config/env';
import app from './app';
import logger from './utils/logger';

app.listen(env.PORT, () => {
  logger.info(`Server is running on http://localhost:${env.PORT}`);
  logger.info(`API Documentation available at http://localhost:${env.PORT}/docs`);
});
