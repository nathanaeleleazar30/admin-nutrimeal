import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/60 p-6 flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-200 rounded-md"></div>
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-lg"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-8 w-36 bg-slate-300 rounded-lg"></div>
            <div className="h-3 w-28 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="h-5 w-32 bg-slate-200 rounded"></div>
          <div className="h-48 w-full bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
