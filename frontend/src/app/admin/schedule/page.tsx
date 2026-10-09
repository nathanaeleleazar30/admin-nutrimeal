'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
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
  User,
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
  calories: number;
  courier: string;
  status: 'Antri' | 'Dimasak' | 'Siap Kirim' | 'Dikirim' | 'Terkirim';
}

const weeklySchedule: Record<string, DeliverySlot[]> = {
  Senin: [
    {
      id: 's-1',
      customerName: 'Rian Kusuma',
      customerPhone: '+62 812-4491-0021',
      address: 'Sudirman Tower Lt. 12, Unit 1205',
      addressDetail: 'Jakarta Selatan • Titip Resepsionis',
      menuName: 'Grilled Chicken + Salad Brokoli',
      menuDetail: 'Nasi Merah Organik • Less Oil',
      batch: 'Pagi/Siang',
      time: '11:30 - 13:00 WIB',
      portions: 1,
      calories: 450,
      courier: 'Budi Santoso - Motor 01',
      status: 'Terkirim',
    },
    {
      id: 's-2',
      customerName: 'Amanda Wijaya',
      customerPhone: '+62 821-9980-1123',
      address: 'SCBD Suites Tower 2, Unit 08A',
      addressDetail: 'Jakarta Pusat • Diantar ke Lobby',
      menuName: 'Grilled Chicken + Salad Brokoli',
      menuDetail: 'Nasi Merah Organik • Less Oil',
      batch: 'Pagi/Siang',
      time: '11:30 - 13:00 WIB',
      portions: 2,
      calories: 450,
      courier: 'Budi Santoso - Motor 01',
      status: 'Terkirim',
    },
    {
      id: 's-3',
      customerName: 'Anita Wijaya',
      customerPhone: '+62 811-2300-881',
      address: 'Perumahan Kemang Pratama 3 Blok F No. 12',
      addressDetail: 'Bekasi Selatan • Diterima ART',
      menuName: 'Dada Ayam Panggang Wortel Serut',
      menuDetail: 'Kukus Labu Siam & Jagung',
      batch: 'Sore/Malam',
      time: '17:00 - 18:30 WIB',
      portions: 1,
      calories: 380,
      courier: 'Ahmad Fauzi - Motor 02',
      status: 'Dikirim',
    },
    {
      id: 's-4',
      customerName: 'dr. Hendra Salim',
      customerPhone: '+62 856-1109-3321',
      address: 'Pondok Indah Golf Apartment Tower 1 Unit 15C',
      addressDetail: 'Jakarta Selatan • Khusus Medical Diet',
      menuName: 'Dada Ayam Panggang Wortel Serut',
      menuDetail: 'Kukus Labu Siam & Jagung - Low Sodium',
      batch: 'Sore/Malam',
      time: '17:00 - 18:30 WIB',
      portions: 2,
      calories: 350,
      courier: 'Ahmad Fauzi - Motor 02',
      status: 'Dikirim',
    },
  ],
  Selasa: [
    {
      id: 's-5',
      customerName: 'Jessica Natalie',
      customerPhone: '+62 818-0922-3114',
      address: 'Apartemen Cosmo Park Thamrin City Lt. 10',
      addressDetail: 'Jakarta Pusat • Titip Security Lobby',
      menuName: 'Pepes Tongkol Bumbu Kuning',
      menuDetail: 'Nasi Merah Organik + Sayur Asem Bening',
      batch: 'Pagi/Siang',
      time: '11:30 - 13:00 WIB',
      portions: 1,
      calories: 380,
      courier: 'Budi Santoso - Motor 01',
      status: 'Siap Kirim',
    },
    {
      id: 's-6',
      customerName: 'Dimas Wicaksono',
      customerPhone: '+62 812-7788-9900',
      address: 'Wisma Nusantara Lt. 18, Jl. MH Thamrin',
      addressDetail: 'Jakarta Pusat • Security Pintu Selatan',
      menuName: 'Beef Teriyaki Rendah Lemak + Brokoli',
      menuDetail: 'Nasi Shirataki & Tumis Jagung Manis',
      batch: 'Pagi/Siang',
      time: '11:30 - 13:00 WIB',
      portions: 5,
      calories: 520,
      courier: 'Budi Santoso - Motor 01',
      status: 'Dimasak',
    },
  ],
  Rabu: [
    {
      id: 's-7',
      customerName: 'Dimas Pratama',
      customerPhone: '0812-8890-1122',
      address: 'Jl. Soekarno Hatta No. 45, Lowokwaru, Malang',
      menuName: 'Chicken Salad Wijen Sangrai',
      menuDetail: 'Romaine Lettuce • Olive Oil Dressing',
      batch: 'Pagi/Siang',
      time: '11:30 - 13:00 WIB',
      portions: 1,
      calories: 320,
      courier: 'Budi Santoso - Motor 01',
      status: 'Antri',
    },
  ],
  Kamis: [
    {
      id: 's-8',
      customerName: 'Kevin Tan',
      customerPhone: '0877-6411-2233',
      address: 'Apartemen Begawan Lt. 12 No. 04, Malang',
      menuName: 'Beef Teriyaki Rendah Lemak + Brokoli',
      menuDetail: 'Nasi Merah • Brokoli Kukus',
      batch: 'Pagi/Siang',
      time: '11:30 - 13:00 WIB',
      portions: 1,
      calories: 520,
      courier: 'Ahmad Fauzi - Motor 02',
      status: 'Antri',
    },
  ],
  Jumat: [
    {
      id: 's-9',
      customerName: 'Amanda Putri (PT Digita)',
      customerPhone: '0858-7702-9901',
      address: 'Gedung Graha Pena Lt. 4, Jl. Ahmad Yani, Malang',
      menuName: 'Ayam Bowl',
      menuDetail: 'Suwir Ayam • Jagung Manis • Edamame',
      batch: 'Pagi/Siang',
      time: '11:30 - 13:00 WIB',
      portions: 10,
      calories: 520,
      courier: 'Budi Santoso - Motor 01',
      status: 'Antri',
    },
  ],
  Sabtu: [
    {
      id: 's-10',
      customerName: 'Citra Kirana (PT Maju)',
      customerPhone: '0821-6577-8898',
      address: 'Kawasan Industri Arjosari Malang',
      menuName: 'Chicken Wrap Bayam',
      menuDetail: 'Tortilla Bayam • Ayam Panggang • Saus Yoghurt',
      batch: 'Pagi/Siang',
      time: '11:30 - 13:00 WIB',
      portions: 25,
      calories: 350,
      courier: 'Budi Santoso - Motor 01',
      status: 'Antri',
    },
  ],
};

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

  const dayIndex = DAYS.indexOf(selectedDay);
  const slots = (weeklySchedule[selectedDay] || []).filter(
    (s) => batchFilter === 'Semua' || s.batch === batchFilter
  );

  const siangSlots = (weeklySchedule[selectedDay] || []).filter((s) => s.batch === 'Pagi/Siang');
  const soreSlots = (weeklySchedule[selectedDay] || []).filter((s) => s.batch === 'Sore/Malam');
  const totalPortions = slots.reduce((acc, s) => acc + s.portions, 0);

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
            Pantau slot pengiriman per hari, status masak dapur, dan tracking kurir per batch.
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
              const count = (weeklySchedule[day] || []).length;
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
          <p className="text-2xl font-black text-slate-900 mt-1">
            {(weeklySchedule[selectedDay] || []).length}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {selectedDay} • Semua Batch
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
            {(weeklySchedule[selectedDay] || []).reduce((acc, s) => acc + s.portions, 0)}
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
      {slots.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">
            Tidak ada pengiriman hari {selectedDay}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {batchFilter !== 'Semua' && `untuk batch ${batchFilter}`}
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
                  <p className="text-[11px] text-slate-400">{slot.customerPhone}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-emerald-800">{slot.portions}x Porsi</p>
                  <p className="text-[10px] text-slate-400">{slot.calories} kkal/porsi</p>
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
