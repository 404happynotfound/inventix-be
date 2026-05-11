-- CreateEnum
CREATE TYPE "Peran" AS ENUM ('ADMIN', 'SUPPLIER', 'PEMBELI');

-- CreateEnum
CREATE TYPE "StatusAkun" AS ENUM ('AKTIF', 'NONAKTIF', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "StatusPO" AS ENUM ('PENDING', 'DIKONFIRMASI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "StatusSupplier" AS ENUM ('AKTIF', 'NONAKTIF', 'BLACKLIST');

-- CreateEnum
CREATE TYPE "JenisTransaksi" AS ENUM ('MASUK', 'KELUAR', 'LAINNYA');

-- CreateTable
CREATE TABLE "akun" (
    "uniqueID" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "peran" "Peran" NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "akun_pkey" PRIMARY KEY ("uniqueID")
);

-- CreateTable
CREATE TABLE "supplier" (
    "uniqueID" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nomor_telepon" TEXT NOT NULL,
    "deskripsi_catatan" TEXT,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("uniqueID")
);

-- CreateTable
CREATE TABLE "stok" (
    "uniqueID" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kode_sku" TEXT NOT NULL,
    "klasifikasi_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL,
    "jumlah_saat_ini" INTEGER NOT NULL,
    "tanggal_kedatangan" TIMESTAMP(3) NOT NULL,
    "lokasi_gudang" TEXT NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stok_pkey" PRIMARY KEY ("uniqueID")
);

-- CreateTable
CREATE TABLE "klasifikasistok" (
    "uniqueID" SERIAL NOT NULL,
    "jenis" TEXT NOT NULL,
    "deskripsi" TEXT,

    CONSTRAINT "klasifikasistok_pkey" PRIMARY KEY ("uniqueID")
);

-- CreateTable
CREATE TABLE "riwayataktivitas" (
    "uniqueID" SERIAL NOT NULL,
    "akun_id" INTEGER NOT NULL,
    "nama_label" TEXT NOT NULL,
    "record_id" INTEGER NOT NULL,
    "aksi" TEXT NOT NULL,
    "data_lama" JSONB,
    "data_baru" JSONB,
    "terjadi_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayataktivitas_pkey" PRIMARY KEY ("uniqueID")
);

-- CreateTable
CREATE TABLE "purchaseorder" (
    "uniqueID" SERIAL NOT NULL,
    "nomor_po" TEXT NOT NULL,
    "dibuat_oleh" INTEGER NOT NULL,
    "disetujui_oleh" INTEGER,
    "supplier_id" INTEGER NOT NULL,
    "status" "StatusPO" NOT NULL DEFAULT 'PENDING',
    "status_supplier" "StatusSupplier" NOT NULL,
    "total_nilai" DECIMAL(65,30) NOT NULL,
    "tanggal_po" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_disetujui" TIMESTAMP(3),
    "tanggal_konfirmasi_supplier" TIMESTAMP(3),
    "tanggal_kedatangan" TIMESTAMP(3),
    "tanggal_diharapkan" TIMESTAMP(3),
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL,
    "catatan" TEXT,

    CONSTRAINT "purchaseorder_pkey" PRIMARY KEY ("uniqueID")
);

-- CreateTable
CREATE TABLE "detailpo" (
    "uniqueID" SERIAL NOT NULL,
    "po_id" INTEGER NOT NULL,
    "stok_id" INTEGER NOT NULL,
    "jumlah_dipesan" INTEGER NOT NULL,
    "jumlah_diterima" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "detailpo_pkey" PRIMARY KEY ("uniqueID")
);

-- CreateTable
CREATE TABLE "pembeliantransaksi" (
    "uniqueID" SERIAL NOT NULL,
    "akun_id" INTEGER NOT NULL,
    "stok_id" INTEGER NOT NULL,
    "detail_po_id" INTEGER NOT NULL,
    "jenis" "JenisTransaksi" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "jumlah_sebelum" INTEGER NOT NULL,
    "jumlah_sesudah" INTEGER NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pembeliantransaksi_pkey" PRIMARY KEY ("uniqueID")
);

-- CreateIndex
CREATE UNIQUE INDEX "akun_email_key" ON "akun"("email");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_user_id_key" ON "supplier"("user_id");

-- CreateIndex
CREATE INDEX "supplier_user_id_idx" ON "supplier"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "stok_kode_sku_key" ON "stok"("kode_sku");

-- CreateIndex
CREATE INDEX "stok_klasifikasi_id_idx" ON "stok"("klasifikasi_id");

-- CreateIndex
CREATE INDEX "stok_supplier_id_idx" ON "stok"("supplier_id");

-- CreateIndex
CREATE INDEX "riwayataktivitas_akun_id_idx" ON "riwayataktivitas"("akun_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchaseorder_nomor_po_key" ON "purchaseorder"("nomor_po");

-- CreateIndex
CREATE INDEX "purchaseorder_dibuat_oleh_idx" ON "purchaseorder"("dibuat_oleh");

-- CreateIndex
CREATE INDEX "purchaseorder_supplier_id_idx" ON "purchaseorder"("supplier_id");

-- CreateIndex
CREATE INDEX "detailpo_po_id_idx" ON "detailpo"("po_id");

-- CreateIndex
CREATE INDEX "detailpo_stok_id_idx" ON "detailpo"("stok_id");

-- CreateIndex
CREATE INDEX "pembeliantransaksi_akun_id_idx" ON "pembeliantransaksi"("akun_id");

-- CreateIndex
CREATE INDEX "pembeliantransaksi_stok_id_idx" ON "pembeliantransaksi"("stok_id");

-- CreateIndex
CREATE INDEX "pembeliantransaksi_detail_po_id_idx" ON "pembeliantransaksi"("detail_po_id");

-- AddForeignKey
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "akun"("uniqueID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok" ADD CONSTRAINT "stok_klasifikasi_id_fkey" FOREIGN KEY ("klasifikasi_id") REFERENCES "klasifikasistok"("uniqueID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok" ADD CONSTRAINT "stok_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("uniqueID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayataktivitas" ADD CONSTRAINT "riwayataktivitas_akun_id_fkey" FOREIGN KEY ("akun_id") REFERENCES "akun"("uniqueID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchaseorder" ADD CONSTRAINT "purchaseorder_dibuat_oleh_fkey" FOREIGN KEY ("dibuat_oleh") REFERENCES "akun"("uniqueID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchaseorder" ADD CONSTRAINT "purchaseorder_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("uniqueID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detailpo" ADD CONSTRAINT "detailpo_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchaseorder"("uniqueID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detailpo" ADD CONSTRAINT "detailpo_stok_id_fkey" FOREIGN KEY ("stok_id") REFERENCES "stok"("uniqueID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembeliantransaksi" ADD CONSTRAINT "pembeliantransaksi_akun_id_fkey" FOREIGN KEY ("akun_id") REFERENCES "akun"("uniqueID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembeliantransaksi" ADD CONSTRAINT "pembeliantransaksi_stok_id_fkey" FOREIGN KEY ("stok_id") REFERENCES "stok"("uniqueID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembeliantransaksi" ADD CONSTRAINT "pembeliantransaksi_detail_po_id_fkey" FOREIGN KEY ("detail_po_id") REFERENCES "detailpo"("uniqueID") ON DELETE CASCADE ON UPDATE CASCADE;
