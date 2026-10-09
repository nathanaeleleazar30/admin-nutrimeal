'use client';

import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

export function RawIngredientNote() {
  return (
    <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
          <AlertCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span>Catatan Bahan Baku Katering</span>
        </div>
        <p className="text-[11px] text-emerald-800/90 mt-1 leading-relaxed">
          Stok ayam fillet dan sayuran segar mencukupi untuk 3 hari ke depan. Pastikan konfirmasi jadwal katering kantor sebelum pukul 15:00 WIB.
        </p>
      </div>
    </div>
  );
}
