'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import {
  Bell,
  Package,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Star,
  X,
  Filter,
  Trash2,
  BellOff,
} from 'lucide-react';


type NotifCategory = 'Semua' | 'Pesanan' | 'Pengiriman' | 'Sistem' | 'Promo';

interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'system' | 'promo' | 'review';
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  category: NotifCategory;
  actionLabel?: string;
  actionHref?: string;
}

const initialNotifications: Notification[] = [
  {
    id: 'n-1',
    type: 'order',
    title: 'Pesanan Baru Masuk',
    body: 'Rian Kusuma memesan Grilled Chicken + Salad Brokoli (1 Porsi) — Shift Pagi/Siang Senin.',
    time: '5 menit lalu',
    isRead: false,
    category: 'Pesanan',
    actionLabel: 'Lihat Pesanan',
    actionHref: '/admin/orders',
  },
  {
    id: 'n-2',
    type: 'order',
    title: 'Pesanan Korporat Masuk',
    body: 'PT Digita Kreasi Nusa (Amanda Putri) memesan Paket Makan Siang Kantor 15 Box untuk Selasa.',
    time: '12 menit lalu',
    isRead: false,
    category: 'Pesanan',
    actionLabel: 'Lihat Detail',
    actionHref: '/admin/orders',
  },
  {
    id: 'n-3',
    type: 'delivery',
    title: 'Batch Pagi/Siang Selesai Terkirim',
    body: '96 box katering berhasil diantar oleh Budi Santoso - Motor 01. Semua pelanggan shift siang telah terlayani.',
    time: '1 jam lalu',
    isRead: false,
    category: 'Pengiriman',
    actionLabel: 'Lihat Jadwal',
    actionHref: '/admin/schedule',
  },
  {
    id: 'n-4',
    type: 'system',
    title: 'Konfirmasi Batch Sore Diperlukan',
    body: 'Kuantitas stok ayam fillet untuk batch sore/malam perlu dikonfirmasi sebelum pukul 15:00 WIB hari ini.',
    time: '2 jam lalu',
    isRead: true,
    category: 'Sistem',
  },
  {
    id: 'n-5',
    type: 'review',
    title: 'Review Baru dari Pelanggan',
    body: 'Kevin Tan memberikan rating ⭐⭐⭐⭐⭐ untuk Grilled Chicken. Komentar: "Rasanya enak dan pengiriman tepat waktu!"',
    time: '3 jam lalu',
    isRead: true,
    category: 'Promo',
  },
  {
    id: 'n-6',
    type: 'order',
    title: 'Pesanan Jeda (Pause) Diterima',
    body: 'Dimas Pratama menjeda langganan Paket Diet Sehat Mingguan untuk hari Rabu. Porsi dikembalikan ke stok.',
    time: '4 jam lalu',
    isRead: true,
    category: 'Pesanan',
  },
  {
    id: 'n-7',
    type: 'delivery',
    title: 'Perpanjangan Langganan Otomatis',
    body: 'Citra Kirana (PT Maju Bersama) berhasil perpanjang Paket Prasmanan Rapat untuk bulan depan — Rp 48.500.000.',
    time: '5 jam lalu',
    isRead: true,
    category: 'Pengiriman',
  },
  {
    id: 'n-8',
    type: 'system',
    title: 'Laporan Mingguan Siap',
    body: 'Rekap laporan penjualan mingguan (Okt W3) telah tersedia. Total omset Rp 18.500.000 dengan 1.428 porsi terdistribusi.',
    time: '1 hari lalu',
    isRead: true,
    category: 'Sistem',
    actionLabel: 'Lihat Laporan',
    actionHref: '/admin/reports',
  },
];

const categoryFilters: NotifCategory[] = ['Semua', 'Pesanan', 'Pengiriman', 'Sistem', 'Promo'];

const typeIcon: Record<string, React.ReactNode> = {
  order: <Package className="w-4 h-4 text-emerald-600" />,
  delivery: <CheckCircle2 className="w-4 h-4 text-sky-600" />,
  system: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  promo: <Star className="w-4 h-4 text-purple-600" />,
  review: <Star className="w-4 h-4 text-yellow-500" />,
};

const typeBg: Record<string, string> = {
  order: 'bg-emerald-50',
  delivery: 'bg-sky-50',
  system: 'bg-amber-50',
  promo: 'bg-purple-50',
  review: 'bg-yellow-50',
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [categoryFilter, setCategoryFilter] = useState<NotifCategory>('Semua');

  const filtered = notifications.filter(
    (n) => categoryFilter === 'Semua' || n.category === categoryFilter
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-800" />
            <span>Notifikasi & Pemberitahuan</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                {unreadCount} Baru
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau pesanan baru masuk, status pengiriman batch, konfirmasi sistem, dan ulasan pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {categoryFilters.map((cat) => {
          const count =
            cat === 'Semua'
              ? notifications.length
              : notifications.filter((n) => n.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                categoryFilter === cat
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  categoryFilter === cat ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BellOff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Tidak ada notifikasi</p>
            <p className="text-xs text-slate-400 mt-1">
              Semua pemberitahuan untuk kategori ini sudah dibaca atau dihapus.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                className={`px-5 py-4 flex items-start gap-3.5 transition-colors hover:bg-slate-50/60 ${
                  !notif.isRead ? 'bg-emerald-50/30' : ''
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${typeBg[notif.type]}`}
                >
                  {typeIcon[notif.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          !notif.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {notif.title}
                        {!notif.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-emerald-500 align-middle" />
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.body}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={() => markRead(notif.id)}
                          title="Tandai dibaca"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotif(notif.id)}
                        title="Hapus notifikasi"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-slate-400">{notif.time}</span>
                    {notif.actionLabel && notif.actionHref && (
                      <a
                        href={notif.actionHref}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        {notif.actionLabel} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="text-center text-xs text-slate-400 pb-2">
        Menampilkan <span className="font-semibold text-slate-600">{filtered.length}</span> notifikasi •{' '}
        <span className="font-semibold text-emerald-700">{unreadCount} belum dibaca</span>
      </div>
    </AdminLayout>
  );
}
