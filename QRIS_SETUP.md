# Panduan Setup Pembayaran QRIS Dinamis (Midtrans Core API)

Dokumen ini menjelaskan konfigurasi, migrasi database, setup Midtrans Sandbox, webhook lokal, dan cara menguji pembayaran QRIS end-to-end pada aplikasi **NutriMeal** (Flutter Mobile, Express Backend, dan Web Admin).

---

## 1. Prasyarat & Akun Midtrans Sandbox

1. Daftar atau masuk ke [Midtrans Dashboard Sandbox](https://dashboard.sandbox.midtrans.com/).
2. Pastikan metode pembayaran **QRIS** (acquirer GoPay / QRIS Core API) aktif di menu **Settings -> Payment Channels** di dashboard Midtrans Sandbox.
3. Buka **Settings -> Access Keys**, lalu salin **Server Key** Sandbox Anda (`SB-Mid-server-...`).
   - **Penting:** Jangan pernah menaruh `MIDTRANS_SERVER_KEY` di aplikasi Flutter, Next.js client bundle, atau melakukan commit file `.env` ke Git.

---

## 2. Konfigurasi Environment Backend (`backend/`)

1. Salin `backend/.env.example` menjadi `backend/.env` (jika belum ada), lalu isi variabel berikut:
   ```env
   JWT_SECRET=<ganti_dengan_string_acak_minimal_32_karakter>
   MIDTRANS_SERVER_KEY=SB-Mid-server-XXXXXXXXXXXXXXXXXXXX
   MIDTRANS_IS_PRODUCTION=false
   ```
2. Pastikan konfigurasi database (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`) mengarah ke instance MySQL Anda.

---

## 3. Migrasi Database MySQL

Jalankan migrasi terbaru (`migrations/007_create_payments.sql` dan `migrations/008_alter_payments_idempotency.sql`) yang menambahkan tabel `payments` (`creating`/`pending`/`paid`/`cancelled`/`expired`/`failed`, `request_hash`, `midtrans_idempotency_key`), memperbarui ENUM `orders.status` dan `orders.payment_status`, serta men-seed `pkg-popular`:

```bash
cd backend
npm run db:migrate
```

Pastikan output menampilkan migrasi `007_create_payments.sql` dan `008_alter_payments_idempotency.sql` sukses diaplikasikan.

---

## 4. Webhook Midtrans untuk Pengujian Lokal (`ngrok`)

Agar Midtrans Sandbox dapat mengirim notifikasi settlement ke backend lokal (`http://localhost:5000`):

1. Jalankan backend Express:
   ```bash
   cd backend
   npm start
   ```
2. Expose port 5000 dengan ngrok:
   ```bash
   ngrok http 5000
   ```
3. Buka **Midtrans Dashboard Sandbox -> Settings -> Configuration -> Payment Notification URL**, lalu masukkan URL publik ngrok ditambah path webhook:
   ```
   https://<subdomain-ngrok>.ngrok-free.app/api/payments/notification
   ```
   > **Catatan:** Aplikasi mobile tetap melakukan polling fallback (`GET /api/payments/:id`) ke server setiap 4 detik dan saat aplikasi kembali aktif (*resume*), sehingga meskipun ngrok sedang tidak aktif saat uji coba lokal, penekanan tombol **Refresh Status** (atau tarik layar ke bawah) di Flutter akan tetap menanyakan status langsung ke Midtrans API dari backend.

---

## 5. Cara Simulasi Pembayaran QRIS di Midtrans Sandbox Simulator

1. Jalankan aplikasi Flutter pada mode debug:
   - Pastikan `ApiConfig.baseUrl` di `lib/core/constants/api_config.dart` mengarah ke backend lokal Anda (mis. `http://10.0.2.2:5000` untuk Android Emulator atau IP LAN untuk perangkat fisik).
2. Login sebagai customer di aplikasi Flutter, tambahkan menu ke keranjang (atau pilih paket langganan), lengkapi alamat & nomor WhatsApp, lalu tekan **Lanjut ke Pembayaran** (QRIS langsung dibuat otomatis dengan loading *Menyiapkan QRIS...*).
3. Pada layar **Pembayaran QRIS** dalam mode debug (`kDebugMode`), klik tombol **Salin QR URL (Debug Sandbox)**.
4. Buka [Midtrans QRIS Simulator Sandbox](https://simulator.sandbox.midtrans.com/v2/qris/index), tempel **QR URL** yang baru saja disalin (`https://api.sandbox.midtrans.com/v2/qris/.../qr-code`), lalu konfirmasi pembayaran **QRIS**. **Jangan pernah memindai / membayar QR Sandbox dengan uang asli.**
5. Dalam beberapa detik (lewat webhook ngrok, polling 4 detik, tarik layar ke bawah, atau tombol **Refresh Status**), layar Flutter otomatis berpindah ke **Pembayaran Berhasil!** (`PaymentStatusScreen`), keranjang dikosongkan, `idempotency_key` dibersihkan, notifikasi dibuat, dan di Web Admin status order berubah menjadi **Diterima / Lunas**.

---

## 6. Skenario Uji Wajib Sebelum Go-Live

1. **Pending & Bayar Nanti:** Buat QRIS lalu tekan kembali dan pilih **Bayar nanti** -> banner *Menunggu Pembayaran QRIS* muncul di Beranda & Keranjang dengan tombol **Lanjutkan Pembayaran**.
2. **Pembatalan QRIS:** Tekan **Batalkan QRIS** -> transaksi dibatalkan di Midtrans, order menjadi **Dibatalkan**, dan item keranjang belanja tetap tersimpan.
3. **Kedaluwarsa:** Tunggu hingga countdown 15:00 habis -> QR otomatis disembunyikan dan muncul opsi **Buat QRIS Baru**.
4. **Admin Revenue & Surat Jalan:** Pastikan order dengan status **Menunggu Pembayaran**, **Dibatalkan**, atau **Kedaluwarsa** tidak dihitung pada total pendapatan/omzet di Analytics dan tidak ikut tercetak pada Surat Jalan kurir.
