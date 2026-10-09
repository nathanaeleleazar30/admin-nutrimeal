'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [cateringName, setCateringName] = useState('NutriMeal Catering UMKM');
  const [phone, setPhone] = useState('0812-8890-1122');
  const [address, setAddress] = useState('Jl. Soekarno Hatta No. 45, Lowokwaru, Kota Malang, Jawa Timur');
  const [morningShift, setMorningShift] = useState('11:00 - 12:30 WIB');
  const [eveningShift, setEveningShift] = useState('16:00 - 17:30 WIB');
  const [cutoffTime, setCutoffTime] = useState('15:00 WIB');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-800" />
            <span>Pengaturan Katering UMKM</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi identitas operasional dapur katering, jam shift pengiriman, dan waktu cut-off pesanan.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 max-w-3xl">
        {saved && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan operasional katering berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Profil Usaha Katering
            </h2>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Usaha Katering</label>
                <input
                  type="text"
                  value={cateringName}
                  onChange={(e) => setCateringName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">No WhatsApp Operasional & CS</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Dapur Produksi</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Waktu Operasional & Shift Antar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Batch Pagi / Siang</label>
                <input
                  type="text"
                  value={morningShift}
                  onChange={(e) => setMorningShift(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Batch Sore / Malam</label>
                <input
                  type="text"
                  value={eveningShift}
                  onChange={(e) => setEveningShift(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Waktu Cut-Off Order</label>
                <input
                  type="text"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
