'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { CateringOrder } from '@/lib/data-store';
import { SuratJalanModal } from '@/components/modals/surat-jalan-modal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Package,
  Printer,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Utensils,
  Truck,
  CreditCard,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<CateringOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSuratJalanOpen, setIsSuratJalanOpen] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch order detail', err);
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleCopyAddress = () => {
    if (!order) return;
    const fullText = `${order.customerName} - ${order.customerPhone}\n${order.customerAddress}${
      order.addressDetail ? ` (${order.addressDetail})` : ''
    }`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!order) return;
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone;

    const msg = encodeURIComponent(
      `Halo Kak ${order.customerName}, kami dari NutriMeal Catering mengonfirmasi pesanan #${order.id} (${order.menuName || order.packageName}) untuk pengantaran shift ${order.deliveryBatch || 'Siang'}. Paket Anda sedang dipersiapkan dan kurir kami akan segera mengantar sesuai jadwal. Terima kasih!`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Memuat rincian detail pesanan...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Pesanan dengan ID #{orderId} tidak terdaftar di sistem database.
          </p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Pesanan</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Daftar Pembelian Pelanggan</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-medium">Detail Pesanan</span>
            <span className="text-slate-300">/</span>
            <span className="font-mono font-bold text-emerald-800">#{order.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Kembali
            </Link>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-black text-xl text-emerald-800 tracking-tight">
                #{order.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {order.customerType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {order.day || 'Senin'} • {order.deliveryBatch === 'Sore/Malam' ? 'Batch Sore' : 'Batch Siang'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span>{order.paymentStatus || 'Lunas'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>Waktu Pemesanan: {new Date(order.createdAt).toLocaleString('id-ID')}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Jadwal Kirim: {order.deliverySchedule}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSuratJalanOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak Surat Jalan Kurir</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat WhatsApp Pelanggan</span>
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
                  <span>Rincian Menu & Komposisi Porsi</span>
                </div>
                <span className="font-bold text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {order.portionsCount || 1} Box Porsi Siap Saji
                </span>
              </div>

              <div className="pt-4 space-y-4 text-xs">
                {/* Menu Selection Highlight */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Menu Pilihan di Keranjang
                  </p>
                  <h3 className="font-black text-slate-900 text-base mt-0.5">
                    {order.menuName || order.packageName}
                  </h3>
                  <p className="font-semibold text-emerald-700 mt-0.5">
                    {order.menuDetail || order.packageDetail}
                  </p>
                  <p className="text-slate-500 mt-1">
                    Menu sehat pilihan pelanggan yang disusun dalam keranjang untuk pengiriman {order.day || 'Senin'}.
                  </p>
                </div>

                {/* Komposisi Piring Nutrisi */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Komposisi Piring Sehat:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Lauk Protein Utama
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        Dada Ayam Panggang Herbal
                      </span>
                      <span className="text-[11px] text-slate-500">120g matang • Rendah Lemak</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Karbohidrat Kompleks
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        Nasi Merah Organik Pulen
                      </span>
                      <span className="text-[11px] text-slate-500">150g • Serat Tinggi & Low GI</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Sayuran & Serat
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        Brokoli Kukus & Wortel Serut
                      </span>
                      <span className="text-[11px] text-slate-500">Kukus fresh saat pagi</span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Saus / Dressing
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        Dressing Wijen Sangrai
                      </span>
                      <span className="text-[11px] text-slate-500">Kemasan pouch terpisah</span>
                    </div>
                  </div>
                </div>

                {/* Nutrition Facts */}
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-2">
                    Estimasi Fakta Nutrisi Per Porsi
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-semibold">Energi</span>
                      <span className="font-black text-slate-800 text-xs">480 kkal</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-semibold">Protein</span>
                      <span className="font-black text-emerald-700 text-xs">36 g</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-semibold">Lemak</span>
                      <span className="font-black text-slate-800 text-xs">11 g</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block font-semibold">Karbohidrat</span>
                      <span className="font-black text-slate-800 text-xs">52 g</span>
                    </div>
                  </div>
                </div>

                {/* Kitchen Special Notes */}
                {order.kitchenNotes && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900">
                    <span className="font-bold block text-[11px]">
                      Catatan Dapur / Preferensi Diet:
                    </span>
                    <p className="mt-0.5 text-xs">{order.kitchenNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Pengiriman & Catatan Kurir */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-sky-100/70 text-sky-700 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span>Alamat Pengiriman & Catatan Kurir</span>
                </div>

                <button
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-800 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Tersalin' : 'Salin Alamat'}</span>
                </button>
              </div>

              <div className="pt-4 space-y-3.5 text-xs text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Alamat Lengkap
                  </span>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{order.customerAddress}</p>
                      {order.addressDetail && (
                        <p className="font-semibold text-emerald-800 mt-0.5">
                          📍 {order.addressDetail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drop Point & Courier Notes */}
                {order.courierNotes && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900">
                    <span className="font-bold block text-[11px]">
                      Instruksi Titik Serah / Drop Point:
                    </span>
                    <p className="mt-0.5 text-xs">{order.courierNotes}</p>
                  </div>
                )}

                {/* Courier Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Armada Kurir Ditugaskan
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {order.courierName || 'Budi Santoso - Motor 01'}
                    </p>
                    <p className="text-[11px] text-slate-500">NutriMeal Dedicated Dispatch</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Jadwal Waktu Tiba
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {order.deliverySchedule}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {order.deliveryBatch === 'Sore/Malam' ? 'Makan Malam' : 'Makan Siang'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      order.customerAddress
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Rute Pengantaran di Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 3: Informasi Pelanggan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span>Data Pelanggan</span>
                </div>
              </div>

              <div className="pt-4 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {order.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{order.customerName}</h4>
                    <span className="text-[11px] text-slate-400 block">{order.customerPhone}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kategori Akun:</span>
                    <span className="font-semibold text-slate-800">{order.customerType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Langganan:</span>
                    <span className="font-semibold text-emerald-700">Aktif (Mingguan)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold border border-emerald-200 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Kirim Pesan WhatsApp Langsung</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 4: Rincian Pembayaran */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span>Rincian Pembayaran</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Lunas
                </span>
              </div>

              <div className="pt-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Menu ({order.portionsCount || 1} Porsi):</span>
                  <span className="font-semibold text-slate-900">
                    Rp {order.totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Ongkos Kirim Kurir:</span>
                  <span className="font-semibold text-emerald-700">Rp 0 (Gratis)</span>
                </div>

                <div className="flex justify-between">
                  <span>Kemasan Box Higienis:</span>
                  <span className="font-semibold text-slate-900">Termasuk</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Total Pembayaran:</span>
                  <span className="font-black text-lg text-emerald-800">
                    Rp {order.totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 mt-3 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Metode Pembayaran:</span>
                    <span className="font-bold text-slate-800">
                      {order.paymentMethod || 'Bank Transfer (BCA KlikPay)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Status Verifikasi:</span>
                    <span className="font-semibold text-green-700">
                      Otomatis Terverifikasi
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Quick Manifest Kurir Slip */}
            <div className="bg-emerald-900 text-white rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-300" />
                  <h4 className="font-black text-sm tracking-tight">
                    Lembar Surat Jalan Siap Cetak
                  </h4>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Cetak lembar jalan manifest kurir lengkap dengan tanda tangan penerima dan rincian box untuk armada pengantaran.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setIsSuratJalanOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-emerald-700" />
                    <span>Cetak Surat Jalan</span>
                  </button>

                  <Link
                    href={`/admin/orders/surat-jalan?day=${order.day || 'Senin'}&batch=${order.deliveryBatch}`}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-xs border border-emerald-700/60 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat Rekap Full</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Surat Jalan Modal */}
      <SuratJalanModal
        isOpen={isSuratJalanOpen}
        onClose={() => setIsSuratJalanOpen(false)}
        orders={[order]}
        selectedDay={order.day || 'Senin'}
        selectedBatch={order.deliveryBatch}
      />
    </AdminLayout>
  );
}
