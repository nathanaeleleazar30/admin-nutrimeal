'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Package,
  Menu,
} from 'lucide-react';

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pesanan katering, nama pelanggan, menu..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-full text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Date Chip, Notification, User Profile */}
      <div className="flex items-center gap-3">
        {/* Date Chip */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Hari ini : <span className="font-semibold text-slate-900">24 Okt, 2024</span></span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-900">Notifikasi Katering</span>
                <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                  3 Baru
                </span>
              </div>
              <div className="divide-y divide-slate-100 mt-2 max-h-60 overflow-y-auto">
                <div className="py-2 flex items-start gap-2.5">
                  <Package className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">Pesanan baru #ORD-1047</p>
                    <p className="text-[11px] text-slate-500">Rina Salsabila - Paket Diet Harian</p>
                    <span className="text-[10px] text-slate-400">5 menit yang lalu</span>
                  </div>
                </div>
                <div className="py-2 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">Batch Pagi/Siang Selesai</p>
                    <p className="text-[11px] text-slate-500">96 box sukses diantar kurir katering</p>
                    <span className="text-[10px] text-slate-400">1 jam yang lalu</span>
                  </div>
                </div>
                <div className="py-2 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">Cek Bahan Baku Siang</p>
                    <p className="text-[11px] text-slate-500">Konfirmasi batch sore sebelum jam 15:00</p>
                    <span className="text-[10px] text-slate-400">2 jam yang lalu</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xs font-bold text-emerald-800 overflow-hidden">
              <span className="select-none">SS</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">Siti Saroh</p>
              <p className="text-[10px] text-slate-500">Admin Katering UMKM</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 text-xs z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">Siti Saroh</p>
                <p className="text-[10px] text-slate-500">siti.admin@nutrimeal.id</p>
              </div>
              <Link
                href="/admin/settings"
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 block transition-colors"
              >
                Pengaturan Katering
              </Link>
              <Link
                href="/admin/login"
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 block transition-colors"
              >
                Keluar (Logout)
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
