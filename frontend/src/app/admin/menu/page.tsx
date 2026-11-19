'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  UploadCloud,
  Link as LinkIcon,
  Loader2,
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
  const [formDiscountPercent, setFormDiscountPercent] = useState<number>(0);
  const [formTags, setFormTags] = useState('');
  const [formDeliveryTime, setFormDeliveryTime] = useState('12:00 - 13:00 WIB');
  const [formDescription, setFormDescription] = useState('');
  const [formSchedule, setFormSchedule] = useState('Setiap Hari');
  const [formProtein, setFormProtein] = useState('35g');
  const [formFat, setFormFat] = useState('12g');
  const [formCarbs, setFormCarbs] = useState('45g');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Upload states
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar berformat PNG, JPG, JPEG, atau WEBP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 10MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setFormImageUrl(data.imageUrl);
      } else {
        alert(data.message || 'Gagal mengunggah gambar ke server.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Terjadi kesalahan koneksi saat mengunggah gambar.');
    } finally {
      setUploadingImage(false);
    }
  };

  const openAddModal = () => {
    setEditingMeal(null);
    setFormName('');
    setFormCategory('Ayam');
    setFormCalories(450);
    setFormPrice(30000);
    setFormDiscountPercent(0);
    setFormTags('Dada Ayam Panggang, Brokoli Kukus');
    setFormDeliveryTime('12:00 - 13:00 WIB');
    setFormDescription('');
    setFormSchedule('Setiap Hari');
    setFormProtein('35g');
    setFormFat('12g');
    setFormCarbs('45g');
    setFormImageUrl('');
    setImagePreview('');
    setImageFile(null);
    setImageSourceMode('upload');
    setIsModalOpen(true);
  };

  const openEditModal = (meal: MealItem) => {
    setEditingMeal(meal);
    setFormName(meal.name);
    setFormCategory(meal.category);
    setFormCalories(meal.calories);
    setFormPrice(meal.price);
    setFormDiscountPercent(meal.discountPercent || 0);
    setFormTags(meal.tags && meal.tags.length > 0 ? meal.tags.join(', ') : '');
    setFormDeliveryTime(meal.deliveryTime || '12:00 - 13:00 WIB');
    setFormDescription(meal.description);
    setFormSchedule(meal.schedule);
    setFormProtein(meal.nutrition?.protein || (meal as any).protein || '35g');
    setFormFat(meal.nutrition?.fat || (meal as any).fat || '12g');
    setFormCarbs(meal.nutrition?.carbs || (meal as any).carbs || '45g');
    const currentImg = meal.imageUrl || (meal as any).image_url || '';
    setFormImageUrl(currentImg);
    setImagePreview(currentImg);
    setImageFile(null);
    setImageSourceMode(currentImg.startsWith('http') ? 'url' : 'upload');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const finalImageUrl =
      formImageUrl ||
      imagePreview ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';

    const payload = {
      name: formName,
      category: formCategory,
      calories: formCalories,
      price: formPrice,
      discountPercent: formDiscountPercent > 0 ? formDiscountPercent : undefined,
      tags: parsedTags,
      deliveryTime: formDeliveryTime,
      description: formDescription,
      schedule: formSchedule,
      imageUrl: finalImageUrl,
      image_url: finalImageUrl,
      nutrition: {
        calories: formCalories,
        protein: formProtein,
        fat: formFat,
        carbs: formCarbs,
      },
    };

    if (editingMeal) {
      const res = await fetch(`/api/meals/${editingMeal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) fetchMeals();
    } else {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meal.tags && meal.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchCategory && matchSearch;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-800" />
            <span>Kelola Menu &amp; Nilai Gizi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur galeri menu masakan harian, diskon promo, tag bahan gizi, jadwal rotasi masak, dan estimasi waktu kirim katering (Sinkron dengan Aplikasi Mobile NutriMeal).
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
          {['Semua', 'Ayam', 'Ikan', 'Daging', 'Seafood', 'Roti'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="search"
            placeholder="Cari nama menu atau bahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Meals Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-700" />
          <p>Memuat data menu...</p>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Utensils className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Tidak ada menu ditemukan.</p>
          <p className="text-xs mt-1">Tambahkan menu baru atau ubah filter pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMeals.map((meal) => {
            const hasDiscount = (meal.discountPercent ?? 0) > 0;
            const originalPrice = hasDiscount
              ? Math.round(meal.price / (1 - (meal.discountPercent ?? 0) / 100))
              : meal.price;

            return (
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
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-full">
                      {meal.category}
                    </span>
                    {hasDiscount && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full shadow-xs">
                        -{meal.discountPercent}% PROMO
                      </span>
                    )}
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
                      <div className="text-right">
                        <span className="font-bold text-emerald-800 text-sm whitespace-nowrap block">
                          Rp {meal.price.toLocaleString('id-ID')}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            Rp {originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                      {meal.description}
                    </p>

                    {/* Tags (Matching Mobile App) */}
                    {meal.tags && meal.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {meal.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Jadwal: <b className="text-slate-700">{meal.schedule}</b></span>
                      </div>
                      {meal.deliveryTime && (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {meal.deliveryTime}
                        </span>
                      )}
                    </div>

                    {/* Nutrition Badges */}
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="text-slate-400 block">Protein</span>
                        <span className="font-bold text-slate-700">{meal.nutrition?.protein || (meal as any).protein || '30g'}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="text-slate-400 block">Lemak</span>
                        <span className="font-bold text-slate-700">{meal.nutrition?.fat || (meal as any).fat || '10g'}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="text-slate-400 block">Karbo</span>
                        <span className="font-bold text-slate-700">{meal.nutrition?.carbs || (meal as any).carbs || '40g'}</span>
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
            );
          })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Diskon Promo (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formDiscountPercent}
                    onChange={(e) => setFormDiscountPercent(Number(e.target.value))}
                    placeholder="Contoh: 20 (kosongkan jika tidak ada)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimasi Pengantaran</label>
                  <input
                    type="text"
                    value={formDeliveryTime}
                    onChange={(e) => setFormDeliveryTime(e.target.value)}
                    placeholder="Contoh: 12:00 - 13:00 WIB"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tag Komposisi &amp; Gizi (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Contoh: Dada Ayam Panggang, Brokoli Kukus, Tinggi Protein"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Image Input Section (Upload dari Device / URL Link) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700 block">
                    Foto Menu Masakan *
                  </label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        imageSourceMode === 'upload'
                          ? 'bg-white text-emerald-800 shadow-xs font-bold'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        imageSourceMode === 'url'
                          ? 'bg-white text-emerald-800 shadow-xs font-bold'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Link URL</span>
                    </button>
                  </div>
                </div>

                {imageSourceMode === 'upload' ? (
                  <div className="space-y-2.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 p-4 rounded-xl cursor-pointer text-center transition-all group"
                    >
                      {uploadingImage ? (
                        <div className="py-2 flex flex-col items-center justify-center gap-2 text-emerald-800">
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                          <span className="text-xs font-semibold">Mengunggah gambar dari device...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Pilih gambar dari folder laptop / komputer Anda
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Mendukung PNG, JPG, JPEG, atau WEBP (Maksimal 10MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {imagePreview && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 relative border border-slate-300 shrink-0">
                          <img
                            src={imagePreview}
                            alt="Preview Menu"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-800 truncate">
                              {imageFile ? imageFile.name : (formImageUrl.startsWith('/uploads') ? formImageUrl.split('/').pop() : 'Foto Terpasang')}
                            </span>
                            {formImageUrl.startsWith('/uploads') && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                Tersimpan di Backend
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {formImageUrl || 'File lokal siap diunggah'}
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline block"
                          >
                            Ganti dengan file lain
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">URL Foto Makanan</label>
                    <input
                      type="url"
                      name="image_url"
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                    {formImageUrl && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <img
                          src={formImageUrl}
                          alt="Preview Link"
                          className="w-10 h-10 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="text-[11px] text-slate-500 truncate">Preview Gambar dari Link</span>
                      </div>
                    )}
                  </div>
                )}
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
