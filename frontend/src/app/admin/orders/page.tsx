'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { CateringOrder } from '@/lib/data-store';
import { NewOrderModal } from '@/components/modals/new-order-modal';
import { SuratJalanModal } from '@/components/modals/surat-jalan-modal';
import {
  ShoppingBag,
  PlusCircle,
  Filter,
  Printer,
  Clock,
  MapPin,
  Search,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isSuratJalanModalOpen, setIsSuratJalanModalOpen] = useState(false);

  // Filters (Initial Shift Filter concept)
  const [batchFilter, setBatchFilter] = useState<'Semua' | 'Pagi/Siang' | 'Sore/Malam'>('Semua');
  const [dayFilter, setDayFilter] = useState<string>('Semua Hari');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination to prevent long scrolling
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderCreated = (order: CateringOrder) => {
    setOrders((prev) => [order, ...prev]);
    setIsNewOrderModalOpen(false);
  };

  const handleWhatsApp = (order: CateringOrder) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone;

    const msg = encodeURIComponent(
      `Halo Kak ${order.customerName}, kami dari NutriMeal Catering mengonfirmasi pesanan #${order.id} (${order.menuName || order.packageName}). Pengiriman dijadwalkan pada waktu ${order.deliverySchedule}. Silakan hubungi kami bila ada pertanyaan. Terima kasih!`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  // Filter orders by Shift, Day, and Search Query
  const filteredOrders = orders.filter((o) => {
    // 1. Shift Batch Filter
    if (batchFilter !== 'Semua' && o.deliveryBatch !== batchFilter) {
      return false;
    }

    // 2. Day Filter
    if (dayFilter !== 'Semua Hari' && (o.day || 'Senin') !== dayFilter) {
      return false;
    }

    // 3. Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      const matchAddress =
        o.customerAddress.toLowerCase().includes(q) ||
        (o.addressDetail && o.addressDetail.toLowerCase().includes(q));
      const matchMenu =
        o.packageName.toLowerCase().includes(q) ||
        (o.menuName && o.menuName.toLowerCase().includes(q));

      if (!matchId && !matchName && !matchPhone && !matchAddress && !matchMenu) {
        return false;
      }
    }

    return true;
  });

  // Calculate counts for badges
  const totalCount = orders.length;
  const siangCount = orders.filter((o) => o.deliveryBatch === 'Pagi/Siang').length;
  const soreCount = orders.filter((o) => o.deliveryBatch === 'Sore/Malam').length;

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [batchFilter, dayFilter, searchQuery]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-emerald-800" />
              <span>Kelola Pesanan Katering</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pantau antrean pesanan katering, filter per shift pengiriman, dan kelola rincian pengantaran kurir.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsSuratJalanModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Surat Jalan</span>
            </button>

            <button
              onClick={() => setIsNewOrderModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Tambah Pesanan Baru</span>
            </button>
          </div>
        </div>

        {/* Shift Batch Selector & Quick Filter Bar (Konsep Awal) */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Shift Filter Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filter Shift Masak & Kirim:</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg">
              <button
                onClick={() => setBatchFilter('Semua')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  batchFilter === 'Semua'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                Semua Shift ({totalCount})
              </button>

              <button
                onClick={() => setBatchFilter('Pagi/Siang')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  batchFilter === 'Pagi/Siang'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Shift Pagi/Siang ({siangCount})</span>
              </button>

              <button
                onClick={() => setBatchFilter('Sore/Malam')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  batchFilter === 'Sore/Malam'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Sunset className="w-3.5 h-3.5" />
                <span>Shift Sore/Malam ({soreCount})</span>
              </button>
            </div>
          </div>

          {/* Day & Search Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Day Dropdown */}
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
              >
                {['Semua Hari', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ID, Nama, Menu, Alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Unified Table (Tanpa Status Pesanan - Mengantisipasi Scroll Panjang) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Daftar Pesanan Katering
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                {filteredOrders.length} Pesanan
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Filter aktif: <strong className="text-slate-800">{batchFilter === 'Semua' ? 'Semua Shift' : `Shift ${batchFilter}`}</strong> • <strong className="text-slate-800">{dayFilter}</strong>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Memuat antrean pesanan katering...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">ID Pesanan</th>
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4">Alamat Pengiriman</th>
                    <th className="py-3 px-4">Paket & Menu</th>
                    <th className="py-3 px-4">Jadwal Shift</th>
                    <th className="py-3 px-4 text-right">Total Harga</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        Tidak ada pesanan katering untuk filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* ID Pesanan */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                          #{order.id}
                        </td>

                        {/* Nama Pelanggan */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{order.customerName}</p>
                          <p className="text-[11px] text-slate-400">{order.customerPhone}</p>
                        </td>

                        {/* Alamat Pengiriman */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-semibold text-slate-800 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{order.customerAddress}</span>
                          </p>
                          {order.addressDetail && (
                            <p className="text-[11px] text-slate-400 pl-4.5 mt-0.5">
                              {order.addressDetail}
                            </p>
                          )}
                        </td>

                        {/* Paket & Menu */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">
                            {order.menuName || order.packageName}
                          </p>
                          <p className="text-[11px] text-emerald-700 font-medium">
                            {order.menuDetail || order.packageDetail}
                          </p>
                        </td>

                        {/* Jadwal Shift Antar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.deliveryBatch === 'Sore/Malam'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {order.deliveryBatch === 'Sore/Malam' ? (
                                <Sunset className="w-3 h-3" />
                              ) : (
                                <Sun className="w-3 h-3" />
                              )}
                              <span>{order.deliveryBatch}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              ({order.day || 'Senin'})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{order.deliverySchedule}</span>
                          </div>
                        </td>

                        {/* Total Harga */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-right">
                          <p>Rp {order.totalPrice.toLocaleString('id-ID')}</p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {order.paymentMethod || 'Bank Transfer'}
                          </p>
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                            >
                              Detail Pesanan
                            </Link>

                            <button
                              onClick={() => handleWhatsApp(order)}
                              title="Chat WhatsApp Pelanggan"
                              className="w-7 h-7 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer (Mencegah Long Scroll) */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Menampilkan <span className="font-bold text-slate-800">{paginatedOrders.length}</span> dari{' '}
              <span className="font-bold text-slate-800">{filteredOrders.length}</span> pesanan katering
            </div>

            <div className="flex items-center gap-1 self-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-md font-bold text-xs transition-colors ${
                    currentPage === page
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <NewOrderModal
          isOpen={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          onOrderCreated={handleOrderCreated}
        />

        <SuratJalanModal
          isOpen={isSuratJalanModalOpen}
          onClose={() => setIsSuratJalanModalOpen(false)}
          orders={filteredOrders}
          selectedDay={dayFilter === 'Semua Hari' ? 'Senin' : dayFilter}
          selectedBatch={batchFilter}
        />
      </div>
    </AdminLayout>
  );
}
