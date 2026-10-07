'use client';

import React, { useState } from 'react';
import { CateringOrder, OrderStatus } from '@/lib/data-store';
import { Clock, Eye, CheckCircle2, ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react';

interface OrdersTableProps {
  initialOrders?: CateringOrder[];
  onSelectOrder?: (order: CateringOrder) => void;
}

export function OrdersTable({ initialOrders, onSelectOrder }: OrdersTableProps) {
  const [orders, setOrders] = useState<CateringOrder[]>(
    initialOrders || [
      {
        id: 'ORD-1042',
        customerName: 'Dimas Pratama',
        customerPhone: '0812-8890-1122',
        customerAddress: 'Jl. Soekarno Hatta No. 45, Lowokwaru, Malang',
        customerType: 'Personal',
        packageName: 'Paket Diet Sehat Mingguan',
        packageDetail: '10 Porsi (Makan Siang & Malam)',
        deliverySchedule: 'Siang (11:30 WIB)',
        deliveryBatch: 'Pagi/Siang',
        status: 'Dikirim',
        totalPrice: 350000,
        createdAt: '2024-10-24T10:15:00Z',
      },
      {
        id: 'ORD-1043',
        customerName: 'Amanda Putri',
        customerPhone: '0858-7702-9901',
        customerAddress: 'Gedung Graha Pena Lt. 4, Jl. Ahmad Yani, Malang',
        customerType: 'Korporat / Kantor',
        packageName: 'Paket Makan Siang Kantor',
        packageDetail: '15 Box Prasmanan Mini',
        deliverySchedule: 'Siang (11:45 WIB)',
        deliveryBatch: 'Pagi/Siang',
        status: 'Diproses',
        totalPrice: 525000,
        createdAt: '2024-10-24T10:30:00Z',
      },
      {
        id: 'ORD-1044',
        customerName: 'Dr. Rio Wicaksono',
        customerPhone: '0819-3331-4455',
        customerAddress: 'Perumahan Permata Jingga Blok D-12, Malang',
        customerType: 'Keluarga',
        packageName: 'Paket Family 5 Hari',
        packageDetail: 'Lengkap 4 Porsi Keluarga',
        deliverySchedule: 'Sore (16:30 WIB)',
        deliveryBatch: 'Sore/Malam',
        status: 'Diterima',
        totalPrice: 680000,
        createdAt: '2024-10-24T11:00:00Z',
      },
      {
        id: 'ORD-1045',
        customerName: 'PT Maju Bersama (Citra)',
        customerPhone: '0821-6577-8898',
        customerAddress: 'Kawasan Industri Rungkut / Arjosari Malang',
        customerType: 'Korporat / Kantor',
        packageName: 'Prasmanan Rapat Kantor',
        packageDetail: '25 Porsi Buffet Set',
        deliverySchedule: 'Siang (12:00 WIB)',
        deliveryBatch: 'Pagi/Siang',
        status: 'Selesai',
        totalPrice: 1125000,
        createdAt: '2024-10-24T08:00:00Z',
      },
      {
        id: 'ORD-1046',
        customerName: 'Kevin Tan',
        customerPhone: '0877-6411-2233',
        customerAddress: 'Apartemen Begawan Lt. 12 No. 04, Malang',
        customerType: 'Personal',
        packageName: 'Paket Diet Sehat Mingguan',
        packageDetail: '5 Porsi Makan Siang',
        deliverySchedule: 'Siang (11:30 WIB)',
        deliveryBatch: 'Pagi/Siang',
        status: 'Dikirim',
        totalPrice: 185000,
        createdAt: '2024-10-24T09:40:00Z',
      },
    ]
  );

  const [activeTab, setActiveTab] = useState<'Semua' | OrderStatus>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);

  const filterTabs: Array<'Semua' | OrderStatus> = [
    'Semua',
    'Diterima',
    'Diproses',
    'Dikirim',
    'Selesai',
  ];

  const filteredOrders =
    activeTab === 'Semua'
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      // Local optimistic update fallback
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } finally {
      setStatusMenuOpen(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Diterima':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Diterima
          </span>
        );
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Diproses
          </span>
        );
      case 'Dikirim':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            Dikirim
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Selesai
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Daftar Pesanan Katering Terbaru
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pesanan masuk dan status pemenuhan katering harian
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium self-start md:self-auto overflow-x-auto max-w-full">
          {filterTabs.map((tab) => {
            const count =
              tab === 'Semua'
                ? orders.length
                : orders.filter((o) => o.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'Semua' ? `Semua (142)` : tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">ID Pesanan</th>
              <th className="py-3 px-4">Nama Pelanggan</th>
              <th className="py-3 px-4">Menu & Porsi</th>
              <th className="py-3 px-4">Jadwal Antar</th>
              <th className="py-3 px-4">Status Pesanan</th>
              <th className="py-3 px-4 text-right">Total Harga</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Tidak ada pesanan dengan status {activeTab}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                    #{order.id}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{order.customerName}</p>
                    <p className="text-[11px] text-slate-400">{order.customerPhone}</p>
                  </td>

                  {/* Menu & Porsi */}
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{order.menuName || order.packageName}</p>
                    <p className="text-[11px] text-emerald-700">{order.menuDetail || order.packageDetail}</p>
                  </td>

                  {/* Schedule */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.deliverySchedule}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setStatusMenuOpen(statusMenuOpen === order.id ? null : order.id)
                        }
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                        title="Klik untuk ubah status pesanan"
                      >
                        {getStatusBadge(order.status)}
                      </button>

                      {/* Dropdown status changer */}
                      {statusMenuOpen === order.id && (
                        <div className="absolute left-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-20">
                          {(['Diterima', 'Diproses', 'Dikirim', 'Selesai'] as OrderStatus[]).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateStatus(order.id, st)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${
                                  order.status === st ? 'text-emerald-700 font-bold' : 'text-slate-600'
                                }`}
                              >
                                <span>{st}</span>
                                {order.status === st && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-right">
                    Rp {order.totalPrice.toLocaleString('id-ID')}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectOrder?.(order)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Lihat Detail Pesanan"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Menampilkan <span className="font-bold text-slate-800">5</span> dari{' '}
          <span className="font-bold text-slate-800">142</span> pesanan katering
        </div>

        <div className="flex items-center gap-1 self-center">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 rounded-md font-medium text-xs transition-colors ${
                currentPage === page
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          <span className="px-1 text-slate-400">...</span>
          <button
            onClick={() => setCurrentPage(29)}
            className={`w-7 h-7 rounded-md font-medium text-xs transition-colors ${
              currentPage === 29
                ? 'bg-emerald-800 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            29
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(29, currentPage + 1))}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
