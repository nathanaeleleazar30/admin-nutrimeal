'use client';

import React from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const actions = [
  {
    title: 'Kelola Menu',
    subtitle: 'Galeri Makanan, Nilai Gizi & Jadwal Masak',
    href: '/admin/menu',
    icon: UtensilsCrossed,
    color: 'bg-emerald-700 text-white',
  },
  {
    title: 'Daftar Menu Sehat',
    subtitle: 'Katalog Menu yang Dipilih Pelanggan di Keranjang',
    href: '/admin/menu',
    icon: UtensilsCrossed,
    color: 'bg-teal-700 text-white',
  },
  {
    title: 'Kelola Pesanan',
    subtitle: 'Daftar Antrean & Konfirmasi Pengiriman',
    href: '/admin/orders',
    icon: ShoppingBag,
    color: 'bg-cyan-700 text-white',
  },
  {
    title: 'Data Pelanggan',
    subtitle: 'Profil & Riwayat Pesanan Pelanggan',
    href: '/admin/customers',
    icon: Users,
    color: 'bg-amber-700 text-white',
  },
  {
    title: 'Laporan Penjualan',
    subtitle: 'Rekap Omset & Laporan Penjualan Bulanan',
    href: '/admin/reports',
    icon: BarChart3,
    color: 'bg-indigo-700 text-white',
  },
];

export function QuickActions() {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-4 rounded-full bg-emerald-700"></div>
          <h2 className="text-sm font-bold text-slate-800">
            Akses Cepat Fitur Katering
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          Perluasan Menu Utama UMKM
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className="group p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-9 h-9 rounded-lg ${act.color} flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {act.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {act.subtitle}
                </p>
              </div>
              <div className="mt-3 flex items-center text-[11px] font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Buka</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
