import pinoHttp from 'pino-http';
import logger from '../utils/logger';

export const httpLogger = pinoHttp({
  logger,
  // Tentukan level log berdasarkan status code
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // Pesan kustom: Success untuk 2xx, Failure untuk sisanya
  customSuccessMessage: (req, res) => {
    const statusText = res.statusCode < 400 ? 'Success' : 'Failure';
    return `${req.method} ${req.url} - ${statusText} (${res.statusCode})`;
  },
  // Sembunyikan detail req & res jika sukses (< 400)
  // Dan hilangkan 'headers' agar tidak memenuhi terminal
  serializers: {
    req: (req) => {
      if (req.raw.res.statusCode < 400) return undefined;
      return {
        method: req.method,
        url: req.url,
        body: req.raw.body, // Tampilkan body jika error agar mudah debug
      };
    },
    res: (res) => {
      if (res.raw.statusCode < 400) return undefined;
      return {
        statusCode: res.statusCode,
        // 'headers' dihilangkan sengaja agar rapih
      };
    },
    err: (err) => err,
  },
});
