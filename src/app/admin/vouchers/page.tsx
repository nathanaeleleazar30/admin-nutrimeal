'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { VoucherPromo, VoucherDiscountType } from '@/lib/data-store';
import {
  Ticket,
  PlusCircle,
  Search,
  CheckCircle2,
  Trash2,
  Tag,
  Percent,
  Truck,
  Sparkles,
  Calendar,
  X,
  Save,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherPromo | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<VoucherDiscountType>('nominal');
  const [formDiscountValue, setFormDiscountValue] = useState(15000);
  const [formMaxDiscount, setFormMaxDiscount] = useState<number | undefined>(undefined);
  const [formMinSpend, setFormMinSpend] = useState(75000);
  const [formCategoryTag, setFormCategoryTag] = useState('✓ Semua Menu Diet & Katering');
  const [formBadgeText, setFormBadgeText] = useState('REKOMENDASI');
  const [formQuota, setFormQuota] = useState(100);
  const [formValidUntil, setFormValidUntil] = useState('2026-12-31');

  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/vouchers');
      const data = await res.json();
      if (data.success && data.data) {
        setVouchers(data.data);
      }
    } catch {
      console.error('Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormCode('');
    setFormTitle('');
    setFormDiscountType('nominal');
    setFormDiscountValue(15000);
    setFormMaxDiscount(undefined);
    setFormMinSpend(75000);
    setFormCategoryTag('✓ Semua Menu Diet & Katering');
    setFormBadgeText('');
    setFormQuota(100);
    setFormValidUntil('2026-12-31');
    setIsModalOpen(true);
  };

  const openEditModal = (v: VoucherPromo) => {
    setEditingVoucher(v);
    setFormCode(v.code);
    setFormTitle(v.title);
    setFormDiscountType(v.discountType);
    setFormDiscountValue(v.discountValue);
    setFormMaxDiscount(v.maxDiscount);
    setFormMinSpend(v.minSpend);
    setFormCategoryTag(v.categoryTag);
    setFormBadgeText(v.badgeText || '');
    setFormQuota(v.quota);
    setFormValidUntil(v.validUntil);
    setIsModalOpen(true);
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitle) return;

    try {
      if (editingVoucher) {
        const res = await fetch(`/api/vouchers/${editingVoucher.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: formCode.toUpperCase().trim(),
            title: formTitle,
            discountType: formDiscountType,
            discountValue: formDiscountValue,
            maxDiscount: formMaxDiscount,
            minSpend: formMinSpend,
            categoryTag: formCategoryTag,
            badgeText: formBadgeText,
            quota: formQuota,
            validUntil: formValidUntil,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setVouchers((prev) =>
            prev.map((v) => (v.id === editingVoucher.id ? data.data : v))
          );
        }
      } else {
        const res = await fetch('/api/vouchers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: formCode.toUpperCase().trim(),
            title: formTitle,
            discountType: formDiscountType,
            discountValue: formDiscountValue,
            maxDiscount: formMaxDiscount,
            minSpend: formMinSpend,
            categoryTag: formCategoryTag,
            badgeText: formBadgeText,
            quota: formQuota,
            validUntil: formValidUntil,
            isActive: true,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setVouchers((prev) => [data.data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch {
      alert('Gagal menyimpan voucher');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' }),
      });
      const data = await res.json();
      if (data.success) {
        setVouchers((prev) =>
          prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v))
        );
      }
    } catch {
      alert('Gagal mengubah status voucher');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher promo ini?')) return;
    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setVouchers((prev) => prev.filter((v) => v.id !== id));
      }
    } catch {
      alert('Gagal menghapus voucher');
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.categoryTag.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'Semua') return true;
    if (filterType === 'Aktif') return v.isActive;
    if (filterType === 'Nonaktif') return !v.isActive;
    if (filterType === 'Ongkir') return v.discountType === 'free_shipping';
    if (filterType === 'Diskon') return v.discountType === 'nominal' || v.discountType === 'percent';
    if (filterType === 'Cashback') return v.discountType === 'cashback';
    return true;
  });

  const totalUsed = vouchers.reduce((acc, curr) => acc + curr.usedCount, 0);
  const activeCount = vouchers.filter((v) => v.isActive).length;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-emerald-800" />
            <span>Manajemen Voucher & Promo</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola kode kupon, voucher gratis ongkir, diskon persentase, dan promo katering untuk aplikasi pelanggan mobile.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all shadow-emerald-900/10 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Promo Baru</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Voucher Aktif</p>
            <h3 className="text-xl font-black text-slate-900">{activeCount} Promo</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Tersedia di checkout mobile</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Digunakan Pelanggan</p>
            <h3 className="text-xl font-black text-slate-900">{totalUsed} Kali</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Meningkatkan konversi repeat order</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Sinkronisasi Mobile</p>
            <h3 className="text-xl font-black text-slate-900">Tersambung</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Sinkron otomatis dengan Keranjang & Checkout</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['Semua', 'Aktif', 'Ongkir', 'Diskon', 'Cashback', 'Nonaktif'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                filterType === type
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode atau nama promo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
          />
        </div>
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
          Memuat data voucher promo...
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold text-sm">Tidak ada promo yang sesuai</p>
          <p className="text-slate-400 text-xs mt-1">Coba ubah kata kunci atau buat voucher baru</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVouchers.map((voucher) => {
            const usagePercent = Math.min(
              100,
              Math.round((voucher.usedCount / voucher.quota) * 100)
            );

            return (
              <div
                key={voucher.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                  voucher.isActive
                    ? 'border-slate-200 hover:border-emerald-500/50 hover:shadow-md'
                    : 'border-slate-200 opacity-60 bg-slate-50/50'
                }`}
              >
                {/* Card Top: Ticket-style visual */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          voucher.discountType === 'free_shipping'
                            ? 'bg-emerald-100 text-emerald-800'
                            : voucher.discountType === 'percent'
                            ? 'bg-teal-100 text-teal-800'
                            : voucher.discountType === 'cashback'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {voucher.discountType === 'free_shipping' ? (
                          <Truck className="w-5 h-5" />
                        ) : voucher.discountType === 'percent' ? (
                          <Percent className="w-5 h-5" />
                        ) : voucher.discountType === 'cashback' ? (
                          <Coins className="w-5 h-5" />
                        ) : (
                          <Tag className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md tracking-wider border border-slate-200">
                            {voucher.code}
                          </span>
                          {voucher.badgeText && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {voucher.badgeText}
                            </span>
                          )}
                          {!voucher.isActive && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              NONAKTIF
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">{voucher.title}</h3>
                      </div>
                    </div>

                    {/* Status Toggle Switch */}
                    <button
                      onClick={() => handleToggleStatus(voucher.id)}
                      title={voucher.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        voucher.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          voucher.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Conditions & Details */}
                  <div className="mt-4 pt-3 border-t border-dashed border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Ketentuan Belanja:</span>
                      <span className="font-semibold text-slate-700">
                        Min. Rp{voucher.minSpend.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Kategori Promo:</span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {voucher.categoryTag}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Potongan Diskon:</span>
                      <span className="font-bold text-emerald-800">
                        {voucher.discountType === 'percent'
                          ? `${voucher.discountValue}% (Maks Rp${(voucher.maxDiscount || 0).toLocaleString('id-ID')})`
                          : voucher.discountType === 'cashback'
                          ? `Cashback ${voucher.discountValue}% Koin`
                          : `Rp${voucher.discountValue.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Berlaku Hingga:</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {voucher.validUntil}
                      </span>
                    </div>
                  </div>

                  {/* Usage Quota Progress */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-slate-500 font-medium">Penggunaan Kuota:</span>
                      <span className="font-bold text-slate-700">
                        {voucher.usedCount} / {voucher.quota} ({usagePercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent > 80
                            ? 'bg-amber-500'
                            : usagePercent > 50
                            ? 'bg-emerald-600'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {voucher.isActive ? 'Aktif di keranjang' : 'Disembunyikan dari aplikasi'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(voucher)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(voucher.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Promo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-800" />
                <h2 className="font-extrabold text-sm text-slate-800">
                  {editingVoucher ? 'Edit Voucher Promo' : 'Buat Voucher Promo Baru'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kode Voucher (Huruf Besar) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: DIETHEMAT"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tipe Diskon *
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as VoucherDiscountType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 bg-white"
                  >
                    <option value="nominal">Potongan Nominal (Rp)</option>
                    <option value="percent">Persentase Diskon (%)</option>
                    <option value="free_shipping">Gratis Ongkir</option>
                    <option value="cashback">Cashback Koin Sehat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Judul Promo (Tampil di App Mobile) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Diskon Rp20.000 Spesial Katering Sehat"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nilai Diskon * {formDiscountType === 'percent' ? '(%)' : '(Rp)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Min. Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinSpend}
                    onChange={(e) => setFormMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
              </div>

              {formDiscountType === 'percent' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Maksimal Potongan Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 40000"
                    value={formMaxDiscount || ''}
                    onChange={(e) => setFormMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kategori / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: NutriPay / Saldo"
                    value={formCategoryTag}
                    onChange={(e) => setFormCategoryTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Badge Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: REKOMENDASI / TERBATAS"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kuota Penggunaan
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formQuota}
                    onChange={(e) => setFormQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Berlaku Sampai
                  </label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
