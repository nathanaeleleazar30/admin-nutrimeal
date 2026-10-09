'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { MealItem } from '@/lib/data-store';
import {
  PlusCircle,
  Search,
  Flame,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Utensils,
  X,
} from 'lucide-react';

export default function AdminMenuPage() {
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Ayam' | 'Ikan' | 'Daging' | 'Seafood' | 'Roti'>('Ayam');
  const [formCalories, setFormCalories] = useState(450);
  const [formPrice, setFormPrice] = useState(30000);
  const [formDescription, setFormDescription] = useState('');
  const [formSchedule, setFormSchedule] = useState('Setiap Hari');
  const [formProtein, setFormProtein] = useState('35g');
  const [formFat, setFormFat] = useState('12g');
  const [formCarbs, setFormCarbs] = useState('45g');
  const [formImageUrl, setFormImageUrl] = useState('');

  const fetchMeals = async () => {
    try {
      const res = await fetch('/api/meals');
      const data = await res.json();
      if (data.success && data.data) {
        setMeals(data.data);
      }
    } catch {
      console.error('Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const openAddModal = () => {
    setEditingMeal(null);
    setFormName('');
    setFormCategory('Ayam');
    setFormCalories(450);
    setFormPrice(30000);
    setFormDescription('');
    setFormSchedule('Setiap Hari');
    setFormProtein('35g');
    setFormFat('12g');
    setFormCarbs('45g');
    setFormImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop');
    setIsModalOpen(true);
  };

  const openEditModal = (meal: MealItem) => {
    setEditingMeal(meal);
    setFormName(meal.name);
    setFormCategory(meal.category);
    setFormCalories(meal.calories);
    setFormPrice(meal.price);
    setFormDescription(meal.description);
    setFormSchedule(meal.schedule);
    setFormProtein(meal.nutrition.protein);
    setFormFat(meal.nutrition.fat);
    setFormCarbs(meal.nutrition.carbs);
    setFormImageUrl(meal.imageUrl);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeal) {
      // Update
      const res = await fetch(`/api/meals/${editingMeal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          category: formCategory,
          calories: formCalories,
          price: formPrice,
          description: formDescription,
          schedule: formSchedule,
          imageUrl: formImageUrl,
          nutrition: {
            calories: formCalories,
            protein: formProtein,
            fat: formFat,
            carbs: formCarbs,
          },
        }),
      });
      if (res.ok) fetchMeals();
    } else {
      // Create
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          category: formCategory,
          calories: formCalories,
          price: formPrice,
          description: formDescription,
          schedule: formSchedule,
          imageUrl: formImageUrl,
          nutrition: {
            calories: formCalories,
            protein: formProtein,
            fat: formFat,
            carbs: formCarbs,
          },
        }),
      });
      if (res.ok) fetchMeals();
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus menu katering ini?')) {
      const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMeals((prev) => prev.filter((m) => m.id !== id));
      }
    }
  };

  const toggleAvailability = async (meal: MealItem) => {
    const updated = !meal.isAvailable;
    await fetch(`/api/meals/${meal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: updated }),
    });
    setMeals((prev) =>
      prev.map((m) => (m.id === meal.id ? { ...m, isAvailable: updated } : m))
    );
  };

  const filteredMeals = meals.filter((meal) => {
    const matchCategory =
      categoryFilter === 'Semua' || meal.category === categoryFilter;
    const matchSearch =
      meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-800" />
            <span>Kelola Menu & Nilai Gizi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur galeri menu masakan harian, informasi gizi, jadwal rotasi masak, dan harga katering.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['Semua', 'Ayam', 'Ikan', 'Daging', 'Roti'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari menu masakan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Meals */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Memuat daftar menu...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              {/* Image & Category Pill */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-full">
                    {meal.category}
                  </span>
                  <button
                    onClick={() => toggleAvailability(meal)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs shadow-xs transition-colors ${
                      meal.isAvailable
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}
                  >
                    {meal.isAvailable ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Tersedia</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Habis</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-slate-900/80 text-white rounded text-[11px] font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{meal.calories} kkal</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{meal.name}</h3>
                    <span className="font-bold text-emerald-800 text-sm whitespace-nowrap">
                      Rp {meal.price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                    {meal.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Jadwal: <b className="text-slate-700">{meal.schedule}</b></span>
                  </div>

                  {/* Nutrition Badges */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                      <span className="text-slate-400 block">Protein</span>
                      <span className="font-bold text-slate-700">{meal.nutrition.protein}</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                      <span className="text-slate-400 block">Lemak</span>
                      <span className="font-bold text-slate-700">{meal.nutrition.fat}</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                      <span className="text-slate-400 block">Karbo</span>
                      <span className="font-bold text-slate-700">{meal.nutrition.carbs}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(meal)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-medium flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-sm">
                {editingMeal ? 'Edit Menu Masakan' : 'Tambah Menu Masakan Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Menu *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Grilled Salmon Bowl"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="Ayam">Ayam</option>
                    <option value="Ikan">Ikan</option>
                    <option value="Daging">Daging</option>
                    <option value="Seafood">Seafood</option>
                    <option value="Roti">Roti</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL Foto Makanan</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Kalori (kkal)</label>
                  <input
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jadwal Masak Harian</label>
                  <input
                    type="text"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    placeholder="Contoh: Setiap Hari Senin"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Nutrition */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 mb-2">Informasi Nilai Gizi</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Protein</label>
                    <input
                      type="text"
                      value={formProtein}
                      onChange={(e) => setFormProtein(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Lemak</label>
                    <input
                      type="text"
                      value={formFat}
                      onChange={(e) => setFormFat(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Karbo</label>
                    <input
                      type="text"
                      value={formCarbs}
                      onChange={(e) => setFormCarbs(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Komposisi Makanan</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold"
                >
                  {editingMeal ? 'Perbarui Menu' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
