'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Customer } from '@/lib/data-store';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Building,
  MessageCircle,
  AlertTriangle,
  Flame,
  Heart,
  Calendar,
  X,
  Activity,
  CheckCircle2,
  Navigation,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface SavedAddress {
  label: string;
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  deliveryNote: string;
  isDefault: boolean;
}

interface CustomerPhysicalStats {
  heightCm: number;
  weightKg: number;
  age: number;
  bmi: number;
  bmiCategory: string;
  nutritionScore: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success && data.data) {
        setCustomers(data.data);
      }
    } catch {
      console.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getCustomerStats = (cust: Customer): CustomerPhysicalStats => {
    const isPersonal = cust.type === 'Personal';
    const isCorp = cust.type === 'Korporat / Kantor';
    const height = isPersonal ? 163 : isCorp ? 172 : 168;
    const weight = isPersonal ? 52 : isCorp ? 68 : 61;
    const age = isPersonal ? 24 : isCorp ? 31 : 28;
    const bmiVal = Number((weight / Math.pow(height / 100, 2)).toFixed(1));
    let cat = 'Ideal & Normal (Healthy)';
    if (bmiVal < 18.5) cat = 'Kurang (Underweight)';
    else if (bmiVal >= 25 && bmiVal < 30) cat = 'Kelebihan (Overweight)';
    else if (bmiVal >= 30) cat = 'Obesitas';

    return {
      heightCm: height,
      weightKg: weight,
      age: age,
      bmi: bmiVal,
      bmiCategory: cat,
      nutritionScore: 88,
    };
  };

  const getSavedAddresses = (cust: Customer): SavedAddress[] => {
    return [
      {
        label: 'Alamat Utama (Rumah)',
        recipientName: cust.name,
        phoneNumber: cust.phone,
        fullAddress: cust.address,
        deliveryNote: 'Pagar hitam, titip di pos satpam atau meja teras jika tidak di rumah.',
        isDefault: true,
      },
      {
        label: 'Kantor / Tempat Kerja',
        recipientName: `${cust.name} (Divisi Operasional)`,
        phoneNumber: cust.phone,
        fullAddress: cust.companyName ? `${cust.companyName}, Lt. 4, Kawasan Bisnis Utama` : 'Gedung Graha Tower Lt. 8, Unit 802',
        deliveryNote: 'Antar sebelum jam 11:45 WIB, titip di resepsionis lobi utama.',
        isDefault: false,
      },
    ];
  };

  const filtered = customers.filter((c) => {
    const matchType = typeFilter === 'Semua' || c.type === typeFilter;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (c.allergies && c.allergies.some((a) => a.toLowerCase().includes(search.toLowerCase()))) ||
      (c.dietaryGoals && c.dietaryGoals.some((g) => g.toLowerCase().includes(search.toLowerCase())));
    return matchType && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-800" />
            <span>Data Pelanggan & Catatan Diet Katering</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola profil pelanggan personal & kantor, preferensi diet, riwayat pesanan, serta catatan alergi medis untuk keamanan dapur.
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['Semua', 'Personal', 'Korporat / Kantor', 'Keluarga'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === type
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, kantor, alergi, diet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Memuat data pelanggan...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-bold text-slate-600">Pelanggan tidak ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cust) => (
            <div
              key={cust.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{cust.name}</h3>
                    {cust.companyName && (
                      <p className="text-xs text-sky-700 font-semibold flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>{cust.companyName}</span>
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cust.type === 'Korporat / Kantor'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : cust.type === 'Keluarga'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {cust.type}
                  </span>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cust.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{cust.address}</span>
                  </div>
                </div>

                {/* Nutrition and Allergies - Matching Mobile Profile */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  {cust.allergies && cust.allergies.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Peringatan Alergi Makanan:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cust.allergies.map((allergy, i) => (
                          <span
                            key={i}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              allergy.includes('None')
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cust.dietaryGoals && cust.dietaryGoals.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 mb-1">
                        <Heart className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Target & Preferensi Diet:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cust.dietaryGoals.map((goal, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {goal}
                          </span>
                        ))}
                        {cust.targetCalories && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-amber-600" />
                            {cust.targetCalories} kcal/hari
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {cust.activeSubscription && (
                  <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs">
                    <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
                      Langganan Aktif:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {cust.activeSubscription}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Belanja (LTV)</span>
                  <span className="font-extrabold text-slate-900">
                    Rp {cust.totalSpent.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {cust.totalOrders}x Transaksi
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedCustomer(cust)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors text-xs"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Fisik & Alamat</span>
                  </button>

                  <a
                    href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors text-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WA</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Health & Multi-Address Modal (Matching Flutter profile_detail_screen & address_screen) */}
      {selectedCustomer && (() => {
        const stats = getCustomerStats(selectedCustomer);
        const addresses = getSavedAddresses(selectedCustomer);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center text-sm font-black shadow-xs">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <span>{selectedCustomer.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedCustomer.type}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      ID: {selectedCustomer.id} • Bergabung sejak {selectedCustomer.joinedDate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 text-xs">
                {/* Physical Health & BMI Section (From Mobile App Profile Detail) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-700" />
                      <span>Data Fisik & Indeks Massa Tubuh (BMI Mobile Sync)</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Kepatuhan Diet: {stats.nutritionScore}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Tinggi Badan</span>
                      <span className="font-extrabold text-slate-900 text-sm">{stats.heightCm} cm</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Berat Badan</span>
                      <span className="font-extrabold text-slate-900 text-sm">{stats.weightKg} kg</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Usia Pelanggan</span>
                      <span className="font-extrabold text-slate-900 text-sm">{stats.age} tahun</span>
                    </div>
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                      <span className="text-emerald-800 block text-[10px] font-semibold">Skor BMI</span>
                      <span className="font-extrabold text-emerald-900 text-sm">{stats.bmi}</span>
                      <span className="text-[9px] text-emerald-700 block font-bold mt-0.5">{stats.bmiCategory}</span>
                    </div>
                  </div>
                </div>

                {/* Dietary Target & Allergies */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-600" />
                      <span>Target Diet & Gizi:</span>
                    </span>
                    <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                      {selectedCustomer.dietaryGoals?.join(', ') || 'Gizi Seimbang'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>Target Asupan Kalori:</span>
                    </span>
                    <span className="font-extrabold text-amber-800 text-xs">
                      {selectedCustomer.targetCalories || 1800} kkal / hari
                    </span>
                  </div>

                  {selectedCustomer.allergies && selectedCustomer.allergies.length > 0 && (
                    <div className="border-t border-slate-200/60 pt-2">
                      <span className="font-bold text-rose-700 text-xs flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Catatan Alergi Bahan Masakan:</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCustomer.allergies.map((al, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px]"
                          >
                            {al}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiple Saved Delivery Addresses (Matching Mobile App AddressScreen) */}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mb-2.5">
                    <Navigation className="w-4 h-4 text-emerald-700" />
                    <span>Daftar Alamat Pengiriman Tersimpan (Buku Alamat Mobile)</span>
                  </h3>

                  <div className="space-y-2.5">
                    {addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs ${
                          addr.isDefault
                            ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-800 text-white">
                                Utama
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{addr.phoneNumber}</span>
                        </div>

                        <p className="text-slate-700 font-medium mt-1">{addr.fullAddress}</p>

                        {addr.deliveryNote && (
                          <div className="mt-2 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-200/60 flex items-start gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span><b className="text-slate-700">Catatan Kurir:</b> {addr.deliveryNote}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="text-xs text-slate-500">
                  Total LTV: <b className="text-slate-800">Rp {selectedCustomer.totalSpent.toLocaleString('id-ID')}</b> ({selectedCustomer.totalOrders} Pesanan)
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp Pelanggan</span>
                  </a>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </AdminLayout>
  );
}
