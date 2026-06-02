import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from './config/openapi';

import authRoutes from './modules/auth/auth.route';
import akunRoutes from './modules/akun/akun.route';
import supplierRoutes from './modules/supplier/supplier.route';
import stokRoutes from './modules/stok/stok.route';
import klasifikasiStokRoutes from './modules/klasifikasi-stok/klasifikasi-stok.route';
import purchaseOrderRoutes from './modules/purchase-order/purchase-order.route';
import pembelianTransaksiRoutes from './modules/pembelian-transaksi/pembelian-transaksi.route';
import riwayatAktivitasRoutes from './modules/riwayat-aktivitas/riwayat-aktivitas.route';
import notifikasiRoutes from './modules/notifikasi/notifikasi.route';
import laporanPengeluaranRoutes from './modules/laporan-pengeluaran/laporan-pengeluaran.route';
import dashboardRoutes from './modules/dashboard/dashboard.route';
import wasteRoutes from './modules/waste/waste.route';
import { errorHandler } from './middlewares/errorHandler';
import { httpLogger } from './middlewares/logger';

// Global BigInt Serialization Patch
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();

// Middlewares
app.use(httpLogger);
app.use(helmet());
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/akun', akunRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/stok', stokRoutes);
app.use('/api/klasifikasi-stok', klasifikasiStokRoutes);
app.use('/api/purchase-order', purchaseOrderRoutes);
app.use('/api/pembelian-transaksi', pembelianTransaksiRoutes);
app.use('/api/riwayat-aktivitas', riwayatAktivitasRoutes);
app.use('/api/notifikasi', notifikasiRoutes);
app.use('/api/laporan/pengeluaran', laporanPengeluaranRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/waste', wasteRoutes);

// Route to serve raw OpenAPI JSON spec
app.get('/openapi.json', (req, res) => {
  res.json(generateOpenApiDocument());
});

// OpenAPI Documentation Route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(generateOpenApiDocument()));

// Global Error Handler
app.use(errorHandler);

export default app;
