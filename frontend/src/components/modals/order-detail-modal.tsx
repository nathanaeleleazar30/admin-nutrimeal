'use client';

import React from 'react';
import { CateringOrder, OrderStatus } from '@/lib/data-store';
import {
  X,
  Clock,
  MapPin,
  Phone,
  User,
  Package,
  Calendar,
  CheckCircle2,
  Printer,
} from 'lucide-react';

interface OrderDetailModalProps {
  order: CateringOrder | null;
  onClose: () => void;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
}

const statusSteps: OrderStatus[] = ['Diterima', 'Diproses', 'Dikirim', 'Selesai'];

export function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: OrderDetailModalProps) {
  if (!order) return null;

  const currentStepIdx = statusSteps.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-800 text-sm">
                #{order.id}
              </span>
              <span className="text-xs bg-emerald-100/70 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                {order.customerType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Detail Pesanan Katering Harian</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Stepper */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Status Alur Pesanan
          </p>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-3 right-3 top-3 h-0.5 bg-slate-200 -z-0"></div>
            {statusSteps.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 shadow-xs'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPastOrCurrent && !isCurrent ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-medium ${
                      isCurrent
                        ? 'font-bold text-emerald-800'
                        : isPastOrCurrent
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          {/* Customer Info */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <User className="w-4 h-4 text-emerald-800" />
              <span>Informasi Pelanggan</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="text-[11px] text-slate-400 block">Nama:</span>
                <span className="font-semibold text-slate-900">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Telepon / WA:</span>
                <span className="font-semibold text-slate-900">{order.customerPhone}</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Alamat Pengiriman:</span>
              <p className="text-slate-700 font-medium mt-0.5 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{order.customerAddress}</span>
              </p>
            </div>
          </div>

          {/* Menu Details */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Package className="w-4 h-4 text-emerald-800" />
              <span>Menu Pilihan & Jadwal</span>
            </div>
            <div className="space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Menu Sehat:</span>
                <span className="font-bold text-slate-900">{order.menuName || order.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Porsi & Racikan:</span>
                <span className="text-emerald-700 font-semibold">{order.menuDetail || order.packageDetail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Antar:</span>
                <span className="font-medium text-slate-800">{order.deliverySchedule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shift Batch:</span>
                <span className="font-medium text-slate-800">{order.deliveryBatch}</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
            <span className="font-bold text-slate-700">Total Tagihan Pesanan:</span>
            <span className="text-base font-black text-emerald-800">
              Rp {order.totalPrice.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Fast Status Action Buttons */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              UBAH STATUS PESANAN:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {statusSteps.map((st) => (
                <button
                  key={st}
                  onClick={() => onStatusChange?.(order.id, st)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    order.status === st
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Resi</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
