import { PrismaClient, Peran, JenisTransaksi } from "../generated/prisma";
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({adapter});

async function main() {
    console.log("Memulai proses seeding...");

    // Tabel Akun 
    console.log("Membuat akun...");

    // password yang digunakan untuk semua akun
    const passwordHash = await bcrypt.hash("Password@123", 10);

    const akunOwner = await prisma.akun.upsert({
        where: { email: "owner@cafe.com" },
        update: {},
        create: {
            nama: "Owner Cafe",
            email: "owner@cafe.com",
            password: passwordHash,
            peran: Peran.OWNER,
        },
    });

    const akunAdmin = await prisma.akun.upsert({
        where: { email: "admin@cafe.com" },
        update: {},
        create: {
            nama: "Admin Cafe",
            email: "admin@cafe.com",
            password: passwordHash,
            peran: Peran.ADMIN,
        },
    });

    const akunGudang = await prisma.akun.upsert({
        where: { email: "gudang@cafe.com" },
        update: {},
        create: {
            nama: "Staff Gudang",
            email: "gudang@cafe.com",
            password: passwordHash,
            peran: Peran.GUDANG,
        },
    });

    // Setiap supplier memiliki akun masing-masing dengan peran SUPPLIER.
    const akunSupplierTepung = await prisma.akun.upsert({
        where: { email: "supplier.tepung@cafe.com" },
        update: {},
        create: {
            nama: "Supplier Tepung dan Bahan Kering",
            email: "supplier.tepung@cafe.com",
            password: passwordHash,
            peran: Peran.SUPPLIER,
        },
    });

    const akunSupplierDaging = await prisma.akun.upsert({
        where: { email: "supplier.daging@cafe.com" },
        update: {},
        create: {
            nama: "Supplier Daging dan Protein",
            email: "supplier.daging@cafe.com",
            password: passwordHash,
            peran: Peran.SUPPLIER,
        },
    });

    const akunSupplierSayur = await prisma.akun.upsert({
        where: { email: "supplier.sayur@cafe.com" },
        update: {},
        create: {
            nama: "Supplier Sayur dan Produk Segar",
            email: "supplier.sayur@cafe.com",
            password: passwordHash,
            peran: Peran.SUPPLIER,
        },
    });

    const akunSupplierMinuman = await prisma.akun.upsert({
        where: { email: "supplier.minuman@cafe.com" },
        update: {},
        create: {
            nama: "Supplier Minuman dan Kopi",
            email: "supplier.minuman@cafe.com",
            password: passwordHash,
            peran: Peran.SUPPLIER,
        },
    });

    const akunSupplierSaus = await prisma.akun.upsert({
        where: { email: "supplier.saus@cafe.com" },
        update: {},
        create: {
            nama: "Supplier Saus dan Bumbu",
            email: "supplier.saus@cafe.com",
            password: passwordHash,
            peran: Peran.SUPPLIER,
        },
    });

    console.log("Akun berhasil dibuat.");

    // Tabel Supplier
    console.log("Membuat data supplier...");

    const supplierTepung = await prisma.supplier.upsert({
        where: { user_id: akunSupplierTepung.id },
        update: {},
        create: {
            nama: "CV Tepung Makmur",
            alamat: "Jl. Industri No. 12, Jakarta Barat",
            email: "supplier.tepung@cafe.com",
            nomor_telepon: "081111000001",
            deskripsi:
                "Supplier tepung protein tinggi, tepung sourdough, tepung gluten-free, ragi, dan bahan kering lainnya",
            user_id: akunSupplierTepung.id,
        },
    });

    const supplierDaging = await prisma.supplier.upsert({
        where: { user_id: akunSupplierDaging.id },
        update: {},
        create: {
            nama: "PT Protein Prima",
            alamat: "Jl. Daging Segar No. 5, Jakarta Utara",
            email: "supplier.daging@cafe.com",
            nomor_telepon: "081111000002",
            deskripsi:
                "Supplier beef bacon, smoked duck, chicken katsu, tuna kaleng, dan telur",
            user_id: akunSupplierDaging.id,
        },
    });

    const supplierSayur = await prisma.supplier.upsert({
        where: { user_id: akunSupplierSayur.id },
        update: {},
        create: {
            nama: "UD Sayur Segar",
            alamat: "Pasar Induk Kramat Jati, Jakarta Timur",
            email: "supplier.sayur@cafe.com",
            nomor_telepon: "081111000003",
            deskripsi:
                "Supplier sayuran segar: arugula, iceberg lettuce, mushroom, bawang putih, lemon, kentang, ubi jalar",
            user_id: akunSupplierSayur.id,
        },
    });

    const supplierMinuman = await prisma.supplier.upsert({
        where: { user_id: akunSupplierMinuman.id },
        update: {},
        create: {
            nama: "PT Kopi Berkah",
            alamat: "Jl. Kopi No. 8, Bandung",
            email: "supplier.minuman@cafe.com",
            nomor_telepon: "081111000004",
            deskripsi:
                "Supplier biji kopi, susu, teh, sirup, dan bahan minuman lainnya",
            user_id: akunSupplierMinuman.id,
        },
    });

    const supplierSaus = await prisma.supplier.upsert({
        where: { user_id: akunSupplierSaus.id },
        update: {},
        create: {
            nama: "CV Bumbu Istimewa",
            alamat: "Jl. Rempah No. 3, Surabaya",
            email: "supplier.saus@cafe.com",
            nomor_telepon: "081111000005",
            deskripsi:
                "Supplier saus dan bumbu: hoisin sauce, tomato sauce, cream cheese, mayonnaise, pandan kaya",
            user_id: akunSupplierSaus.id,
        },
    });

    console.log("Supplier berhasil dibuat.");

    // Tabel Klasifikasi
    console.log("Membuat klasifikasi stok...");

    const klasifikasiBahanKering = await prisma.klasifikasi_Stok.upsert({
        where: { id: 1 },
        update: {},
        create: {
            jenis: "Bahan Kering dan Tepung",
            deskripsi:
                "",
        },
    });

    const klasifikasiProtein = await prisma.klasifikasi_Stok.upsert({
        where: { id: 2 },
        update: {},
        create: {
            jenis: "Protein dan Daging",
            deskripsi: "r",
        },
    });

    const klasifikasiSayur = await prisma.klasifikasi_Stok.upsert({
        where: { id: 3 },
        update: {},
        create: {
            jenis: "Sayur dan Produk Segar",
            deskripsi: "",
        },
    });

    const klasifikasiSaus = await prisma.klasifikasi_Stok.upsert({
        where: { id: 4 },
        update: {},
        create: {
            jenis: "Saus dan Bumbu",
            deskripsi: "",
        },
    });

    const klasifikasiDairy = await prisma.klasifikasi_Stok.upsert({
        where: { id: 5 },
        update: {},
        create: {
            jenis: "Dairy dan Produk Susu",
            deskripsi: "",
        },
    });

    const klasifikasiMinuman = await prisma.klasifikasi_Stok.upsert({
        where: { id: 6 },
        update: {},
        create: {
            jenis: "Bahan Minuman",
            deskripsi: "",
        },
    });

    const klasifikasiKemasan = await prisma.klasifikasi_Stok.upsert({
        where: { id: 7 },
        update: {},
        create: {
            jenis: "Kemasan dan Minuman Jadi",
            deskripsi: "",
        },
    });

    const klasifikasiMinyak = await prisma.klasifikasi_Stok.upsert({
        where: { id: 8 },
        update: {},
        create: {
            jenis: "Minyak dan Lemak",
            deskripsi: "",
        },
    });

    console.log("Klasifikasi stok berhasil dibuat.");

    // Tabel Stok
    console.log("Membuat data stok...");

    // Bahan kering dan tepung
    const stokTepungProtein = await prisma.stok.upsert({
        where: { kode_sku: "TKR-001" },
        update: {},
        create: {
            nama: "Tepung Protein",
            kode_sku: "TKR-001",
            klasifikasi_id: klasifikasiBahanKering.id,
            supplier_id: supplierTepung.id,
            satuan: "kilogram",
            jumlah_saat_ini: 10,
        },
    });

    // Digunakan khusus untuk varian sourdough focaccia
    const stokTepungSourdough = await prisma.stok.upsert({
        where: { kode_sku: "TKR-002" },
        update: {},
        create: {
            nama: "Tepung Sourdough",
            kode_sku: "TKR-002",
            klasifikasi_id: klasifikasiBahanKering.id,
            supplier_id: supplierTepung.id,
            satuan: "kilogram",
            jumlah_saat_ini: 5,
        },
    });

    // Digunakan khusus untuk varian gluten-free focaccia
    const stokTepungGlutenFree = await prisma.stok.upsert({
        where: { kode_sku: "TKR-003" },
        update: {},
        create: {
            nama: "Tepung Gluten-free",
            kode_sku: "TKR-003",
            klasifikasi_id: klasifikasiBahanKering.id,
            supplier_id: supplierTepung.id,
            satuan: "kilogram",
            jumlah_saat_ini: 3,
        },
    });

    const stokRagi = await prisma.stok.upsert({
        where: { kode_sku: "TKR-004" },
        update: {},
        create: {
            nama: "Ragi Instan",
            kode_sku: "TKR-004",
            klasifikasi_id: klasifikasiBahanKering.id,
            supplier_id: supplierTepung.id,
            satuan: "gram",
            jumlah_saat_ini: 500,
        },
    });

    const stokGulaPasir = await prisma.stok.upsert({
        where: { kode_sku: "TKR-005" },
        update: {},
        create: {
            nama: "Gula Pasir",
            kode_sku: "TKR-005",
            klasifikasi_id: klasifikasiBahanKering.id,
            supplier_id: supplierTepung.id,
            satuan: "kilogram",
            jumlah_saat_ini: 3,
        },
    });

    const stokGaram = await prisma.stok.upsert({
        where: { kode_sku: "TKR-006" },
        update: {},
        create: {
            nama: "Garam",
            kode_sku: "TKR-006",
            klasifikasi_id: klasifikasiBahanKering.id,
            supplier_id: supplierTepung.id,
            satuan: "kilogram",
            jumlah_saat_ini: 2,
        },
    });

    const stokRosemary = await prisma.stok.upsert({
        where: { kode_sku: "TKR-007" },
        update: {},
        create: {
            nama: "Rosemary Kering",
            kode_sku: "TKR-007",
            klasifikasi_id: klasifikasiBahanKering.id,
            supplier_id: supplierTepung.id,
            satuan: "gram",
            jumlah_saat_ini: 200,
        },
    });

    const stokCinnamonPowder = await prisma.stok.upsert({
        where: { kode_sku: "TKR-008" },
        update: {},
        create: {
            nama: "Cinnamon Powder",
            kode_sku: "TKR-008",
            klasifikasi_id: klasifikasiBahanKering.id,
            supplier_id: supplierTepung.id,
            satuan: "gram",
            jumlah_saat_ini: 500,
        },
    });

    const stokIcingGlaze = await prisma.stok.upsert({
        where: { kode_sku: "TKR-009" },
        update: {},
        create: {
            nama: "Icing Glaze",
            kode_sku: "TKR-009",
            klasifikasi_id: klasifikasiBahanKering.id,
            supplier_id: supplierTepung.id,
            satuan: "gram",
            jumlah_saat_ini: 500,
        },
    });

    // Protein dan daging
    const stokBeefBacon = await prisma.stok.upsert({
        where: { kode_sku: "PRO-001" },
        update: {},
        create: {
            nama: "Beef Bacon",
            kode_sku: "PRO-001",
            klasifikasi_id: klasifikasiProtein.id,
            supplier_id: supplierDaging.id,
            satuan: "kilogram",
            jumlah_saat_ini: 3,
        },
    });

    const stokSmokedDuck = await prisma.stok.upsert({
        where: { kode_sku: "PRO-002" },
        update: {},
        create: {
            nama: "Smoked Duck",
            kode_sku: "PRO-002",
            klasifikasi_id: klasifikasiProtein.id,
            supplier_id: supplierDaging.id,
            satuan: "kilogram",
            jumlah_saat_ini: 2,
        },
    });

    const stokChickenKatsu = await prisma.stok.upsert({
        where: { kode_sku: "PRO-003" },
        update: {},
        create: {
            nama: "Chicken Katsu",
            kode_sku: "PRO-003",
            klasifikasi_id: klasifikasiProtein.id,
            supplier_id: supplierDaging.id,
            satuan: "pcs",
            jumlah_saat_ini: 10,
        },
    });

    const stokTunaKaleng = await prisma.stok.upsert({
        where: { kode_sku: "PRO-004" },
        update: {},
        create: {
            nama: "Tuna Kaleng",
            kode_sku: "PRO-004",
            klasifikasi_id: klasifikasiProtein.id,
            supplier_id: supplierDaging.id,
            satuan: "kaleng",
            jumlah_saat_ini: 20,
        },
    });

    const stokTelur = await prisma.stok.upsert({
        where: { kode_sku: "PRO-005" },
        update: {},
        create: {
            nama: "Telur Ayam",
            kode_sku: "PRO-005",
            klasifikasi_id: klasifikasiProtein.id,
            supplier_id: supplierDaging.id,
            satuan: "butir",
            jumlah_saat_ini: 100,
        },
    });

    // Sayur dan produk segar
    const stokArugula = await prisma.stok.upsert({
        where: { kode_sku: "SAY-001" },
        update: {},
        create: {
            nama: "Arugula",
            kode_sku: "SAY-001",
            klasifikasi_id: klasifikasiSayur.id,
            supplier_id: supplierSayur.id,
            satuan: "kilogram",
            jumlah_saat_ini: 1,
        },
    });

    const stokIcebergLettuce = await prisma.stok.upsert({
        where: { kode_sku: "SAY-002" },
        update: {},
        create: {
            nama: "Iceberg Lettuce",
            kode_sku: "SAY-002",
            klasifikasi_id: klasifikasiSayur.id,
            supplier_id: supplierSayur.id,
            satuan: "kilogram",
            jumlah_saat_ini: 1,
        },
    });

    const stokMushroom = await prisma.stok.upsert({
        where: { kode_sku: "SAY-003" },
        update: {},
        create: {
            nama: "Mushroom",
            kode_sku: "SAY-003",
            klasifikasi_id: klasifikasiSayur.id,
            supplier_id: supplierSayur.id,
            satuan: "kilogram",
            jumlah_saat_ini: 3,
        },
    });

    const stokGherkins = await prisma.stok.upsert({
        where: { kode_sku: "SAY-004" },
        update: {},
        create: {
            nama: "Gherkins",
            kode_sku: "SAY-004",
            klasifikasi_id: klasifikasiSayur.id,
            supplier_id: supplierSayur.id,
            satuan: "kilogram",
            jumlah_saat_ini: 3,
        },
    });

    const stokBawangPutih = await prisma.stok.upsert({
        where: { kode_sku: "SAY-005" },
        update: {},
        create: {
            nama: "Bawang Putih Segar",
            kode_sku: "SAY-005",
            klasifikasi_id: klasifikasiSayur.id,
            supplier_id: supplierSayur.id,
            satuan: "kilogram",
            jumlah_saat_ini: 3,
        },
    });

    const stokBuahLemon = await prisma.stok.upsert({
        where: { kode_sku: "SAY-006" },
        update: {},
        create: {
            nama: "Buah Lemon",
            kode_sku: "SAY-006",
            klasifikasi_id: klasifikasiSayur.id,
            supplier_id: supplierSayur.id,
            satuan: "buah",
            jumlah_saat_ini: 30,
        },
    });

    const stokKentang = await prisma.stok.upsert({
        where: { kode_sku: "SAY-007" },
        update: {},
        create: {
            nama: "Kentang",
            kode_sku: "SAY-007",
            klasifikasi_id: klasifikasiSayur.id,
            supplier_id: supplierSayur.id,
            satuan: "kilogram",
            jumlah_saat_ini: 3,
        },
    });

    const stokUbiJalar = await prisma.stok.upsert({
        where: { kode_sku: "SAY-008" },
        update: {},
        create: {
            nama: "Ubi Jalar",
            kode_sku: "SAY-008",
            klasifikasi_id: klasifikasiSayur.id,
            supplier_id: supplierSayur.id,
            satuan: "kilogram",
            jumlah_saat_ini: 3,
        },
    });

    // Saus dan bumbu
    const stokGarlicAioli = await prisma.stok.upsert({
        where: { kode_sku: "SAU-001" },
        update: {},
        create: {
            nama: "Garlic Aioli",
            kode_sku: "SAU-001",
            klasifikasi_id: klasifikasiSaus.id,
            supplier_id: supplierSaus.id,
            satuan: "liter",
            jumlah_saat_ini: 2,
        },
    });

    const stokHoisinSauce = await prisma.stok.upsert({
        where: { kode_sku: "SAU-002" },
        update: {},
        create: {
            nama: "Hoisin Sauce",
            kode_sku: "SAU-002",
            klasifikasi_id: klasifikasiSaus.id,
            supplier_id: supplierSaus.id,
            satuan: "liter",
            jumlah_saat_ini: 2,
        },
    });

    const stokTomatoSauce = await prisma.stok.upsert({
        where: { kode_sku: "SAU-003" },
        update: {},
        create: {
            nama: "Tomato Sauce",
            kode_sku: "SAU-003",
            klasifikasi_id: klasifikasiSaus.id,
            supplier_id: supplierSaus.id,
            satuan: "liter",
            jumlah_saat_ini: 2,
        },
    });

    const stokMayonnaise = await prisma.stok.upsert({
        where: { kode_sku: "SAU-004" },
        update: {},
        create: {
            nama: "Mayonnaise",
            kode_sku: "SAU-004",
            klasifikasi_id: klasifikasiSaus.id,
            supplier_id: supplierSaus.id,
            satuan: "kilogram",
            jumlah_saat_ini: 2,
        },
    });

    const stokPandanKaya = await prisma.stok.upsert({
        where: { kode_sku: "SAU-005" },
        update: {},
        create: {
            nama: "Pandan Kaya Sauce",
            kode_sku: "SAU-005",
            klasifikasi_id: klasifikasiSaus.id,
            supplier_id: supplierSaus.id,
            satuan: "liter",
            jumlah_saat_ini: 1,
        },
    });

    const stokMushroomSoup = await prisma.stok.upsert({
        where: { kode_sku: "SAU-006" },
        update: {},
        create: {
            nama: "Mushroom Soup",
            kode_sku: "SAU-006",
            klasifikasi_id: klasifikasiSaus.id,
            supplier_id: supplierSaus.id,
            satuan: "liter",
            jumlah_saat_ini: 3,
        },
    });

    // Dairy dan produk susu
    const stokCreamCheese = await prisma.stok.upsert({
        where: { kode_sku: "DAI-001" },
        update: {},
        create: {
            nama: "Cream Cheese",
            kode_sku: "DAI-001",
            klasifikasi_id: klasifikasiDairy.id,
            supplier_id: supplierSaus.id,
            satuan: "kilogram",
            jumlah_saat_ini: 2,
        },
    });

    const stokParmesan = await prisma.stok.upsert({
        where: { kode_sku: "DAI-002" },
        update: {},
        create: {
            nama: "Parmesan",
            kode_sku: "DAI-002",
            klasifikasi_id: klasifikasiDairy.id,
            supplier_id: supplierSaus.id,
            satuan: "kilogram",
            jumlah_saat_ini: 2,
        },
    });

    const stokSusuFullCream = await prisma.stok.upsert({
        where: { kode_sku: "DAI-003" },
        update: {},
        create: {
            nama: "Susu Full Cream",
            kode_sku: "DAI-003",
            klasifikasi_id: klasifikasiDairy.id,
            supplier_id: supplierMinuman.id,
            satuan: "liter",
            jumlah_saat_ini: 5,
        },
    });

    // Minyak dan lemak
    const stokMinyakZaitun = await prisma.stok.upsert({
        where: { kode_sku: "MNY-001" },
        update: {},
        create: {
            nama: "Minyak Zaitun",
            kode_sku: "MNY-001",
            klasifikasi_id: klasifikasiMinyak.id,
            supplier_id: supplierTepung.id,
            satuan: "liter",
            jumlah_saat_ini: 3,
        },
    });

    const stokTruffleOil = await prisma.stok.upsert({
        where: { kode_sku: "MNY-002" },
        update: {},
        create: {
            nama: "Truffle Oil",
            kode_sku: "MNY-002",
            klasifikasi_id: klasifikasiMinyak.id,
            supplier_id: supplierSaus.id,
            satuan: "liter",
            jumlah_saat_ini: 1,
        },
    });

    const stokMinyakGoreng = await prisma.stok.upsert({
        where: { kode_sku: "MNY-003" },
        update: {},
        create: {
            nama: "Minyak Goreng",
            kode_sku: "MNY-003",
            klasifikasi_id: klasifikasiMinyak.id,
            supplier_id: supplierTepung.id,
            satuan: "liter",
            jumlah_saat_ini: 5,
        },
    });

    // Bahan minuman
    const stokBijiKopi = await prisma.stok.upsert({
        where: { kode_sku: "MIN-001" },
        update: {},
        create: {
            nama: "Biji Kopi Espresso",
            kode_sku: "MIN-001",
            klasifikasi_id: klasifikasiMinuman.id,
            supplier_id: supplierMinuman.id,
            satuan: "kilogram",
            jumlah_saat_ini: 3,
        },
    });

    const stokSirupVanilla = await prisma.stok.upsert({
        where: { kode_sku: "MIN-002" },
        update: {},
        create: {
            nama: "Sirup Vanilla",
            kode_sku: "MIN-002",
            klasifikasi_id: klasifikasiMinuman.id,
            supplier_id: supplierMinuman.id,
            satuan: "liter",
            jumlah_saat_ini: 1,
        },
    });

    const stokSirupCaramel = await prisma.stok.upsert({
        where: { kode_sku: "MIN-003" },
        update: {},
        create: {
            nama: "Sirup Caramel",
            kode_sku: "MIN-003",
            klasifikasi_id: klasifikasiMinuman.id,
            supplier_id: supplierMinuman.id,
            satuan: "liter",
            jumlah_saat_ini: 1,
        },
    });

    const stokSirupHazelnut = await prisma.stok.upsert({
        where: { kode_sku: "MIN-004" },
        update: {},
        create: {
            nama: "Sirup Hazelnut",
            kode_sku: "MIN-004",
            klasifikasi_id: klasifikasiMinuman.id,
            supplier_id: supplierMinuman.id,
            satuan: "liter",
            jumlah_saat_ini: 1,
        },
    });

    const stokChamomileTeaBag = await prisma.stok.upsert({
        where: { kode_sku: "MIN-005" },
        update: {},
        create: {
            nama: "Chamomile Tea Bag",
            kode_sku: "MIN-005",
            klasifikasi_id: klasifikasiMinuman.id,
            supplier_id: supplierMinuman.id,
            satuan: "pcs",
            jumlah_saat_ini: 100,
        },
    });

    const stokEarlGreyTeaBag = await prisma.stok.upsert({
        where: { kode_sku: "MIN-006" },
        update: {},
        create: {
            nama: "Earl Grey Tea Bag",
            kode_sku: "MIN-006",
            klasifikasi_id: klasifikasiMinuman.id,
            supplier_id: supplierMinuman.id,
            satuan: "pcs",
            jumlah_saat_ini: 100,
        },
    });

    const stokTehHitam = await prisma.stok.upsert({
        where: { kode_sku: "MIN-007" },
        update: {},
        create: {
            nama: "Teh Hitam",
            kode_sku: "MIN-007",
            klasifikasi_id: klasifikasiMinuman.id,
            supplier_id: supplierMinuman.id,
            satuan: "gram",
            jumlah_saat_ini: 500,
        },
    });

    const stokRoyalMilkTeaPowder = await prisma.stok.upsert({
        where: { kode_sku: "MIN-008" },
        update: {},
        create: {
            nama: "Royal Milk Tea Powder",
            kode_sku: "MIN-008",
            klasifikasi_id: klasifikasiMinuman.id,
            supplier_id: supplierMinuman.id,
            satuan: "kilogram",
            jumlah_saat_ini: 1,
        },
    });

    const stokSirupLychee = await prisma.stok.upsert({
        where: { kode_sku: "MIN-009" },
        update: {},
        create: {
            nama: "Sirup Lychee",
            kode_sku: "MIN-009",
            klasifikasi_id: klasifikasiMinuman.id,
            supplier_id: supplierMinuman.id,
            satuan: "liter",
            jumlah_saat_ini: 1,
        },
    });

    // Kemasan dan minuman jadi
    const stokAqua = await prisma.stok.upsert({
        where: { kode_sku: "KEM-001" },
        update: {},
        create: {
            nama: "Aqua 330ml",
            kode_sku: "KEM-001",
            klasifikasi_id: klasifikasiKemasan.id,
            supplier_id: supplierMinuman.id,
            satuan: "botol",
            jumlah_saat_ini: 20,
        },
    });

    console.log("Data stok berhasil dibuat.");

    // Tabel Transaksi Stok
    console.log("Mencatat transaksi stok awal...");

    const stokList = [
        { stok: stokTepungProtein, jumlah: 10 },
        { stok: stokTepungSourdough, jumlah: 5 },
        { stok: stokTepungGlutenFree, jumlah: 3 },
        { stok: stokRagi, jumlah: 500 },
        { stok: stokGulaPasir, jumlah: 3 },
        { stok: stokGaram, jumlah: 2 },
        { stok: stokRosemary, jumlah: 200 },
        { stok: stokCinnamonPowder, jumlah: 500 },
        { stok: stokIcingGlaze, jumlah: 500 },
        { stok: stokBeefBacon, jumlah: 3 },
        { stok: stokSmokedDuck, jumlah: 2 },
        { stok: stokChickenKatsu, jumlah: 10 },
        { stok: stokTunaKaleng, jumlah: 20 },
        { stok: stokTelur, jumlah: 100 },
        { stok: stokArugula, jumlah: 1 },
        { stok: stokIcebergLettuce, jumlah: 1 },
        { stok: stokMushroom, jumlah: 3 },
        { stok: stokGherkins, jumlah: 3 },
        { stok: stokBawangPutih, jumlah: 3 },
        { stok: stokBuahLemon, jumlah: 30 },
        { stok: stokKentang, jumlah: 3 },
        { stok: stokUbiJalar, jumlah: 3 },
        { stok: stokGarlicAioli, jumlah: 2 },
        { stok: stokHoisinSauce, jumlah: 2 },
        { stok: stokTomatoSauce, jumlah: 2 },
        { stok: stokMayonnaise, jumlah: 2 },
        { stok: stokPandanKaya, jumlah: 1 },
        { stok: stokMushroomSoup, jumlah: 3 },
        { stok: stokCreamCheese, jumlah: 2 },
        { stok: stokParmesan, jumlah: 2 },
        { stok: stokSusuFullCream, jumlah: 5 },
        { stok: stokMinyakZaitun, jumlah: 3 },
        { stok: stokTruffleOil, jumlah: 1 },
        { stok: stokMinyakGoreng, jumlah: 5},
        { stok: stokBijiKopi, jumlah: 3 },
        { stok: stokSirupVanilla, jumlah: 1 },
        { stok: stokSirupCaramel, jumlah: 1},
        { stok: stokSirupHazelnut, jumlah: 1 },
        { stok: stokChamomileTeaBag, jumlah: 100 },
        { stok: stokEarlGreyTeaBag, jumlah: 100 },
        { stok: stokTehHitam, jumlah: 500 },
        { stok: stokRoyalMilkTeaPowder, jumlah: 1 },
        { stok: stokSirupLychee, jumlah: 1 },
        { stok: stokAqua, jumlah: 20 },
    ];

    for (const item of stokList) {
        await prisma.transaksi_Stok.create({
            data: {
                akun_id: akunAdmin.id,         // dicatat atas nama admin sebagai penanggung jawab input awal
                stok_id: item.stok.id,
                jenis: JenisTransaksi.masuk,
                jumlah: item.jumlah,
                jumlah_sebelum: 0,             // semua stok dimulai dari 0
                jumlah_sesudah: item.jumlah,   // jumlah akhir sama dengan jumlah yang diinput
            },
        });
    }

    console.log("Transaksi stok awal berhasil dicatat.");
    console.log("Seeding selesai.");
}

main()
    .catch((e) => {
        console.error("Seeding gagal:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });