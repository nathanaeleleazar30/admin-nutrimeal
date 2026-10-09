'use client';

import React, { useState } from 'react';

interface WeeklySalesItem {
  day: string;
  diet: number;
  kantor: number;
  family: number;
  event: number;
  total: number;
}

export function WeeklySalesChart({ data }: { data?: WeeklySalesItem[] }) {
  const [activeTab, setActiveTab] = useState<'Mingguan' | 'Bulanan' | 'Kuartal'>('Mingguan');
  const [hoveredDay, setHoveredDay] = useState<WeeklySalesItem | null>(null);

  const chartData: WeeklySalesItem[] = data || [
    { day: 'Sen (18 Okt)', diet: 45, kantor: 35, family: 20, event: 10, total: 110 },
    { day: 'Sel (19 Okt)', diet: 55, kantor: 40, family: 25, event: 15, total: 135 },
    { day: 'Rab (20 Okt)', diet: 50, kantor: 42, family: 22, event: 12, total: 126 },
    { day: 'Kam (21 Okt - Hari ini)', diet: 65, kantor: 50, family: 30, event: 18, total: 163 },
    { day: 'Jum (22 Okt)', diet: 60, kantor: 48, family: 28, event: 14, total: 150 },
    { day: 'Sab (23 Okt)', diet: 40, kantor: 25, family: 35, event: 22, total: 122 },
    { day: 'Min (24 Okt)', diet: 35, kantor: 15, family: 40, event: 30, total: 120 },
  ];

  const maxTotal = Math.max(...chartData.map((d) => d.total));

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Laporan Ringkasan Penjualan Mingguan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi porsi pesanan berdasarkan kategori paket katering UMKM
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
            {(['Mingguan', 'Bulanan', 'Kuartal'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-800"></span>
            <span>Paket Sehat Diet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Paket Makan Siang Kantor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span>
            <span>Paket Family Mingguan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Prasmanan / Event</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="mt-8 pt-4 pb-2 border-b border-slate-100 relative">
        {/* Tooltip when hovered */}
        {hoveredDay && (
          <div className="absolute top-0 right-4 bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-[11px] z-10 pointer-events-none animate-fadeIn">
            <p className="font-bold text-emerald-300">{hoveredDay.day}</p>
            <div className="space-y-0.5 mt-1 text-slate-300">
              <p>Total: <b className="text-white">{hoveredDay.total} porsi</b></p>
              <p>Diet: {hoveredDay.diet} • Kantor: {hoveredDay.kantor}</p>
              <p>Family: {hoveredDay.family} • Event: {hoveredDay.event}</p>
            </div>
          </div>
        )}

        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-slate-400 w-full"></div>
          <div className="border-b border-dashed border-slate-400 w-full"></div>
          <div className="border-b border-dashed border-slate-400 w-full"></div>
        </div>

        {/* Stacked Columns */}
        <div className="flex items-end justify-between gap-2 h-52 relative z-0 px-2">
          {chartData.map((item, idx) => {
            const isToday = item.day.includes('Hari ini');
            const totalHeightPercent = (item.total / maxTotal) * 100;

            const dietPercent = (item.diet / item.total) * 100;
            const kantorPercent = (item.kantor / item.total) * 100;
            const familyPercent = (item.family / item.total) * 100;
            const eventPercent = (item.event / item.total) * 100;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredDay(item)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Column Bar Container */}
                <div
                  className={`w-full max-w-[36px] rounded-t-md overflow-hidden flex flex-col-reverse transition-all duration-300 ${
                    isToday
                      ? 'ring-2 ring-emerald-500 ring-offset-2 shadow-md'
                      : 'hover:brightness-105'
                  }`}
                  style={{ height: `${totalHeightPercent}%` }}
                >
                  {/* Prasmanan / Event (bottom) */}
                  <div
                    style={{ height: `${eventPercent}%` }}
                    className="bg-slate-500 w-full"
                    title={`Event: ${item.event}`}
                  />
                  {/* Family */}
                  <div
                    style={{ height: `${familyPercent}%` }}
                    className="bg-amber-700 w-full"
                    title={`Family: ${item.family}`}
                  />
                  {/* Kantor */}
                  <div
                    style={{ height: `${kantorPercent}%` }}
                    className="bg-emerald-600 w-full"
                    title={`Kantor: ${item.kantor}`}
                  />
                  {/* Diet (top) */}
                  <div
                    style={{ height: `${dietPercent}%` }}
                    className="bg-emerald-800 w-full"
                    title={`Diet: ${item.diet}`}
                  />
                </div>

                {/* Day Label */}
                <div className="mt-3 text-center">
                  <span
                    className={`block text-[10px] leading-tight ${
                      isToday
                        ? 'font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.day.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    {item.day.includes('(') ? item.day.split('(')[1].replace(')', '') : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
