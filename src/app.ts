import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from './config/openapi';

import authRoutes from './modules/auth/auth.route';
import akunRoutes from './modules/akun/akun.route';
// import supplierRoutes from './modules/supplier/supplier.route';
// import stokRoutes from './modules/stok/stok.route';
// import klasifikasiStokRoutes from './modules/klasifikasi-stok/klasifikasi-stok.route';
// import purchaseOrderRoutes from './modules/purchase-order/purchase-order.route';
// import pembelianTransaksiRoutes from './modules/pembelian-transaksi/pembelian-transaksi.route';
// import riwayatAktivitasRoutes from './modules/riwayat-aktivitas/riwayat-aktivitas.route';
import { errorHandler } from './middlewares/errorHandler';
import { httpLogger } from './middlewares/logger';

const app = express();

// Middlewares
app.use(httpLogger);
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/akun', akunRoutes);

// OpenAPI Documentation Route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(generateOpenApiDocument()));

// Global Error Handler
app.use(errorHandler);

export default app;
