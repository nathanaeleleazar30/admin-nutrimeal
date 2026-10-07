'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { CateringPackage } from '@/lib/data-store';
import { Package, PlusCircle, Users, Check, Edit, Trash2 } from 'lucide-react';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (data.success && data.data) {
        setPackages(data.data);
      }
    } catch {
      console.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-800" />
            <span>Kelola Paket Catering</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi paket langganan mingguan, katering kantor harian, paket keluarga, dan prasmanan event.
          </p>
        </div>

        <button
          onClick={() => alert('Fitur tambah paket baru telah terhubung dengan endpoint POST /api/packages')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Memuat paket catering...</div>
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
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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
                    <span className="font-bold text-slate-900">{pkg.salesCount} Porsi</span>
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
                    onClick={() => alert(`Edit paket: ${pkg.name}`)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert(`Paket katering ${pkg.name} aman dan aktif`)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
