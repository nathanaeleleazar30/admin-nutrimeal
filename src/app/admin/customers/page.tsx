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
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');

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

                <a
                  href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors text-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hubungi WA</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
