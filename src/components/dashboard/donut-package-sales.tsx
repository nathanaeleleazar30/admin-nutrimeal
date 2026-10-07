'use client';

import React from 'react';

interface DonutCategory {
  name: string;
  percent: number;
  portions: number;
  color: string;
}

export function DonutPackageSales({
  totalPortions = 1428,
  categories,
}: {
  totalPortions?: number;
  categories?: DonutCategory[];
}) {
  const items: DonutCategory[] = categories || [
    { name: 'Grilled Chicken Brokoli', percent: 42, portions: 600, color: '#047857' },
    { name: 'Pepes Tongkol Rempah', percent: 31, portions: 443, color: '#059669' },
    { name: 'Chicken Salad Wijen', percent: 18, portions: 257, color: '#b45309' },
    { name: 'Beef Veggie Teriyaki', percent: 9, portions: 128, color: '#0284c7' },
  ];

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">
          Menu Terlaris Pilihan Keranjang
        </h2>
        <span className="text-[11px] text-slate-400">Bulan Ini</span>
      </div>

      {/* SVG Donut Chart */}
      <div className="flex justify-center my-3">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {items.map((cat, idx) => {
              const strokeDasharray = `${(cat.percent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (cat.percent / 100) * circumference;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-85"
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {totalPortions.toLocaleString('id-ID')}
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider">
              PORSI LAKU
            </span>
          </div>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
        {items.map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium text-slate-700">{cat.name}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span>{cat.percent}%</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({cat.portions} porsi)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
