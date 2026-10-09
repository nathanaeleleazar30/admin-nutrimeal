'use client';

import React from 'react';
import { Printer, PlusCircle } from 'lucide-react';

interface HeaderBannerProps {
  onPrintReport?: () => void;
  onAddOrder?: () => void;
}

export function HeaderBanner({ onPrintReport, onAddOrder }: HeaderBannerProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>OPERASIONAL AKTIF</span>
          <span className="text-emerald-400 font-normal">•</span>
          <span className="text-emerald-700 font-normal">Shift Masak & Pengiriman Hari Ini</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard Operasional Katering UMKM
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Kelola menu, pesanan pelanggan, dan laporan penjualan harian secara terpadu.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onPrintReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Cetak Laporan Penjualan</span>
        </button>

        <button
          onClick={onAddOrder}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm shadow-emerald-900/20 transition-all active:scale-98 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>Tambah Pesanan Baru</span>
        </button>
      </div>
    </div>
  );
}
