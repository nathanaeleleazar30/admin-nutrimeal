'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MonthlyPerformance {
  month: string;
  fullName: string;
  portions: number;
  revenueDisplay: string;
  heightPercent: number; // 0 to 100
}

const monthsData: MonthlyPerformance[] = [
  { month: 'Mei', fullName: 'Mei 2025', portions: 260, revenueDisplay: 'Rp 17.5 Jt', heightPercent: 50 },
  { month: 'Jun', fullName: 'Juni 2025', portions: 180, revenueDisplay: 'Rp 12.2 Jt', heightPercent: 35 },
  { month: 'Jul', fullName: 'Juli 2025', portions: 140, revenueDisplay: 'Rp 9.8 Jt', heightPercent: 28 },
  { month: 'Agu', fullName: 'Oktober 2025', portions: 480, revenueDisplay: 'Rp 32.8 Jt', heightPercent: 82 },
  { month: 'Sep', fullName: 'September 2025', portions: 120, revenueDisplay: 'Rp 8.4 Jt', heightPercent: 25 },
  { month: 'Okt', fullName: 'Oktober 2025', portions: 220, revenueDisplay: 'Rp 15.1 Jt', heightPercent: 44 },
  { month: 'Nov', fullName: 'November 2025', portions: 410, revenueDisplay: 'Rp 28.5 Jt', heightPercent: 74 },
  { month: 'Des', fullName: 'Desember 2025', portions: 170, revenueDisplay: 'Rp 11.6 Jt', heightPercent: 33 },
];

export function SalesDistributionChart() {
  const [selectedPeriod, setSelectedPeriod] = useState('Minggu Ini');
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(3); // 'Agu' active as in reference image

  const yLabels = ['40k', '30k', '20k', '10k', '5k', '0k'];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Performa Penjualan & Distribusi Porsi
        </h2>

        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:ring-1 focus:ring-emerald-700 cursor-pointer shadow-2xs"
          >
            <option value="Minggu Ini">Minggu Ini</option>
            <option value="Bulan Ini">Bulan Ini</option>
            <option value="Tahun Ini">Tahun Ini</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Main Chart Canvas with Y-Axis and Bars */}
      <div className="relative pt-16 pb-2">
        <div className="flex items-end gap-3 sm:gap-6 h-60">
          {/* Y-Axis scale */}
          <div className="flex flex-col justify-between h-full text-[11px] text-slate-400 font-medium pb-6 select-none shrink-0 w-6">
            {yLabels.map((lbl) => (
              <span key={lbl}>{lbl}</span>
            ))}
          </div>

          {/* Bars Container */}
          <div className="flex-1 flex items-end justify-between h-full gap-2 sm:gap-4 relative pb-6 border-b border-slate-100">
            {/* Background subtle grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 opacity-40">
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
            </div>

            {monthsData.map((item, idx) => {
              const isActive = activeMonthIdx === idx;

              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                  onClick={() => setActiveMonthIdx(idx)}
                >
                  {/* Floating Tooltip above active bar */}
                  {isActive && (
                    <div className="absolute -top-16 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-3 min-w-[135px] text-left">
                        <p className="font-bold text-slate-900 text-xs mb-1">
                          {item.fullName}
                        </p>
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>Total Porsi:</span>
                            <span className="font-bold text-slate-900 ml-auto">{item.portions}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Omset:</span>
                            <span className="font-bold text-emerald-700 ml-auto">{item.revenueDisplay}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* The Rounded Pill Bar */}
                  <div className="w-full max-w-[44px] flex items-end justify-center h-full">
                    <div
                      style={{
                        height: `${item.heightPercent}%`,
                        ...(isActive
                          ? {
                              backgroundImage: `repeating-linear-gradient(
                                45deg,
                                #10b981,
                                #10b981 8px,
                                #059669 8px,
                                #059669 16px
                              )`,
                            }
                          : {}),
                      }}
                      className={`w-full rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                          : 'bg-slate-100/90 hover:bg-slate-200/90'
                      }`}
                    />
                  </div>

                  {/* X-Axis Month Label */}
                  <span
                    className={`absolute -bottom-6 text-xs transition-colors ${
                      isActive
                        ? 'font-bold text-slate-900'
                        : 'font-medium text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
