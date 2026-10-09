# NutriMeal - Full-Stack Web Platform Katering Sehat UMKM

Proyek Tugas Besar **UTS - Pemrograman Web Framework**.
Aplikasi manajemen operasional katering sehat yang dibangun dengan arsitektur **Clean Code**, memisahkan sisi **Backend REST API (Express.js + MySQL)** dan **Frontend (Next.js App Router dengan React Server Components)**.

---

## 🏛️ Arsitektur Proyek

Sesuai ketentuan soal, proyek ini dikelola dalam satu repositori terstruktur:

```text
├── backend/                    # REST API Server (Express.js + MySQL/MariaDB)
│   ├── server.js               # Entry point Express (CORS, JSON, Morgan, Routers, Error Handler 4-Param)
│   ├── database.sql            # Skema tabel dan data seed awal MySQL
│   ├── .env.example            # Template konfigurasi environment backend
│   ├── package.json
│   └── src/
│       ├── lib/                # db.js (Connection Pool mysql2/promise), seeder.js, errorHandler.js
│       ├── routes/             # Pemetaan endpoint HTTP menggunakan express.Router()
│       ├── controller/         # Logika validasi input (error 400 seragam) & status response
│       └── model/              # Query SQL murni dengan placeholder '?' (keamanan SQL injection)
│
├── frontend/                   # Frontend Dashboard (Next.js App Router + RSC)
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── .env.example            # Template konfigurasi API_URL & NEXT_PUBLIC_API_URL
│   ├── public/                 # Aset gambar & ikon
│   └── src/
│       ├── app/
│       │   ├── layout.tsx      # Root Layout dengan font & metadata
│       │   ├── page.tsx        # Server Component Dashboard Utama
│       │   ├── loading.tsx     # Global Streaming Skeleton Loader
│       │   ├── error.tsx       # Global Error Boundary (Client Component)
│       │   ├── not-found.tsx   # Halaman 404 Not Found
│       │   ├── actions.ts      # Server Actions ("use server") untuk mutasi data
│       │   └── admin/          # Modul admin (menu, orders, vouchers, packages, schedule, customers, dll)
│       ├── components/         # Reusable Server & Client Components
│       ├── lib/
│       │   ├── api.ts          # Lapisan data aman pemanggil API Express ("server-only")
│       │   └── data-store.ts   # Fallback mock data store
│       └── types/              # Tipe data TypeScript terpusat
```

---

## 🚀 Panduan Menjalankan Aplikasi dari Nol

### 1. Prasyarat Sistem
* **Node.js**: v18.x atau v20.x+
* **MySQL / MariaDB**: Melalui **Laragon** (direkomendasikan) atau XAMPP

---

### 2. Menjalankan Backend (Express.js + MySQL)

1. Pastikan server **MySQL pada Laragon sudah Start**.
2. Buka terminal dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```
3. Salin environment variable:
   ```bash
   cp .env.example .env
   ```
4. Install dependensi backend:
   ```bash
   npm install
   ```
5. **Jalankan Seeder Database Otomatis**:
   ```bash
   npm run seed
   ```
   *(Perintah ini otomatis membuat database `nutrimeal_db`, seluruh tabel relasional, serta data awal admin & menu).*
6. Jalankan server backend:
   ```bash
   npm run dev
   ```
   Backend aktif pada: **`http://localhost:5000`**

---

### 3. Menjalankan Frontend (Next.js App Router)

1. Buka terminal baru dan masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Salin environment variable:
   ```bash
   cp .env.example .env.local
   ```
3. Install dependensi frontend:
   ```bash
   npm install
   ```
4. Jalankan development server:
   ```bash
   npm run dev
   ```
5. Buka browser pada: **`http://localhost:3000`**
6. Untuk build production bundle:
   ```bash
   npm run build
   ```

---

## 🔑 Kredensial Akun Admin Default

* **Halaman Login**: `http://localhost:3000/admin/login`
* **Email**: `nathanael@nutrimeal.id`
* **Kata Sandi**: `nathanael123`
* **Role**: `superadmin`

*(Tersedia tombol pintas **"Demo: Isi Akun Nathanael"** di bawah form login)*

---

## 📊 Tabel Strategi Render Halaman (Sesuai Ketentuan UTS)

Sesuai ketentuan penilaian pada materi React Server Components (RSC):

| Halaman | Rute URL | Strategi Render | Alasan Pemilihan Strategi |
|---|---|---|---|
| **Dashboard Utama** | `/` | **SSR (Server-Side Rendering)** | Membutuhkan data analitik, metrik KPI pesanan harian, dan ringkasan batch pengantaran real-time setiap kali halaman diminta (`export const dynamic = 'force-dynamic'`). |
| **Kelola Menu** | `/admin/menu` | **ISR (Incremental Static Regeneration)** | Menu katering tidak berubah setiap detik, namun perlu diperbarui secara berkala tanpa rebuild aplikasi (`revalidate = 60`). |
| **Katalog & Langganan** | `/admin/packages` | **SSR** | Menampilkan status langganan aktif pelanggan yang berubah statusnya saat dijeda atau diperpanjang. |
| **Daftar Pesanan** | `/admin/orders` | **SSR** | Data pesanan dan logistik pengiriman kurir bersifat transaksional dan harus selalu mutakhir. |
| **Detail Pesanan** | `/admin/orders/[id]` | **SSR (Dynamic Route)** | Halaman detail dinamis berdasarkan parameter ID pesanan dengan `await params`, memanggil `notFound()` jika ID tidak valid, dan menggunakan `generateMetadata`. |
| **Jadwal Pengiriman** | `/admin/schedule` | **SSR** | Jadwal pembagian batch shift masak dapur pagi/siang dan sore/malam yang diperbarui secara langsung. |
| **Voucher & Promo** | `/admin/vouchers` | **SSR** | Menampilkan sisa kuota promo dan toggle status aktif/nonaktif kupon belanja secara langsung. |
| **Data Pelanggan** | `/admin/customers` | **SSR** | Data sensitif profil pelanggan, riwayat belanja (LTV), dan catatan alergi medis. |
| **Pusat Bantuan & FAQ** | `/admin/faq` | **SSG (Static Site Generation)** | Pertanyaan umum bersifat statis dan jarang berubah sehingga optimal di-render saat build. |
| **Halaman Login** | `/admin/login` | **SSG** | Halaman statis form login dengan interaktivitas client component untuk autentikasi kredensial. |

---

## 📋 Daftar Endpoint REST API Backend (Express.js)

| Method | Endpoint | Fungsi | Status Code |
|---|---|---|---|
| `GET` | `/` | Health check & indeks server | `200` |
| `POST` | `/api/auth/login` | Autentikasi admin (email & password ke MySQL) | `200`, `400`, `401` |
| `GET` | `/api/meals` | Mengambil seluruh daftar menu makanan | `200` |
| `GET` | `/api/meals/:id` | Detail menu berdasarkan ID | `200`, `404` |
| `POST` | `/api/meals` | Menambahkan menu makanan baru | `201`, `400` |
| `PUT` | `/api/meals/:id` | Memperbarui informasi & nutrisi menu | `200`, `400`, `404` |
| `DELETE`| `/api/meals/:id` | Menghapus menu makanan | `200`, `404` |
| `GET` | `/api/packages` | Mengambil katalog paket langganan katering | `200` |
| `POST` | `/api/packages` | Menambah paket langganan baru | `201`, `400` |
| `GET` | `/api/orders` | Mengambil daftar pesanan & shift pengantaran | `200` |
| `PATCH`| `/api/orders/:id/status`| Memperbarui status pesanan (Diterima $\to$ Diproses $\to$ Dikirim $\to$ Selesai) | `200`, `400` |
| `GET` | `/api/vouchers` | Mengambil daftar voucher promo aktif/nonaktif | `200` |
| `POST` | `/api/vouchers` | Membuat voucher promo baru | `201`, `400` |
| `PATCH`| `/api/vouchers/:id/toggle`| Mengaktifkan / menonaktifkan status kupon | `200`, `404` |
| `GET` | `/api/subscriptions` | Mengambil data langganan aktif & status jeda pelanggan | `200` |
| `PATCH`| `/api/subscriptions/:id/status` | Memperbarui status langganan (Aktif $\leftrightarrow$ Dijeda) | `200`, `400` |
| `GET` | `/api/customers` | Mengambil data profil pelanggan & catatan alergi medis | `200` |
| `GET` | `/api/faqs` | Mengambil daftar pertanyaan pusat bantuan | `200` |

---

## 👨‍💻 Kontributor & Tim
* **Proyek**: NutriMeal - Platform Katering Sehat UMKM
* **Mata Kuliah**: Pemrograman Web Framework (UTS)
