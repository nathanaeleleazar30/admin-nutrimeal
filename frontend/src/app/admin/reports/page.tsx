'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { WeeklySalesChart } from '@/components/dashboard/weekly-sales-chart';
import { DonutPackageSales } from '@/components/dashboard/donut-package-sales';
import { PrintReportModal } from '@/components/modals/print-report-modal';
import { BarChart3, Printer, TrendingUp, Calendar, Download } from 'lucide-react';

export default function AdminReportsPage() {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-800" />
            <span>Laporan Penjualan & Omset</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analisis rekap pendapatan katering harian, mingguan, performa paket terlaris, dan cetak laporan resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span>Cetak Rekap Laporan</span>
          </button>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Pendapatan Bulan Ini</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">Rp 18.500.000</p>
          <span className="inline-block mt-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            +14.5% vs bulan sebelumnya
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Porsi Terdistribusi</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">1.428 Porsi</p>
          <span className="inline-block mt-2 text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
            Rata-rata 47.6 porsi / hari
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Margin & Efisiensi Bahan</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">68.4%</p>
          <span className="inline-block mt-2 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
            Biaya bahan baku terkontrol
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          <WeeklySalesChart />
        </div>
        <div className="lg:col-span-4">
          <DonutPackageSales />
        </div>
      </div>

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </AdminLayout>
  );
}
