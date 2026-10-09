'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Save,
  MessageSquare,
  Phone,
  BookOpen,
} from 'lucide-react';

type FaqCategory = 'Semua' | 'Langganan' | 'Pengiriman' | 'Pembayaran' | 'Menu';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: Exclude<FaqCategory, 'Semua'>;
  isActive: boolean;
  viewCount: number;
}

const initialFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Bagaimana cara mengubah alamat pengiriman langganan harian?',
    answer:
      'Pelanggan dapat mengubah alamat pengiriman melalui tab Jadwal atau halaman Langganan Saya di aplikasi. Perubahan harus dilakukan paling lambat pukul 20.00 WIB pada H-1 sebelum jadwal pengiriman berikutnya agar kurir dapat mengantar ke alamat yang baru.',
    category: 'Pengiriman',
    isActive: true,
    viewCount: 248,
  },
  {
    id: 'faq-2',
    question: 'Apakah menu katering NutriMeal bisa disesuaikan dengan alergi?',
    answer:
      'Tentu! Pelanggan bisa mengatur preferensi makanan, pantangan alergi (seperti seafood, gluten, kacang, dll.) di halaman Detail Data Profil. Selain itu, juga dapat menukar menu harian di tab Jadwal dengan catatan ke dapur.',
    category: 'Menu',
    isActive: true,
    viewCount: 312,
  },
  {
    id: 'faq-3',
    question: 'Kapan batas waktu pembatalan atau pause paket makan siang?',
    answer:
      'Fitur Jeda (Pause) langganan atau pengalihan jam kirim dapat dilakukan mandiri melalui aplikasi maksimal pukul 20.00 WIB pada hari sebelum pengiriman (H-1). Kuota makan tidak akan hangus dan akan dikembalikan ke saldo porsi aktif.',
    category: 'Langganan',
    isActive: true,
    viewCount: 189,
  },
  {
    id: 'faq-4',
    question: 'Metode pembayaran apa saja yang didukung NutriMeal?',
    answer:
      'NutriMeal menerima pembayaran QRIS Instant Pay (semua e-wallet & m-banking), GoPay, OVO, ShopeePay, Virtual Account (BCA, Mandiri, BRI, BNI), serta Kartu Kredit/Debit berlogo Visa dan Mastercard. Untuk pelanggan korporat, tersedia juga invoice bulanan.',
    category: 'Pembayaran',
    isActive: true,
    viewCount: 156,
  },
  {
    id: 'faq-5',
    question: 'Bagaimana jika makanan diterima terlambat atau tidak sesuai?',
    answer:
      'Kepuasan pelanggan adalah prioritas kami. Jika ada keterlambatan kurir lebih dari 30 menit atau pesanan tidak sesuai, pelanggan dapat menghubungi CS NutriCare kami melalui chat di aplikasi. Admin dapat memproses garansi penggantian instan.',
    category: 'Pengiriman',
    isActive: true,
    viewCount: 203,
  },
  {
    id: 'faq-6',
    question: 'Bagaimana cara berlangganan paket katering mingguan?',
    answer:
      'Pelanggan dapat memilih paket langganan di menu Langganan Katalog pada aplikasi. Tersedia pilihan Paket Mingguan Trial, Paket Bulanan Lengkap, dan Paket Hemat Siang. Setelah memilih paket, akan diarahkan ke proses checkout dan pembayaran.',
    category: 'Langganan',
    isActive: true,
    viewCount: 421,
  },
  {
    id: 'faq-7',
    question: 'Apakah ada diskon untuk pemesanan dalam jumlah banyak (korporat)?',
    answer:
      'Ya! Untuk pelanggan korporat dengan minimal 10 box per hari, NutriMeal memberikan diskon khusus 10-20% tergantung volume. Silakan hubungi tim sales kami melalui chat untuk mendapatkan penawaran terbaik.',
    category: 'Pembayaran',
    isActive: true,
    viewCount: 87,
  },
  {
    id: 'faq-8',
    question: 'Berapa lama masa berlaku paket langganan?',
    answer:
      'Masa berlaku paket sesuai jenis yang dipilih: Paket Mingguan berlaku 7 hari, Paket Bulanan berlaku 30 hari. Paket bisa diperpanjang otomatis (auto-renew) yang bisa diaktifkan/nonaktifkan di halaman Langganan Saya.',
    category: 'Langganan',
    isActive: false,
    viewCount: 134,
  },
];

const categories: FaqCategory[] = ['Semua', 'Langganan', 'Pengiriman', 'Pembayaran', 'Menu'];

const categoryColors: Record<string, string> = {
  Langganan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pengiriman: 'bg-sky-50 text-sky-700 border-sky-200',
  Pembayaran: 'bg-purple-50 text-purple-700 border-purple-200',
  Menu: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [categoryFilter, setCategoryFilter] = useState<FaqCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [formQ, setFormQ] = useState('');
  const [formA, setFormA] = useState('');
  const [formCat, setFormCat] = useState<Exclude<FaqCategory, 'Semua'>>('Langganan');

  const filtered = faqs.filter((faq) => {
    const matchCat = categoryFilter === 'Semua' || faq.category === categoryFilter;
    const matchSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAddModal = () => {
    setEditingFaq(null);
    setFormQ('');
    setFormA('');
    setFormCat('Langganan');
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormQ(faq.question);
    setFormA(faq.answer);
    setFormCat(faq.category);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formQ.trim() || !formA.trim()) return;
    if (editingFaq) {
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === editingFaq.id ? { ...f, question: formQ, answer: formA, category: formCat } : f
        )
      );
    } else {
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        question: formQ,
        answer: formA,
        category: formCat,
        isActive: true,
        viewCount: 0,
      };
      setFaqs((prev) => [newFaq, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus FAQ ini dari aplikasi pelanggan?')) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f))
    );
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-800" />
            <span>Kelola FAQ & Bantuan Pelanggan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur pertanyaan umum yang tampil di halaman Bantuan pada aplikasi pelanggan mobile NutriMeal.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>Tambah FAQ Baru</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5">
          <p className="text-[11px] text-slate-500 font-semibold">Total FAQ</p>
          <p className="text-xl font-black text-slate-900 mt-1">{faqs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5">
          <p className="text-[11px] text-slate-500 font-semibold">FAQ Aktif</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{faqs.filter((f) => f.isActive).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5">
          <p className="text-[11px] text-slate-500 font-semibold">Total Views</p>
          <p className="text-xl font-black text-slate-900 mt-1">
            {faqs.reduce((acc, f) => acc + f.viewCount, 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5">
          <p className="text-[11px] text-slate-500 font-semibold">FAQ Nonaktif</p>
          <p className="text-xl font-black text-amber-600 mt-1">{faqs.filter((f) => !f.isActive).length}</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
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
            placeholder="Cari pertanyaan atau jawaban..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-2.5">
        {filtered.map((faq) => (
          <div
            key={faq.id}
            className={`bg-white rounded-xl border shadow-xs overflow-hidden transition-all ${
              !faq.isActive ? 'border-slate-200/60 opacity-60' : 'border-slate-200/80'
            }`}
          >
            <div
              className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50/60"
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[faq.category]}`}
                  >
                    {faq.category}
                  </span>
                  {!faq.isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Nonaktif
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {faq.viewCount}x dilihat
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-snug">{faq.question}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(faq);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(faq.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {expandedId === faq.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {expandedId === faq.id && (
              <div className="px-4 pb-4 border-t border-slate-100">
                <p className="text-xs text-slate-600 leading-relaxed mt-3">{faq.answer}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => toggleActive(faq.id)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      faq.isActive
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {faq.isActive ? 'Nonaktifkan FAQ' : 'Aktifkan FAQ'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Tidak ada FAQ ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>

      {/* CS Contact Card */}
      <div className="bg-emerald-900 text-white rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-sm">Butuh Bantuan Lebih Lanjut?</p>
          <p className="text-xs text-emerald-200 mt-0.5">
            Pelanggan yang tidak menemukan jawaban di FAQ dapat menghubungi CS NutriCare langsung.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/admin/chat"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Buka Chat CS</span>
          </a>
          <a
            href="tel:+6281288901122"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hotline CS</span>
          </a>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-800" />
                {editingFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kategori FAQ *</label>
                <select
                  value={formCat}
                  onChange={(e) => setFormCat(e.target.value as Exclude<FaqCategory, 'Semua'>)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
                >
                  {(['Langganan', 'Pengiriman', 'Pembayaran', 'Menu'] as const).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pertanyaan *</label>
                <input
                  type="text"
                  value={formQ}
                  onChange={(e) => setFormQ(e.target.value)}
                  placeholder="Contoh: Bagaimana cara mengubah alamat pengiriman?"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jawaban *</label>
                <textarea
                  rows={4}
                  value={formA}
                  onChange={(e) => setFormA(e.target.value)}
                  placeholder="Tulis jawaban yang jelas dan mudah dipahami pelanggan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formQ.trim() || !formA.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingFaq ? 'Perbarui FAQ' : 'Simpan FAQ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
