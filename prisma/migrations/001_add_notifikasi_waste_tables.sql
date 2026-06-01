-- AddNotifikasiAndWasteTables

-- Create Notifikasi Table
CREATE TABLE IF NOT EXISTS "Notifikasi" (
  "id" SERIAL NOT NULL,
  "id_barang" INTEGER NOT NULL,
  "jenis_notif" VARCHAR(30) NOT NULL,
  "pesan" TEXT,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Notifikasi_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "Stok" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Notifikasi_jenis_notif_check" CHECK ("jenis_notif" IN ('stok_minimum', 'kadaluwarsa'))
);

-- Create Waste Table
CREATE TABLE IF NOT EXISTS "Waste" (
  "id" SERIAL NOT NULL,
  "id_barang" INTEGER NOT NULL,
  "id_akun" INTEGER NOT NULL,
  "jumlah_terbuang" INTEGER NOT NULL,
  "estimasi_kerugian" DECIMAL(12, 2),
  "tanggal_waste" DATE NOT NULL DEFAULT CURRENT_DATE,
  "keterangan" TEXT,
  "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Waste_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Waste_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "Stok" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Waste_id_akun_fkey" FOREIGN KEY ("id_akun") REFERENCES "Akun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX "Notifikasi_id_barang_idx" ON "Notifikasi" ("id_barang");
CREATE INDEX "Notifikasi_is_read_idx" ON "Notifikasi" ("is_read");
CREATE INDEX "Notifikasi_jenis_notif_idx" ON "Notifikasi" ("jenis_notif");
CREATE INDEX "Waste_id_barang_idx" ON "Waste" ("id_barang");
CREATE INDEX "Waste_tanggal_waste_idx" ON "Waste" ("tanggal_waste");
