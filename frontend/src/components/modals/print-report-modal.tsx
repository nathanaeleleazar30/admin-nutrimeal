'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics?: any;
}

export function PrintReportModal({ isOpen, onClose, analytics }: PrintReportModalProps) {
  if (!isOpen) return null;

  const monthlyRevenue = Number(analytics?.kpi?.monthlyRevenue ?? 0);
  const paidOrdersCount = Number(analytics?.kpi?.paidOrdersCount ?? 0);
  const totalSoldPortions = Number(analytics?.packageDonut?.totalSoldPortions ?? 0);
  const activeCustomers = Number(analytics?.kpi?.activeCustomers ?? 0);
  const categories: Array<{ name: string; portions: number; percent: number; revenue?: number }> =
    Array.isArray(analytics?.packageDonut?.categories) ? analytics.packageDonut.categories : [];
  const morningText = analytics?.deliveryBatches?.morning?.countText || '0 Box Terkonfirmasi';
  const morningStatus = analytics?.deliveryBatches?.morning?.status || 'Siap';
  const eveningText = analytics?.deliveryBatches?.evening?.countText || '0 Box Terkonfirmasi';
  const eveningStatus = analytics?.deliveryBatches?.evening?.status || 'Siap';
  const printedAt = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Actions */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 no-print">
          <span className="font-bold text-slate-800 text-sm">
            Pratinjau Laporan Penjualan Katering (Pesanan Lunas)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 space-y-6 text-xs text-slate-800 max-h-[75vh] overflow-y-auto">
          {/* Header & Logo */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0 flex items-center justify-center bg-white">
                <Image
                  src="/logo.png"
                  alt="NutriMeal Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  NUTRIMEAL UMKM INDONESIA
                </h1>
                <p className="text-[11px] text-slate-500">
                  Layanan Katering Makanan Sehat, Diet &amp; Korporat
                </p>
                <p className="text-[10px] text-slate-400">
                  Rekap transaksi berstatus Lunas &amp; jadwal terkonfirmasi
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded text-[11px] border border-emerald-200">
                LAPORAN RESMI
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Dicetak: {printedAt} WIB</p>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase">Total Omset Lunas</span>
              <span className="text-base font-bold text-emerald-800">
                Rp {monthlyRevenue.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase">Pesanan Lunas</span>
              <span className="text-base font-bold text-slate-900">
                {paidOrdersCount.toLocaleString('id-ID')} Pesanan
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase">Total Porsi Lunas</span>
              <span className="text-base font-bold text-slate-900">
                {totalSoldPortions.toLocaleString('id-ID')} Porsi
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase">Pelanggan Aktif</span>
              <span className="text-base font-bold text-slate-900">
                {activeCustomers.toLocaleString('id-ID')} Orang
              </span>
            </div>
          </div>

          {/* Table Breakdown */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2">
              Rekapitulasi Penjualan Berdasarkan Paket / Menu (Lunas)
            </h3>
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                  <th className="p-2 border border-slate-200">Paket / Menu</th>
                  <th className="p-2 border border-slate-200">Porsi Terjual</th>
                  <th className="p-2 border border-slate-200">Persentase</th>
                  <th className="p-2 border border-slate-200 text-right">Pendapatan Lunas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">
                      Belum ada transaksi berstatus Lunas untuk dilaporkan.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border border-slate-200 font-medium">{cat.name}</td>
                      <td className="p-2 border border-slate-200">{cat.portions} porsi</td>
                      <td className="p-2 border border-slate-200">{cat.percent}%</td>
                      <td className="p-2 border border-slate-200 text-right">
                        Rp {Number(cat.revenue ?? 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="p-2 border border-slate-200">TOTAL</td>
                  <td className="p-2 border border-slate-200">{totalSoldPortions} porsi</td>
                  <td className="p-2 border border-slate-200">{categories.length > 0 ? '100%' : '0%'}</td>
                  <td className="p-2 border border-slate-200 text-right">
                    Rp {monthlyRevenue.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Operational Delivery Shift Recap */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Status Shift Operasional (Lunas/COD)</h4>
            <p className="text-[11px] text-slate-600">
              • Batch Pagi/Siang (11:00 - 12:30 WIB): <b>{morningText}</b> - Status: <b>{morningStatus}</b>
            </p>
            <p className="text-[11px] text-slate-600">
              • Batch Sore/Malam (16:00 - 17:30 WIB): <b>{eveningText}</b> - Status: <b>{eveningStatus}</b>
            </p>
          </div>

          {/* Signature Footer */}
          <div className="pt-6 flex justify-between items-end border-t border-slate-200">
            <div>
              <p className="text-[10px] text-slate-400">NutriMeal Catering Management System</p>
              <p className="text-[10px] text-slate-400">Dokumen digenerate otomatis dari data pembayaran terverifikasi</p>
            </div>
            <div className="text-center w-48">
              <p className="text-[11px] text-slate-500 mb-12">Disetujui oleh Penanggung Jawab,</p>
              <p className="font-bold text-slate-900 underline">Admin Operasional NutriMeal</p>
              <p className="text-[10px] text-slate-400">Manajemen Dapur &amp; Keuangan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
