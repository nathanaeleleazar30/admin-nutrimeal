'use client';

import React, { useState } from 'react';
import { X, PlusCircle, Utensils } from 'lucide-react';
import { CateringOrder, CustomerType } from '@/lib/data-store';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: CateringOrder) => void;
}

const availableMenuOptions = [
  { name: 'Grilled Chicken + Salad Brokoli', defaultDetail: 'Nasi Merah Organik • Less Oil', price: 45000 },
  { name: 'Pepes Tongkol Bumbu Kuning', defaultDetail: 'Nasi Merah Organik + Sayur Asem', price: 48000 },
  { name: 'Chicken Salad Wijen Sangrai', defaultDetail: 'Romaine Lettuce • Olive Oil Dressing', price: 42000 },
  { name: 'Beef Teriyaki Rendah Lemak + Brokoli', defaultDetail: 'Nasi Shirataki & Tumis Jagung', price: 55000 },
  { name: 'Dada Ayam Panggang Wortel Serut', defaultDetail: 'Kukus Labu Siam & Jagung', price: 52000 },
  { name: 'Healthy Salmon Bowl', defaultDetail: 'Edamame & Japanese Furikake', price: 65000 },
];

export function NewOrderModal({ isOpen, onClose, onOrderCreated }: NewOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    addressDetail: string;
    customerType: CustomerType;
    menuName: string;
    menuDetail: string;
    portionsCount: number;
    deliverySchedule: string;
    deliveryBatch: 'Pagi/Siang' | 'Sore/Malam';
    day: string;
    paymentMethod: string;
    totalPrice: number;
    notes: string;
  }>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    addressDetail: '',
    customerType: 'Personal',
    menuName: 'Grilled Chicken + Salad Brokoli',
    menuDetail: 'Nasi Merah Organik • Less Oil (1 Porsi)',
    portionsCount: 1,
    deliverySchedule: '11:30 - 13:00 WIB',
    deliveryBatch: 'Pagi/Siang',
    day: 'Senin',
    paymentMethod: 'Bank Transfer (BCA)',
    totalPrice: 45000,
    notes: '',
  });

  if (!isOpen) return null;

  const handleMenuChange = (selectedName: string) => {
    const found = availableMenuOptions.find((m) => m.name === selectedName);
    const unitPrice = found ? found.price : 45000;
    const detail = found ? found.defaultDetail : '';
    setFormData((prev) => ({
      ...prev,
      menuName: selectedName,
      menuDetail: `${detail} (${prev.portionsCount} Porsi)`,
      totalPrice: unitPrice * prev.portionsCount,
    }));
  };

  const handlePortionsChange = (qty: number) => {
    const validQty = Math.max(1, qty);
    const found = availableMenuOptions.find((m) => m.name === formData.menuName);
    const unitPrice = found ? found.price : 45000;
    setFormData((prev) => ({
      ...prev,
      portionsCount: validQty,
      menuDetail: prev.menuDetail.replace(/\(\d+ Porsi\)/, `(${validQty} Porsi)`),
      totalPrice: unitPrice * validQty,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          packageName: formData.menuName, // backward compatibility
          packageDetail: formData.menuDetail,
          courierNotes: formData.addressDetail ? `Titik serah: ${formData.addressDetail}` : '',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onOrderCreated(data.data);
        onClose();
      }
    } catch {
      alert('Gagal membuat pesanan katering.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-800" />
              <span>Entri Pesanan Menu Katering</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Input manual pesanan pilihan menu pelanggan (seperti yang diatur di keranjang)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Pelanggan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Rian Kusuma"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor WhatsApp / Telp *</label>
              <input
                type="tel"
                required
                placeholder="+62 812-xxxx-xxxx"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tipe Pelanggan</label>
              <select
                value={formData.customerType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerType: e.target.value as CustomerType,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs bg-white"
              >
                <option value="Personal">Personal</option>
                <option value="Korporat / Kantor">Korporat / Kantor</option>
                <option value="Keluarga">Keluarga</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Alamat Pengiriman Lengkap *</label>
            <input
              type="text"
              required
              placeholder="Nama Gedung / Jalan, Lantai / Unit..."
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Patokan Titik Serah / Drop Point Kurir</label>
            <input
              type="text"
              placeholder="Contoh: Jakarta Selatan • Titip Resepsionis / Lobby Tower 2"
              value={formData.addressDetail}
              onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs"
            />
          </div>

          {/* Menu Selection (Dipilih per menu sesuai keranjang) */}
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
            <span className="font-bold text-emerald-900 block text-xs">
              Pilihan Menu (Diatur di Keranjang):
            </span>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Menu Sehat *</label>
              <select
                value={formData.menuName}
                onChange={(e) => handleMenuChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs bg-white"
              >
                {availableMenuOptions.map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name} - Rp {opt.price.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jumlah Porsi / Box</label>
                <input
                  type="number"
                  min={1}
                  value={formData.portionsCount}
                  onChange={(e) => handlePortionsChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hari Pengiriman</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs bg-white"
                >
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Detail Porsi & Racikan</label>
              <input
                type="text"
                value={formData.menuDetail}
                onChange={(e) => setFormData({ ...formData, menuDetail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Shift Batch Pengiriman</label>
              <select
                value={formData.deliveryBatch}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryBatch: e.target.value as 'Pagi/Siang' | 'Sore/Malam',
                    deliverySchedule: e.target.value === 'Pagi/Siang' ? '11:30 - 13:00 WIB' : '17:00 - 18:30 WIB',
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs bg-white"
              >
                <option value="Pagi/Siang">Batch Siang (11:30 - 13:00 WIB)</option>
                <option value="Sore/Malam">Batch Sore (17:00 - 18:30 WIB)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Total Biaya (Rp) *</label>
              <input
                type="number"
                required
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs font-bold text-emerald-800"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Metode Pembayaran</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs bg-white"
            >
              <option value="Bank Transfer (BCA KlikPay)">Bank Transfer (BCA KlikPay)</option>
              <option value="Bank Transfer (BCA VA)">Bank Transfer (BCA VA)</option>
              <option value="QRIS (ShopeePay)">QRIS (ShopeePay)</option>
              <option value="E-Wallet (GoPay)">E-Wallet (GoPay)</option>
              <option value="Bank Transfer (Mandiri)">Bank Transfer (Mandiri)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Catatan Dapur / Alergi (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Less oil, dressing terpisah, tanpa bawang"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Pesanan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
