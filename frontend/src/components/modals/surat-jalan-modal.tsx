'use client';

import React, { useState, useRef } from 'react';
import { CateringOrder } from '@/lib/data-store';
import {
  Printer,
  X,
  Truck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

interface SuratJalanModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CateringOrder[];
  selectedDay?: string;
  selectedBatch?: string;
}

export function SuratJalanModal({
  isOpen,
  onClose,
  orders,
  selectedDay = 'Senin',
  selectedBatch = 'Semua',
}: SuratJalanModalProps) {
  const [filterDay, setFilterDay] = useState(selectedDay === 'Semua Hari' ? 'Senin' : selectedDay);
  const [filterBatch, setFilterBatch] = useState(selectedBatch);
  const [selectedCourier, setSelectedCourier] = useState('Semua Kurir');
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filter orders for the manifest
  const manifestOrders = orders.filter((o) => {
    const matchesDay = filterDay === 'Semua' ? true : (o.day || 'Senin') === filterDay;
    const matchesBatch =
      filterBatch === 'Semua'
        ? true
        : filterBatch === 'Pagi/Siang' || filterBatch.toLowerCase().includes('siang')
        ? o.deliveryBatch === 'Pagi/Siang'
        : o.deliveryBatch === 'Sore/Malam';
    const matchesCourier =
      selectedCourier === 'Semua Kurir'
        ? true
        : o.courierName?.includes(selectedCourier);

    return matchesDay && matchesBatch && matchesCourier;
  });

  const totalBoxes = manifestOrders.reduce(
    (acc, curr) => acc + (curr.portionsCount || 1),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const suratJalanCode = `SJ/NM/${new Date().getFullYear()}${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${
    filterBatch === 'Sore/Malam' ? 'SORE' : 'SIANG'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Control Bar (Screen Only - Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Surat Jalan & Manifest Kurir</h3>
              <p className="text-[11px] text-slate-300">
                Rekap lembar jalan harian untuk armada pengantaran NutriMeal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/orders/surat-jalan?day=${filterDay}&batch=${filterBatch}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Halaman Penuh</span>
            </Link>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls (Screen Only) */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3 text-xs shrink-0 print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Hari:</span>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 outline-none"
            >
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Semua'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Shift Batch:</span>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 outline-none"
            >
              <option value="Semua">Semua Shift</option>
              <option value="Pagi/Siang">Siang (11:30 - 13:00 WIB)</option>
              <option value="Sore/Malam">Sore (17:00 - 18:30 WIB)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Armada / Driver:</span>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 text-xs focus:ring-1 focus:ring-emerald-600 outline-none"
            >
              <option value="Semua Kurir">Semua Driver</option>
              <option value="Budi Santoso">Budi Santoso (Motor 01 - Siang)</option>
              <option value="Ahmad Fauzi">Ahmad Fauzi (Motor 02 - Sore)</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2 text-slate-500">
            <span className="font-medium">
              Total Titik: <strong className="text-slate-800">{manifestOrders.length}</strong>
            </span>
            <span>•</span>
            <span className="font-medium">
              Total Box: <strong className="text-emerald-700">{totalBoxes} Porsi</strong>
            </span>
          </div>
        </div>

        {/* Printable Sheet Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60 print:bg-white print:p-0">
          <div
            ref={printRef}
            className="bg-white max-w-3xl mx-auto p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200/80 print:shadow-none print:border-none print:p-0 text-slate-900"
          >
            {/* Header Surat Jalan */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl text-emerald-800 tracking-tight">
                    NUTRIMEAL
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Healthy Catering UMKM
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 max-w-sm">
                  Dapur Pusat NutriMeal • Layanan Katering Sehat Harian & Perkantoran
                  <br />
                  Hotline Kurir & Dispatcher: +62 812-4491-0099 / (021) 788-9011
                </p>
              </div>

              <div className="text-right">
                <h1 className="text-base font-black text-slate-900 uppercase tracking-wide">
                  SURAT JALAN PENGIRIMAN
                </h1>
                <p className="font-mono text-xs font-bold text-emerald-800 mt-0.5">
                  {suratJalanCode}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{currentDateFormatted}</p>
              </div>
            </div>

            {/* Manifest Overview Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Jadwal Pengiriman
                </span>
                <span className="font-bold text-slate-800">
                  {filterDay} •{' '}
                  {filterBatch === 'Sore/Malam'
                    ? 'Batch Sore (17:00)'
                    : 'Batch Siang (11:30)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Armada / Kurir
                </span>
                <span className="font-bold text-slate-800">
                  {selectedCourier === 'Semua Kurir' ? 'NutriExpress Team' : selectedCourier}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Total Titik Antar
                </span>
                <span className="font-bold text-slate-800">{manifestOrders.length} Lokasi</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Total Muatan Box
                </span>
                <span className="font-bold text-emerald-800">{totalBoxes} Porsi Box</span>
              </div>
            </div>

            {/* Orders Table for Manifest */}
            {manifestOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs border border-dashed rounded-lg">
                Tidak ada pesanan katering pada filter hari dan shift yang dipilih.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-8 text-center">No</th>
                      <th className="py-2.5 px-3 w-44">Penerima & Kontak</th>
                      <th className="py-2.5 px-3">Alamat Lengkap & Drop Point</th>
                      <th className="py-2.5 px-3 w-40">Menu & Box</th>
                      <th className="py-2.5 px-3 w-28 text-center">Tanda Terima</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {manifestOrders.map((order, idx) => (
                      <tr key={order.id} className="hover:bg-slate-50/40">
                        {/* No */}
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>

                        {/* Customer */}
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900 leading-tight">
                            {order.customerName}
                          </p>
                          <p className="font-mono text-[10px] text-emerald-800 mt-0.5">
                            #{order.id}
                          </p>
                          <p className="text-[11px] text-slate-500">{order.customerPhone}</p>
                        </td>

                        {/* Address */}
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-800 leading-snug">
                            {order.customerAddress}
                          </p>
                          {order.addressDetail && (
                            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                              📍 {order.addressDetail}
                            </p>
                          )}
                          {order.courierNotes && (
                            <p className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-1">
                              Catatan: {order.courierNotes}
                            </p>
                          )}
                        </td>

                        {/* Menu & Portions */}
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">
                            {order.menuName || order.packageName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {order.menuDetail || order.packageDetail}
                          </p>
                          <span className="inline-block mt-1 font-bold text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {order.portionsCount || 1} Box Porsi
                          </span>
                        </td>

                        {/* Receipt Box */}
                        <td className="py-2.5 px-3 text-center border-l border-slate-100">
                          <div className="h-10 border border-dashed border-slate-300 rounded flex flex-col justify-end p-1">
                            <span className="text-[9px] text-slate-400">Jam & Paraf</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SOP Kurir Notes */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 mb-6">
              <span className="font-bold text-slate-800 block mb-1">
                Catatan Penting Pengantaran Makanan (SOP Kurir):
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-600">
                <li>
                  Jaga suhu makanan dengan menutup rapat thermal bag selama perjalanan.
                </li>
                <li>
                  Makanan harus sampai ke tangan penerima / meja resepsionis sebelum batas jam batch berakhir.
                </li>
                <li>
                  Wajib foto serah terima paket dan laporkan bila ada penolakan atau penerima tidak dapat dihubungi.
                </li>
              </ul>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-3 gap-6 pt-2 text-center text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-12">
                  Diserahkan Oleh (Dapur)
                </p>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                  ( Bagian Dispatcher )
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-12">
                  Dibawa Oleh (Kurir)
                </p>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                  ( {selectedCourier === 'Semua Kurir' ? 'Driver Pengantar' : selectedCourier} )
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-12">
                  Mengetahui (Supervisor)
                </p>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                  ( Manager Operasional )
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Screen Only) */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden text-xs">
          <span className="text-slate-500">
            Gunakan tombol <strong>Cetak Sekarang</strong> atau <strong>Ctrl + P</strong> untuk mencetak lembar jalan fisik kurir.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Surat Jalan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
