'use client';

import React from 'react';
import { Truck, CheckCircle2, Clock } from 'lucide-react';

interface BatchInfo {
  title?: string;
  countText?: string;
  status?: string;
}

interface DeliveryBatchesProps {
  batches?: {
    morning?: BatchInfo;
    evening?: BatchInfo;
  };
}

export function DeliveryBatches({ batches }: DeliveryBatchesProps) {
  const morningText = batches?.morning?.countText || '0 Box Terkonfirmasi';
  const morningStatus = batches?.morning?.status || 'Siap';
  const eveningText = batches?.evening?.countText || '0 Box Terkonfirmasi';
  const eveningStatus = batches?.evening?.status || 'Siap';

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-800" />
          <h2 className="text-sm font-bold text-slate-900">
            Jadwal Pengiriman Katering
          </h2>
        </div>
        <span className="text-[10px] font-bold text-white bg-emerald-800 px-2 py-0.5 rounded-sm">
          HARI INI
        </span>
      </div>

      <div className="space-y-2.5">
        {/* Batch Pagi/Siang */}
        <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Batch Pagi / Siang</p>
              <p className="text-[11px] text-slate-500">{morningText}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            {morningStatus}
          </span>
        </div>

        {/* Batch Sore/Malam */}
        <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Batch Sore / Malam</p>
              <p className="text-[11px] text-slate-500">{eveningText}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
            {eveningStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
