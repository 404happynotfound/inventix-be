# Backend Architecture — Express.js TypeScript

REST API dibangun dengan pendekatan **schema-driven** dan **strict validation dua arah**, memastikan contract API selalu konsisten dari request hingga response.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Express.js (TypeScript) |
| Database ORM | Prisma (PostgreSQL) |
| Validation & Schema | Zod |
| Authentication | JWT (jsonwebtoken + bcrypt) |
| API Documentation | OpenAPI (auto-generated dari Zod) |

---

## Cara Menjalankan

### 1. Persiapan
Pastikan Anda memiliki **Node.js** (v18+) dan **PostgreSQL** yang sudah berjalan.

### 2. Instalasi
```bash
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root direktori:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your_very_secret_key"
```

### 4. Database Migration
Sinkronkan schema database dengan Prisma:
```bash
npm run prisma:migrate --name init
```

### 5. Menjalankan Server
```bash
# Mode Development (Auto-reload)
npm run dev

# Mode Production
npm run build
npm start
```

---

## Prinsip Arsitektur

### 1. Single Source of Truth (SSOT)
Seluruh contract API didefinisikan dalam **satu file schema per module**. Dalam satu file tersebut mencakup request schema, response schema, dan type inference. Tidak ada file response yang berdiri sendiri terpisah dari request.

### 2. Schema-Driven Development
Setiap endpoint wajib memiliki request schema dan response schema yang didefinisikan secara eksplisit menggunakan Zod. Dokumentasi OpenAPI di-generate otomatis dari schema yang sama, sehingga dokumentasi selalu sinkron dengan implementasi.

### 3. Strict Contract Enforcement
Request divalidasi sebelum masuk ke business logic, dan response divalidasi sebelum dikirim ke client. Pendekatan ini mencegah data bocor, field tidak sesuai kontrak, dan inkonsistensi antara schema dan data aktual.

### 4. Separation of Concerns
Setiap lapisan memiliki tanggung jawab yang jelas dan tidak tumpang tindih (Controller, Service, Repository).

---

## Panduan Penggunaan Lengkap

### 1. Menambah Module Baru
Setiap fitur baru harus dibuat dalam folder di `src/modules/`. Contoh membuat module `product`:
1.  **`product.schema.ts`**: Definisikan Zod object untuk request body dan response. Daftarkan ke `registry` OpenAPI.
2.  **`product.repository.ts`**: Tambahkan method query Prisma.
3.  **`product.service.ts`**: Implementasikan business logic.
4.  **`product.controller.ts`**: Hubungkan request ke service.
5.  **`product.route.ts`**: Definisikan endpoint dan pasang middleware `validateRequest` & `validateResponse`.

### 2. Validasi Dua Arah (Strict Contract)
Gunakan middleware `validateResponse` di route untuk memastikan output sesuai kontrak:
```typescript
router.get('/:id', validateResponse(ProductResponseSchema), productController.getById);
```

### 3. Dokumentasi API (OpenAPI)
Dokumentasi tersedia secara otomatis di: `http://localhost:3000/docs`

---

## Struktur Folder

```
src/
├── config/
│   ├── prisma.ts
│   └── openapi.ts
├── modules/
│   ├── user/
│   │   ├── user.schema.ts        ← request + response (digabung)
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   └── user.route.ts
│   └── auth/
│       ├── auth.schema.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       └── auth.route.ts
├── middlewares/
│   ├── validate.ts               ← validasi request
│   ├── validateResponse.ts       ← validasi response
│   ├── authMiddleware.ts
│   └── errorHandler.ts
├── utils/
│   └── response.ts
├── app.ts
└── server.ts
```

---

## Alur Request

```
Client
  → Route
  → Validate Request (Zod)
  → Auth Middleware (JWT)
  → Controller
  → Service
  → Repository (Prisma)
  → Validate Response (Zod)
  → Response ke Client
```

---

## Standard Response Format

**Success**
```json
{
  "data": {},
  "message": "Success"
}
```

**Error**
```json
{
  "message": "Validation failed",
  "error": {
    "code": "ERROR_CODE",
    "details": [
      {
        "field": "email",
        "issue": "invalid format"
      }
    ]
  }
}
```

---

## Rules

### Wajib
- Semua request & response divalidasi menggunakan Zod.
- Semua error dialirkan melalui global error handler.
- Request schema dan response schema berada dalam satu file module.
- Query database hanya dilakukan dari layer Repository.

---

## Scripts yang Tersedia

- `npm run dev`: Menjalankan server development dengan `tsx watch`.
- `npm run prisma:migrate`: Membuat dan menjalankan migrasi database.
- `npm run prisma:studio`: Membuka GUI untuk melihat data database.
- `npm run lint`: Menjalankan type-check TypeScript.
