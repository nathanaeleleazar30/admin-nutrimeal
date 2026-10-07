'use client';

import React from 'react';
import { X, Printer, Leaf } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrintReportModal({ isOpen, onClose }: PrintReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Actions */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 no-print">
          <span className="font-bold text-slate-800 text-sm">Pratinjau Laporan Penjualan Katering</span>
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
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  NUTRIMEAL UMKM INDONESIA
                </h1>
                <p className="text-[11px] text-slate-500">
                  Layanan Katering Makanan Sehat, Diet & Korporat
                </p>
                <p className="text-[10px] text-slate-400">
                  Jl. Soekarno Hatta No. 45, Lowokwaru, Malang, Jawa Timur | Telp: (0341) 556789
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded text-[11px] border border-emerald-200">
                LAPORAN RESMI
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Periode: 1 - 24 Okt 2024</p>
              <p className="text-[10px] text-slate-400">Dicetak: 24 Okt 2024, 12:00 WIB</p>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase">Total Omset</span>
              <span className="text-base font-bold text-emerald-800">Rp 18.500.000</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase">Pesanan Masuk</span>
              <span className="text-base font-bold text-slate-900">142 Pesanan</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase">Total Porsi Laku</span>
              <span className="text-base font-bold text-slate-900">1.428 Porsi</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase">Pelanggan Aktif</span>
              <span className="text-base font-bold text-slate-900">320 Orang</span>
            </div>
          </div>

          {/* Table Breakdown */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2">
              Rekapitulasi Penjualan Berdasarkan Kategori Paket
            </h3>
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                  <th className="p-2 border border-slate-200">Kategori Paket</th>
                  <th className="p-2 border border-slate-200">Porsi Terjual</th>
                  <th className="p-2 border border-slate-200">Persentase</th>
                  <th className="p-2 border border-slate-200 text-right">Estimasi Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 border border-slate-200 font-medium">Paket Sehat Diet</td>
                  <td className="p-2 border border-slate-200">600 porsi</td>
                  <td className="p-2 border border-slate-200">42%</td>
                  <td className="p-2 border border-slate-200 text-right">Rp 7.770.000</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200 font-medium">Paket Makan Siang Kantor</td>
                  <td className="p-2 border border-slate-200">443 porsi</td>
                  <td className="p-2 border border-slate-200">31%</td>
                  <td className="p-2 border border-slate-200 text-right">Rp 5.735.000</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200 font-medium">Paket Family 5 Hari</td>
                  <td className="p-2 border border-slate-200">257 porsi</td>
                  <td className="p-2 border border-slate-200">18%</td>
                  <td className="p-2 border border-slate-200 text-right">Rp 3.330.000</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200 font-medium">Prasmanan / Event</td>
                  <td className="p-2 border border-slate-200">128 porsi</td>
                  <td className="p-2 border border-slate-200">9%</td>
                  <td className="p-2 border border-slate-200 text-right">Rp 1.665.000</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="p-2 border border-slate-200">TOTAL</td>
                  <td className="p-2 border border-slate-200">1.428 porsi</td>
                  <td className="p-2 border border-slate-200">100%</td>
                  <td className="p-2 border border-slate-200 text-right">Rp 18.500.000</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Operational Delivery Shift Recap */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Status Shift Operasional Hari Ini</h4>
            <p className="text-[11px] text-slate-600">
              • Batch Pagi/Siang (11:00 - 12:30 WIB): <b>96 Box</b> - Status: <b>Selesai Diantar</b>
            </p>
            <p className="text-[11px] text-slate-600">
              • Batch Sore/Malam (16:00 - 17:30 WIB): <b>46 Box</b> - Status: <b>Dalam Proses Memasak</b>
            </p>
          </div>

          {/* Signature Footer */}
          <div className="pt-6 flex justify-between items-end border-t border-slate-200">
            <div>
              <p className="text-[10px] text-slate-400">NutriMeal Catering Management System</p>
              <p className="text-[10px] text-slate-400">Dokumen digenerate otomatis oleh sistem</p>
            </div>
            <div className="text-center w-48">
              <p className="text-[11px] text-slate-500 mb-12">Disetujui oleh Penanggung Jawab,</p>
              <p className="font-bold text-slate-900 underline">Siti Saroh</p>
              <p className="text-[10px] text-slate-400">Admin Operasional Katering</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
