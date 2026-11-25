'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { CateringOrder } from '@/lib/data-store';
import {
  Calendar,
  Sun,
  Sunset,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Circle,
  Flame,
} from 'lucide-react';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

interface DeliverySlot {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  addressDetail?: string;
  menuName: string;
  menuDetail: string;
  batch: 'Pagi/Siang' | 'Sore/Malam';
  time: string;
  portions: number;
  courier: string;
  status: 'Antri' | 'Dimasak' | 'Siap Kirim' | 'Dikirim' | 'Terkirim';
  paymentStatus: string;
}

function mapOrderStatusToSlotStatus(
  status: string
): 'Antri' | 'Dimasak' | 'Siap Kirim' | 'Dikirim' | 'Terkirim' {
  switch (status) {
    case 'Diproses':
      return 'Dimasak';
    case 'Dikirim':
      return 'Dikirim';
    case 'Selesai':
      return 'Terkirim';
    default:
      return 'Antri';
  }
}

const statusColors: Record<string, string> = {
  Antri: 'bg-slate-100 text-slate-600',
  Dimasak: 'bg-amber-100 text-amber-700',
  'Siap Kirim': 'bg-sky-100 text-sky-700',
  Dikirim: 'bg-emerald-100 text-emerald-700',
  Terkirim: 'bg-emerald-800 text-white',
};

const statusIcon: Record<string, React.ReactNode> = {
  Antri: <Circle className="w-3 h-3" />,
  Dimasak: <Flame className="w-3 h-3" />,
  'Siap Kirim': <Package className="w-3 h-3" />,
  Dikirim: <Truck className="w-3 h-3" />,
  Terkirim: <CheckCircle className="w-3 h-3" />,
};

export default function AdminSchedulePage() {
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [batchFilter, setBatchFilter] = useState<'Semua' | 'Pagi/Siang' | 'Sore/Malam'>('Semua');
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPaidOrders() {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setOrders(json.data);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat jadwal pengiriman dari backend:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPaidOrders();
  }, []);

  // Kecualikan pesanan yang belum dibayar / dibatalkan / kedaluwarsa agar tidak masuk jadwal dapur
  const eligibleOrders = orders.filter(
    (o) =>
      o.status !== 'Menunggu Pembayaran' &&
      o.status !== 'Dibatalkan' &&
      (o.paymentStatus === 'Lunas' || o.paymentStatus === 'COD')
  );

  const slotsByDay: Record<string, DeliverySlot[]> = {};
  for (const d of DAYS) {
    slotsByDay[d] = [];
  }
  for (const o of eligibleOrders) {
    const targetDay = DAYS.includes(o.day || '') ? (o.day as string) : 'Senin';
    slotsByDay[targetDay].push({
      id: o.id,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      address: o.customerAddress,
      addressDetail: o.addressDetail,
      menuName: o.menuName || o.packageName,
      menuDetail: o.menuDetail || o.packageDetail,
      batch: o.deliveryBatch === 'Sore/Malam' ? 'Sore/Malam' : 'Pagi/Siang',
      time: o.deliverySchedule || '11:30 - 13:00 WIB',
      portions: o.portionsCount || 1,
      courier: o.courierName || 'Kurir NutriMeal',
      status: mapOrderStatusToSlotStatus(o.status),
      paymentStatus: o.paymentStatus || 'Lunas',
    });
  }

  const dayIndex = DAYS.indexOf(selectedDay);
  const daySlots = slotsByDay[selectedDay] || [];
  const slots = daySlots.filter(
    (s) => batchFilter === 'Semua' || s.batch === batchFilter
  );

  const siangSlots = daySlots.filter((s) => s.batch === 'Pagi/Siang');
  const soreSlots = daySlots.filter((s) => s.batch === 'Sore/Malam');

  const prevDay = () => setSelectedDay(DAYS[Math.max(0, dayIndex - 1)]);
  const nextDay = () => setSelectedDay(DAYS[Math.min(DAYS.length - 1, dayIndex + 1)]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-800" />
            <span>Jadwal Pengiriman Harian</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Menampilkan pesanan terverifikasi (Lunas / COD) per hari, batch pengiriman, dan status dapur.
          </p>
        </div>
      </div>

      {/* Day Navigator */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3">
        <div className="flex items-center justify-between gap-3">
          {/* Prev Arrow */}
          <button
            onClick={prevDay}
            disabled={dayIndex === 0}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          {/* Day Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 justify-center">
            {DAYS.map((day) => {
              const count = (slotsByDay[day] || []).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex flex-col items-center min-w-[60px] ${
                    selectedDay === day
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{day}</span>
                  <span
                    className={`text-[10px] font-semibold mt-0.5 ${
                      selectedDay === day ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {count} antar
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next Arrow */}
          <button
            onClick={nextDay}
            disabled={dayIndex === DAYS.length - 1}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Total Pengiriman</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{daySlots.length}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {selectedDay} • Terkonfirmasi Lunas/COD
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Batch Pagi/Siang</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{siangSlots.length}</p>
          <p className="text-[11px] text-sky-700 font-medium mt-0.5">11:30 - 13:00 WIB</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Batch Sore/Malam</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{soreSlots.length}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">17:00 - 18:30 WIB</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4">
          <p className="text-[11px] text-slate-500 font-semibold">Total Porsi</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {daySlots.reduce((acc, s) => acc + s.portions, 0)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Box akan disiapkan</p>
        </div>
      </div>

      {/* Batch Filter */}
      <div className="flex items-center gap-1.5">
        {(['Semua', 'Pagi/Siang', 'Sore/Malam'] as const).map((batch) => (
          <button
            key={batch}
            onClick={() => setBatchFilter(batch)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              batchFilter === batch
                ? 'bg-emerald-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {batch === 'Pagi/Siang' && <Sun className="w-3.5 h-3.5" />}
            {batch === 'Sore/Malam' && <Sunset className="w-3.5 h-3.5" />}
            {batch === 'Semua' && <Calendar className="w-3.5 h-3.5" />}
            <span>{batch}</span>
          </button>
        ))}
      </div>

      {/* Delivery Slots */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-xs text-slate-400">
          Memuat antrean jadwal pengiriman...
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">
            Tidak ada pengiriman terkonfirmasi hari {selectedDay}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {batchFilter !== 'Semua'
              ? `untuk batch ${batchFilter}`
              : 'Pesanan yang belum dibayar atau dibatalkan tidak dimasukkan ke jadwal.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 hover:shadow-md transition-shadow"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      slot.batch === 'Sore/Malam'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {slot.batch === 'Sore/Malam' ? (
                      <Sunset className="w-3 h-3" />
                    ) : (
                      <Sun className="w-3 h-3" />
                    )}
                    {slot.batch}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[slot.status]}`}
                  >
                    {statusIcon[slot.status]}
                    {slot.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {slot.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{slot.time}</span>
                </div>
              </div>

              {/* Customer */}
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-800 text-white text-xs font-black flex items-center justify-center shrink-0">
                  {slot.customerName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{slot.customerName}</p>
                  <p className="text-[11px] text-slate-400">
                    #{slot.id} • {slot.customerPhone}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-emerald-800">{slot.portions}x Porsi</p>
                </div>
              </div>

              {/* Menu */}
              <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <p className="font-bold text-slate-900">{slot.menuName}</p>
                <p className="text-slate-500 mt-0.5">{slot.menuDetail}</p>
              </div>

              {/* Address & Courier */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{slot.address}</span>
                    {slot.addressDetail && (
                      <span className="text-emerald-700 font-medium ml-1">• {slot.addressDetail}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">{slot.courier}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
