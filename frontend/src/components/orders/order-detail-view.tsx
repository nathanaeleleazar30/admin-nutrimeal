'use client';

import React, { useState } from 'react';
import { CateringOrder } from '@/types';
import { SuratJalanModal } from '@/components/modals/surat-jalan-modal';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  User,
  Package,
  Printer,
  MessageSquare,
  CheckCircle2,
  Utensils,
  Truck,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';

interface OrderDetailViewProps {
  initialOrder: CateringOrder;
}

export function OrderDetailView({ initialOrder }: OrderDetailViewProps) {
  const [order, setOrder] = useState<CateringOrder>(initialOrder);
  const [copied, setCopied] = useState(false);
  const [isSuratJalanOpen, setIsSuratJalanOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleCopyAddress = () => {
    const fullText = `${order.customer_name} - ${order.customer_phone}\n${order.customer_address}${
      order.address_detail ? ` (${order.address_detail})` : ''
    }`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const cleanPhone = order.customer_phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone;

    const msg = encodeURIComponent(
      `Halo Kak ${order.customer_name}, kami dari NutriMeal Catering mengonfirmasi pesanan #${order.id} (${order.menu_name || order.package_name}) untuk pengantaran batch ${order.delivery_batch || 'Pagi/Siang'}. Paket Anda sedang dipersiapkan dan kurir kami akan segera mengantar sesuai jadwal. Terima kasih!`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  const handleStatusChange = async (newStatus: 'Diterima' | 'Diproses' | 'Dikirim' | 'Selesai') => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Daftar Pesanan</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-medium">Detail Pesanan</span>
          <span className="text-slate-300">/</span>
          <span className="font-mono font-bold text-emerald-800">#{order.id}</span>
        </div>

        <Link
          href="/admin/orders"
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
        >
          Kembali
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-black text-xl text-emerald-800 tracking-tight">
              #{order.id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {order.customer_type}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {order.day || 'Senin'} • {order.delivery_batch}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span>{order.payment_status || 'Lunas'}</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-2">
            <span>Waktu Pemesanan: {order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : 'Baru saja'}</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Jadwal Kirim: {order.delivery_schedule}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSuratJalanOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Surat Jalan</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left 7 cols, Right 5 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Rincian Menu & Porsi Katering */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <span>Menu & Porsi Katering</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {order.package_name}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{order.menu_name || order.package_name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{order.menu_detail || order.package_detail || 'Paket Sehat Harian'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-800 text-sm">{order.portions_count || 1} Box</span>
                  <span className="block text-[11px] text-slate-400">Porsi Terjadwal</span>
                </div>
              </div>

              {order.kitchen_notes && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800">
                  <span className="font-bold block">Catatan Dapur Khusus:</span>
                  <p className="mt-0.5">{order.kitchen_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Pengiriman & Logistik */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <span>Informasi Pengantaran & Kurir</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {order.delivery_batch}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Kurir Bertugas:</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{order.courier_name || 'Belum ditugaskan'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Slot Waktu Pengantaran:</span>
                <span className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {order.delivery_schedule}
                </span>
              </div>
            </div>

            {order.courier_notes && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-800">
                <span className="font-bold block">Catatan untuk Pengemudi:</span>
                <p className="mt-0.5">{order.courier_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 3: Pelanggan & Alamat */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <User className="w-4 h-4 text-emerald-800" />
                <span>Pelanggan</span>
              </div>
              <button
                onClick={handleCopyAddress}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin Alamat'}</span>
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Nama Penerima:</span>
                <span className="font-bold text-slate-800 text-sm">{order.customer_name}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Nomor Telepon:</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {order.customer_phone}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Alamat Antar:</span>
                <p className="font-medium text-slate-700 mt-0.5 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{order.customer_address}</span>
                </p>
                {order.address_detail && (
                  <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    📍 {order.address_detail}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Status Pesanan & Pembayaran */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              Status & Total Pembayaran
            </h3>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Ubah Status Pesanan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Diterima', 'Diproses', 'Dikirim', 'Selesai'] as const).map((st) => (
                    <button
                      key={st}
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange(st)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        order.status === st
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Bayar:</span>
                  <span className="font-semibold text-slate-800">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Pembayaran:</span>
                  <span className="font-bold text-emerald-700">{order.payment_status}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                  <span className="font-bold text-slate-800">Total Harga:</span>
                  <span className="font-black text-emerald-800">
                    Rp {Number(order.total_price).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Surat Jalan Modal */}
      <SuratJalanModal
        isOpen={isSuratJalanOpen}
        orders={[
          {
            id: order.id,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            customerAddress: order.customer_address,
            customerType: order.customer_type,
            packageName: order.package_name,
            packageDetail: order.package_detail || '',
            deliverySchedule: order.delivery_schedule,
            deliveryBatch: order.delivery_batch,
            status: order.status,
            totalPrice: order.total_price,
            createdAt: order.created_at || new Date().toISOString(),
          },
        ]}
        onClose={() => setIsSuratJalanOpen(false)}
      />
    </div>
  );
}
