'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { CateringPackage, ActiveSubscription } from '@/lib/data-store';
import {
  Package,
  PlusCircle,
  Users,
  Check,
  Edit,
  Trash2,
  X,
  Save,
  TrendingUp,
  Clock,
  PauseCircle,
  PlayCircle,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Phone,
} from 'lucide-react';

type PackageType = 'Harian' | 'Mingguan' | 'Bulanan' | 'Prasmanan / Event';
type TargetAudience = 'Personal' | 'Korporat / Kantor' | 'Keluarga';

const COLOR_OPTIONS = [
  { label: 'Hijau Emerald', value: '#059669' },
  { label: 'Biru Langit', value: '#0284c7' },
  { label: 'Kuning Amber', value: '#d97706' },
  { label: 'Merah', value: '#dc2626' },
  { label: 'Ungu', value: '#7c3aed' },
  { label: 'Pink', value: '#db2777' },
];

export default function AdminPackagesPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'subscriptions'>('catalog');
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<CateringPackage | null>(null);

  // Form states for package
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<PackageType>('Mingguan');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(350000);
  const [formPortions, setFormPortions] = useState('10 Porsi');
  const [formTarget, setFormTarget] = useState<TargetAudience>('Personal');
  const [formMeals, setFormMeals] = useState('');
  const [formColor, setFormColor] = useState('#059669');

  const fetchData = async () => {
    try {
      const [resPkg, resSub] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/subscriptions'),
      ]);
      const dataPkg = await resPkg.json();
      const dataSub = await resSub.json();
      if (dataPkg.success && dataPkg.data) setPackages(dataPkg.data);
      if (dataSub.success && dataSub.data) setSubscriptions(dataSub.data);
    } catch {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingPkg(null);
    setFormName('');
    setFormType('Mingguan');
    setFormDescription('');
    setFormPrice(350000);
    setFormPortions('10 Porsi (Makan Siang & Malam)');
    setFormTarget('Personal');
    setFormMeals('');
    setFormColor('#059669');
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: CateringPackage) => {
    setEditingPkg(pkg);
    setFormName(pkg.name);
    setFormType(pkg.type);
    setFormDescription(pkg.description);
    setFormPrice(pkg.price);
    setFormPortions(pkg.portions);
    setFormTarget(pkg.targetAudience);
    setFormMeals(pkg.includedMeals.join(', '));
    setFormColor(pkg.color);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      type: formType,
      description: formDescription,
      price: formPrice,
      portions: formPortions,
      targetAudience: formTarget,
      includedMeals: formMeals.split(',').map((m) => m.trim()).filter(Boolean),
      color: formColor,
      salesCount: editingPkg?.salesCount || 0,
      percentage: editingPkg?.percentage || 0,
    };

    if (editingPkg) {
      await fetch(`/api/packages/${editingPkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    fetchData();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus paket katering ini? Pelanggan yang aktif berlangganan tidak akan terpengaruh.')) {
      await fetch(`/api/packages/${id}`, { method: 'DELETE' });
      setPackages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleToggleSubStatus = async (sub: ActiveSubscription) => {
    const newStatus = sub.status === 'Aktif' ? 'Dijeda' : 'Aktif';
    const reason =
      newStatus === 'Dijeda'
        ? prompt('Masukkan alasan jeda langganan (contoh: Cuti pelanggan, permintaan pause):') || 'Permintaan pelanggan'
        : undefined;

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sub.id,
          status: newStatus,
          pauseReason: reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === sub.id ? data.data : s))
        );
      }
    } catch {
      alert('Gagal memperbarui status langganan');
    }
  };

  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-800" />
            <span>Manajemen Paket & Langganan Katering</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi paket katalog langganan dan pantau status langganan aktif, jeda cuti, dan jadwal jam antar pelanggan.
          </p>
        </div>

        {activeTab === 'catalog' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs self-start sm:self-auto active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>Tambah Paket Baru</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'catalog'
              ? 'border-emerald-800 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Katalog Paket ({packages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'subscriptions'
              ? 'border-emerald-800 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Langganan Aktif Pelanggan ({subscriptions.length})</span>
        </button>
      </div>

      {/* TAB 1: KATALOG PAKET */}
      {activeTab === 'catalog' && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Paket', value: packages.length, color: 'text-slate-900' },
              {
                label: 'Paket Personal',
                value: packages.filter((p) => p.targetAudience === 'Personal').length,
                color: 'text-emerald-700',
              },
              {
                label: 'Paket Korporat',
                value: packages.filter((p) => p.targetAudience === 'Korporat / Kantor').length,
                color: 'text-sky-700',
              },
              {
                label: 'Paket Keluarga',
                value: packages.filter((p) => p.targetAudience === 'Keluarga').length,
                color: 'text-amber-700',
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5">
                <p className="text-[11px] text-slate-500 font-semibold">{stat.label}</p>
                <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Memuat paket katering...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: pkg.color }}
                  />

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {pkg.type}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {pkg.percentage}% Penjualan
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2.5">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>

                    <div className="mt-4 p-3 bg-slate-50 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Porsi:</span>
                        <span className="font-semibold text-slate-800">{pkg.portions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Pelanggan:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {pkg.targetAudience}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Porsi Terjual:</span>
                        <span className="font-bold text-slate-900">
                          {pkg.salesCount.toLocaleString('id-ID')} Porsi
                        </span>
                      </div>
                    </div>

                    {pkg.includedMeals.length > 0 && (
                      <div className="mt-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Menu Unggulan Paket:
                        </span>
                        <div className="space-y-1">
                          {pkg.includedMeals.map((mealName, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{mealName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga Paket</span>
                      <span className="text-base font-black text-slate-900">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                        title="Edit Paket"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        title="Hapus Paket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: LANGGANAN AKTIF PELANGGAN */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-emerald-900 block">
                Sinkronisasi Fitur "Langganan Saya" Aplikasi Mobile
              </span>
              <p className="text-emerald-700 mt-0.5">
                Admin dapat memantau sisa hari pengantaran, slot jam antar pilihan pelanggan (10:30–11:30, 11:30–13:00, 12:30–13:30 WIB), serta status jeda cuti katering saat pelanggan berhalangan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{sub.customerName}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            sub.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'Dijeda'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {sub.status === 'Aktif' ? '● AKTIF' : '⏸ DIJEDA (CUTI)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{sub.customerPhone}</span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {sub.packageName}
                    </span>
                  </div>

                  {/* Detail Grid */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Slot Menu:</span>
                      <span className="font-bold text-slate-800">{sub.mealSlot}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Jam Pengantaran:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-700" />
                        {sub.deliveryTimeSlot}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Periode Langganan:</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {sub.startDate} s.d. {sub.endDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Sisa Hari Pengantaran:</span>
                      <span className="font-black text-emerald-800">
                        {sub.daysRemaining} dari {sub.totalDays} Hari
                      </span>
                    </div>
                  </div>

                  {sub.status === 'Dijeda' && sub.pauseReason && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <span className="font-bold">Catatan Jeda:</span> {sub.pauseReason}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={sub.address}>
                    📍 {sub.address}
                  </span>

                  <button
                    onClick={() => handleToggleSubStatus(sub)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      sub.status === 'Aktif'
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-emerald-800 text-white hover:bg-emerald-900'
                    }`}
                  >
                    {sub.status === 'Aktif' ? (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Jeda Langganan</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Aktifkan Kembali</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Paket */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-800" />
                <h2 className="font-extrabold text-sm text-slate-800">
                  {editingPkg ? 'Edit Paket Langganan' : 'Tambah Paket Langganan'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Paket *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paket Sehat Diet Mingguan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Durasi Paket *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PackageType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 bg-white"
                  >
                    <option value="Harian">Harian (Trial)</option>
                    <option value="Mingguan">Mingguan (5 - 7 Hari)</option>
                    <option value="Bulanan">Bulanan (30 Hari Lengkap)</option>
                    <option value="Prasmanan / Event">Prasmanan / Event</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Konsumen *</label>
                  <select
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value as TargetAudience)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 bg-white"
                  >
                    <option value="Personal">Personal / Individu</option>
                    <option value="Korporat / Kantor">Korporat / Kantor</option>
                    <option value="Keluarga">Keluarga (Family)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harga Paket (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="5000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jumlah Porsi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 10 Porsi (Siang & Malam)"
                    value={formPortions}
                    onChange={(e) => setFormPortions(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Paket</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan keunggulan nutrisi paket katering..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Menu Unggulan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Grilled Chicken, Pepes Tongkol, Beef Veggie"
                  value={formMeals}
                  onChange={(e) => setFormMeals(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Aksen Warna Kartu</label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setFormColor(col.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        formColor === col.value ? 'scale-110 border-slate-800 shadow-xs' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col.value }}
                      title={col.label}
                    />
                  ))}
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
                  <span>Simpan Paket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
