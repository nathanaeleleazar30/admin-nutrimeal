# NutriMeal Frontend - Next.js App Router (RSC)

Dashboard operasional katering sehat UMKM dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **React Server Components (RSC)**, dan **Tailwind CSS**.

## Menjalankan Frontend

1. Salin file environment:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan server development:
   ```bash
   npm run dev
   ```
4. Buka di browser: `http://localhost:3000`
5. Build untuk production:
   ```bash
   npm run build
   ```

## Struktur Direktori
* `src/app/`: Server Components halaman, layouts, error boundary (`error.tsx`), skeleton (`loading.tsx`), not found (`not-found.tsx`), dan Server Actions (`actions.ts`).
* `src/components/`: Reusable components (termasuk leaf Client Components `"use client"`).
* `src/lib/`: Pemanggil API Express (`api.ts`) dengan `import "server-only"`.
* `src/types/`: Definisi TypeScript terpusat.
* `public/`: Aset statis & logo.
