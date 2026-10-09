# NutriMeal Backend - REST API

Backend REST API untuk aplikasi katering sehat **NutriMeal** yang dibangun menggunakan **Express.js** dan database **MySQL / MariaDB**. Proyek ini dibuat untuk memenuhi tugas **UTS - Pemrograman Web Framework**.

---

## 🛠️ Tech Stack & Arsitektur

* **Framework**: Express.js (Node.js)
* **Database**: MySQL / MariaDB (Connection Pool via `mysql2/promise`)
* **Arsitektur**: Clean Architecture 3-Layer:
  * `src/routes/` $\to$ Mapping endpoint HTTP via `express.Router()`
  * `src/controller/` $\to$ Request validation, status code response (`200`, `201`, `400`, `404`)
  * `src/model/` $\to$ Eksekusi query SQL dengan parameterized query `?`
  * `src/lib/` $\to$ Connection pool database & middleware error handler 4-parameter `(err, req, res, next)`

---

## 🚀 Panduan Menjalankan Backend dari Nol

### 1. Prasyarat Sistem
* **Node.js**: v18.x atau yang lebih baru
* **MySQL / MariaDB Server**: (XAMPP, Laragon, Docker, atau MySQL Server lokal)

### 2. Setup & Seeding Database
Ada 2 cara mudah untuk menyiapkan database:

* **Cara 1 (Paling Cepat & Otomatis - Direkomendasikan)**:
  Jalankan perintah seeder di terminal:
  ```bash
  npm run seed
  ```
  *(Perintah ini otomatis membuat database `nutrimeal_db`, seluruh tabel relasional, serta data awal admin & menu).*

* **Cara 2 (Manual via HeidiSQL / phpMyAdmin)**:
  Import file `database.sql`:
  ```bash
  mysql -u root -p < database.sql
  ```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan kredensial database Anda pada `.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=nutrimeal_db
DB_PORT=3306

FRONTEND_URL=http://localhost:3000
```

### 4. Instalasi Dependensi
Jalankan perintah berikut di dalam folder `backend`:
```bash
npm install
```

### 5. Menjalankan Server
* Mode Development (dengan hot-reload):
  ```bash
  npm run dev
  ```
* Mode Production:
  ```bash
  npm start
  ```

Server akan aktif pada: `http://localhost:5000`

---

## 📋 Daftar Endpoint REST API

| Method | Endpoint | Keterangan | Status Sukses |
|---|---|---|---|
| `GET` | `/` | Health check & indeks API | `200` |
| `GET` | `/api/meals` | Daftar menu makanan (filter `category`, `search`) | `200` |
| `GET` | `/api/meals/:id` | Detail menu berdasarkan ID | `200` |
| `POST` | `/api/meals` | Tambah menu baru | `201` |
| `PUT` | `/api/meals/:id` | Update menu | `200` |
| `DELETE` | `/api/meals/:id` | Hapus menu | `200` |
| `GET` | `/api/packages` | Daftar katalog paket langganan | `200` |
| `GET` | `/api/packages/:id` | Detail paket langganan | `200` |
| `POST` | `/api/packages` | Tambah paket katering baru | `201` |
| `PUT` | `/api/packages/:id` | Update paket katering | `200` |
| `DELETE` | `/api/packages/:id` | Hapus paket katering | `200` |
| `GET` | `/api/orders` | Daftar pesanan katering | `200` |
| `GET` | `/api/orders/:id` | Detail pesanan | `200` |
| `POST` | `/api/orders` | Buat pesanan baru | `201` |
| `PATCH` | `/api/orders/:id/status` | Update status pesanan | `200` |
| `PUT` | `/api/orders/:id` | Update data pesanan | `200` |
| `DELETE` | `/api/orders/:id` | Hapus pesanan | `200` |
| `GET` | `/api/vouchers` | Daftar voucher & promo | `200` |
| `POST` | `/api/vouchers` | Buat voucher baru | `201` |
| `PATCH` | `/api/vouchers/:id/toggle` | Toggle aktif/nonaktifkan voucher | `200` |
| `DELETE` | `/api/vouchers/:id` | Hapus voucher | `200` |
| `GET` | `/api/customers` | Daftar pelanggan & data alergi | `200` |
| `GET` | `/api/customers/:id` | Detail pelanggan | `200` |
| `POST` | `/api/customers` | Tambah pelanggan | `201` |
| `PUT` | `/api/customers/:id` | Update profil pelanggan | `200` |
| `DELETE` | `/api/customers/:id` | Hapus pelanggan | `200` |
| `GET` | `/api/subscriptions` | Daftar langganan aktif pelanggan | `200` |
| `PATCH` | `/api/subscriptions/:id/status` | Update status langganan / jeda cuti | `200` |
| `GET` | `/api/faqs` | Daftar FAQ & pusat bantuan | `200` |
| `POST` | `/api/faqs` | Tambah FAQ baru | `201` |
| `PUT` | `/api/faqs/:id` | Update FAQ | `200` |
| `DELETE` | `/api/faqs/:id` | Hapus FAQ | `200` |
