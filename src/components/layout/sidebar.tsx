'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Leaf,
  LogOut,
} from 'lucide-react';

const mainMenuItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Kelola Menu',
    href: '/admin/menu',
    icon: UtensilsCrossed,
  },
  {
    name: 'Kelola Pesanan',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    name: 'Data Pelanggan',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Laporan Penjualan',
    href: '/admin/reports',
    icon: BarChart3,
  },
];

const systemMenuItems = [
  {
    name: 'Pengaturan Katering',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Leaf className="w-5 h-5 fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-lg text-emerald-800 tracking-tight">Nutri</span>
            <span className="font-extrabold text-lg text-slate-800 tracking-tight">Meal</span>
          </div>
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
            Mitra Katering UMKM
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Menu Utama */}
        <div>
          <h2 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Menu Utama
          </h2>
          <nav className="space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sistem */}
        <div>
          <h2 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Sistem
          </h2>
          <nav className="space-y-1">
            {systemMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile or Status */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <Link
          href="/admin/login"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Server API Aktif</span>
          </div>
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>
    </aside>
  );
}
