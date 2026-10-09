'use client';

import React from 'react';
import {
  FileText,
  Banknote,
  Users,
  Utensils,
  ArrowUpRight,
} from 'lucide-react';

interface StatCardsProps {
  stats?: {
    totalOrdersToday: number;
    totalOrdersChange: string;
    readyToShip: number;
    inProcess: number;
    monthlyRevenueDisplay: string;
    monthlyRevenueChange: string;
    dailyRevenueAverage: string;
    activeCustomers: number;
    newCustomersThisMonth: number;
    personalCustomers: number;
    corporateCustomers: number;
    activeMenus: number;
    availablePackages: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const data = stats || {
    totalOrdersToday: 142,
    totalOrdersChange: '+16.2%',
    readyToShip: 96,
    inProcess: 46,
    monthlyRevenueDisplay: 'Rp 18.5jt',
    monthlyRevenueChange: '+14.5%',
    dailyRevenueAverage: 'Rp 720rb',
    activeCustomers: 320,
    newCustomersThisMonth: 28,
    personalCustomers: 215,
    corporateCustomers: 105,
    activeMenus: 24,
    availablePackages: 5,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Pesanan Masuk */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">Total Pesanan Masuk</p>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {data.totalOrdersToday}
          </span>
          <span className="text-xs text-slate-500 font-medium">Pesanan Hari Ini</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            {data.totalOrdersChange}
          </span>
          <span className="text-[11px] text-slate-400">vs kemarin</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span><b className="text-slate-700">{data.readyToShip}</b> Siap Kirim,</span>
          <span><b className="text-slate-700">{data.inProcess}</b> Aktif Diproses</span>
        </div>
      </div>

      {/* Card 2: Penjualan Bulan Ini */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">Penjualan Bulan Ini</p>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Banknote className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {data.monthlyRevenueDisplay}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            {data.monthlyRevenueChange}
          </span>
          <span className="text-[11px] text-slate-400">vs bulan lalu</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
          Omset katering harian rata-rata <b className="text-slate-700">{data.dailyRevenueAverage}</b>
        </div>
      </div>

      {/* Card 3: Total Pelanggan Aktif */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">Total Pelanggan Aktif</p>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {data.activeCustomers}
          </span>
          <span className="text-xs text-slate-500 font-medium">Pelanggan</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center text-[11px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-sm">
            +{data.newCustomersThisMonth} baru
          </span>
          <span className="text-[11px] text-slate-400">bulan ini</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span><b className="text-slate-700">{data.personalCustomers}</b> Personal,</span>
          <span><b className="text-slate-700">{data.corporateCustomers}</b> Korporat/Kantor</span>
        </div>
      </div>

      {/* Card 4: Menu Siap Saji di Keranjang */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">Menu Siap Saji Aktif</p>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {data.activeMenus}
          </span>
          <span className="text-xs text-slate-500 font-medium">Menu Variasi Sehat</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
            Pilihan Fleksibel
          </span>
          <span className="text-[11px] text-slate-400">di keranjang</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
          Pelanggan atur menu per jadwal hari & shift
        </div>
      </div>
    </div>
  );
}
