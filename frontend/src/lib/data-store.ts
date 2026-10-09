// Central Data Store for NutriMeal Backend & UMKM Dashboard Operations

export interface NutritionInfo {
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
}

export interface MealItem {
  id: string;
  name: string;
  category: 'Ayam' | 'Ikan' | 'Daging' | 'Seafood' | 'Roti';
  calories: number;
  price: number;
  discountPercent?: number;
  imageUrl: string;
  description: string;
  tags: string[];
  schedule: string;
  deliveryTime: string;
  nutrition: NutritionInfo;
  isAvailable: boolean;
}

export interface CateringPackage {
  id: string;
  name: string;
  type: 'Harian' | 'Mingguan' | 'Bulanan' | 'Prasmanan / Event';
  description: string;
  price: number;
  portions: string;
  portionCount: number;
  targetAudience: 'Personal' | 'Korporat / Kantor' | 'Keluarga';
  salesCount: number;
  percentage: number;
  color: string;
  includedMeals: string[];
}

export type OrderStatus = 'Diterima' | 'Diproses' | 'Dikirim' | 'Selesai';

export type CustomerType = 'Personal' | 'Korporat / Kantor' | 'Keluarga';

export interface CateringOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerType: CustomerType;
  packageName: string;
  packageDetail: string;
  deliverySchedule: string;
  deliveryBatch: 'Pagi/Siang' | 'Sore/Malam';
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  notes?: string;
  day?: string; // 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'
  addressDetail?: string; // e.g. 'Jakarta Selatan • Titip Resepsionis'
  menuName?: string; // e.g. 'Grilled Chicken + Salad Brokoli'
  menuDetail?: string; // e.g. 'Nasi Merah Organik • Less Oil (1 Porsi)'
  portionsCount?: number;
  paymentMethod?: string; // e.g. 'Bank Transfer (BCA KlikPay)'
  paymentStatus?: 'Lunas' | 'Menunggu Pembayaran' | 'COD';
  courierName?: string;
  courierNotes?: string;
  kitchenNotes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: CustomerType;
  companyName?: string;
  totalOrders: number;
  totalSpent: number;
  activeSubscription?: string;
  joinedDate: string;
  allergies?: string[];
  dietaryGoals?: string[];
  targetCalories?: number;
}

export type VoucherDiscountType = 'nominal' | 'percent' | 'free_shipping' | 'cashback';

export interface VoucherPromo {
  id: string;
  code: string;
  title: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minSpend: number;
  categoryTag: string;
  badgeText?: string;
  isActive: boolean;
  quota: number;
  usedCount: number;
  validUntil: string;
}

export interface ActiveSubscription {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  mealSlot: 'Makan Siang' | 'Makan Malam' | 'Siang & Malam' | 'Full Day (3x)';
  deliveryTimeSlot: string; // e.g. '11.30 – 13.00 WIB (Slot Utama)'
  startDate: string;
  endDate: string;
  daysRemaining: number;
  totalDays: number;
  status: 'Aktif' | 'Dijeda' | 'Selesai';
  pauseReason?: string;
  autoRenew: boolean;
  address: string;
}

// Initial In-Memory State
class NutriMealDatabase {
  private static instance: NutriMealDatabase;

  public meals: MealItem[] = [
    {
      id: 'item-1',
      name: 'Grilled Chicken',
      category: 'Ayam',
      calories: 450,
      price: 20000,
      discountPercent: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop',
      description:
        'Juicy Grilled Chicken, Grilled potato, Fresh Broccoli, seasoning parmesan Cheese',
      tags: [
        'Dada Ayam Panggang',
        'Brokoli Kukus',
        'Parmesan Cheese',
        'Wortel Serut',
        'Dressing Wijen',
      ],
      schedule: 'Setiap Hari Senin',
      deliveryTime: '12:00 - 13:00 WIB',
      nutrition: {
        calories: 520,
        protein: '35gram',
        fat: '12gram',
        carbs: '55gram',
      },
      isAvailable: true,
    },
    {
      id: 'item-2',
      name: 'Pepes Tongkol',
      category: 'Ikan',
      calories: 380,
      price: 45000,
      imageUrl:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      description:
        'Pepes ikan tongkol bumbu rempah kuning kaya antioksidan dan omega-3 disajikan hangat.',
      tags: ['Ikan Tongkol Segar', 'Kemangi', 'Kunyit', 'Cabai Merah', 'Nasi Merah'],
      schedule: 'Setiap Hari Selasa',
      deliveryTime: '12:00 - 13:00 WIB',
      nutrition: {
        calories: 380,
        protein: '38gram',
        fat: '10gram',
        carbs: '30gram',
      },
      isAvailable: true,
    },
    {
      id: 'item-3',
      name: 'Chicken Salad',
      category: 'Ayam',
      calories: 320,
      price: 30000,
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
      description:
        'Fresh green salad dengan irisan dada ayam bakar lembut, tomat ceri, dan dressing zaitun rendah kalori.',
      tags: ['Dada Ayam', 'Romaine Lettuce', 'Tomat Ceri', 'Mentimun', 'Olive Oil'],
      schedule: 'Setiap Hari Rabu',
      deliveryTime: '12:00 - 13:00 WIB',
      nutrition: {
        calories: 320,
        protein: '32gram',
        fat: '8gram',
        carbs: '22gram',
      },
      isAvailable: true,
    },
    {
      id: 'item-4',
      name: 'Beef Veggie',
      category: 'Daging',
      calories: 520,
      price: 40000,
      imageUrl:
        'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
      description:
        'Tumis daging sapi lada hitam rendah lemak dipadu paprika renyah dan brokoli segar bernutrisi tinggi.',
      tags: ['Daging Sapi Lean', 'Paprika Merah & Hijau', 'Brokoli', 'Bawang Bombay'],
      schedule: 'Setiap Hari Kamis',
      deliveryTime: '12:00 - 13:00 WIB',
      nutrition: {
        calories: 520,
        protein: '42gram',
        fat: '15gram',
        carbs: '40gram',
      },
      isAvailable: true,
    },
    {
      id: 'item-5',
      name: 'Ayam Bowl',
      category: 'Ayam',
      calories: 520,
      price: 28000,
      imageUrl:
        'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800&auto=format&fit=crop',
      description:
        'Healthy poke bowl dengan suwiran ayam gurih, jagung manis, kubis ungu, dan edamame segar.',
      tags: ['Suwir Ayam', 'Jagung Manis', 'Kubis Ungu', 'Edamame', 'Nasi Coklat'],
      schedule: 'Setiap Hari Jumat',
      deliveryTime: '12:00 - 13:00 WIB',
      nutrition: {
        calories: 520,
        protein: '36gram',
        fat: '14gram',
        carbs: '58gram',
      },
      isAvailable: true,
    },
    {
      id: 'item-6',
      name: 'Chicken Wrap',
      category: 'Roti',
      calories: 350,
      price: 28000,
      imageUrl:
        'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop',
      description:
        'Tortilla bayam lembut membungkus ayam panggang, selada renyah, dan saus yoghurt herbs.',
      tags: ['Tortilla Bayam', 'Ayam Panggang', 'Selada', 'Yoghurt Dressing'],
      schedule: 'Setiap Hari Sabtu',
      deliveryTime: '12:00 - 13:00 WIB',
      nutrition: {
        calories: 350,
        protein: '28gram',
        fat: '11gram',
        carbs: '38gram',
      },
      isAvailable: true,
    },
  ];

  public packages: CateringPackage[] = [
    {
      id: 'pkg-1',
      name: 'Paket Sehat Diet',
      type: 'Mingguan',
      description:
        'Paket makanan sehat defisit kalori seimbang dengan kontrol karbohidrat dan protein tinggi.',
      price: 350000,
      portions: '10 Porsi (Makan Siang & Malam)',
      portionCount: 600,
      targetAudience: 'Personal',
      salesCount: 600,
      percentage: 42,
      color: '#059669', // Emerald
      includedMeals: ['Grilled Chicken', 'Chicken Salad', 'Chicken Wrap'],
    },
    {
      id: 'pkg-2',
      name: 'Paket Makan Siang Kantor',
      type: 'Harian',
      description:
        'Solusi makan siang bergizi untuk tim perusahaan dengan porsi pas dan higienis.',
      price: 525000,
      portions: '15 Box Prasmanan Mini',
      portionCount: 443,
      targetAudience: 'Korporat / Kantor',
      salesCount: 443,
      percentage: 31,
      color: '#0284c7', // Sky blue
      includedMeals: ['Beef Veggie', 'Ayam Bowl', 'Grilled Chicken'],
    },
    {
      id: 'pkg-3',
      name: 'Paket Family 5 Hari',
      type: 'Mingguan',
      description:
        'Menu santap bersama keluarga untuk 4 orang setiap hari Senin hingga Jumat.',
      price: 680000,
      portions: 'Lengkap 4 Porsi Keluarga',
      portionCount: 257,
      targetAudience: 'Keluarga',
      salesCount: 257,
      percentage: 18,
      color: '#d97706', // Amber
      includedMeals: ['Pepes Tongkol', 'Beef Veggie', 'Ayam Bowl'],
    },
    {
      id: 'pkg-4',
      name: 'Prasmanan / Event Rapat',
      type: 'Prasmanan / Event',
      description:
        'Layanan katering prasmanan buffet set lengkap untuk meeting, seminar, dan event kantor.',
      price: 1125000,
      portions: '25 Porsi Buffet Set',
      portionCount: 128,
      targetAudience: 'Korporat / Kantor',
      salesCount: 128,
      percentage: 9,
      color: '#dc2626', // Red
      includedMeals: ['Grilled Chicken', 'Beef Veggie', 'Pepes Tongkol', 'Chicken Salad'],
    },
    {
      id: 'pkg-5',
      name: 'Paket Diet Harian Fleksibel',
      type: 'Harian',
      description: 'Pesan per-hari tanpa komitmen langganan untuk menjaga pola makan.',
      price: 45000,
      portions: '1 Porsi Lengkap',
      portionCount: 95,
      targetAudience: 'Personal',
      salesCount: 95,
      percentage: 6,
      color: '#7c3aed', // Purple
      includedMeals: ['Chicken Salad'],
    },
  ];

  public orders: CateringOrder[] = [
    {
      id: 'ORD-2025091',
      customerName: 'Rian Kusuma',
      customerPhone: '+62 812-4491-0021',
      customerAddress: 'Sudirman Tower Lt. 12, Unit 1205',
      addressDetail: 'Jakarta Selatan • Titip Resepsionis',
      customerType: 'Personal',
      packageName: 'Paket Diet Harian Fleksibel',
      packageDetail: '1 Porsi (Makan Siang)',
      menuName: 'Grilled Chicken + Salad Brokoli',
      menuDetail: 'Nasi Merah Organik • Less Oil (1 Porsi)',
      portionsCount: 1,
      deliverySchedule: '11:30 - 13:00 WIB',
      deliveryBatch: 'Pagi/Siang',
      day: 'Senin',
      status: 'Dikirim',
      totalPrice: 45000,
      paymentMethod: 'Bank Transfer (BCA KlikPay)',
      paymentStatus: 'Lunas',
      courierName: 'Budi Santoso - Motor 01',
      courierNotes: 'Titipkan paket ke resepsionis lobby utama lantai 12',
      kitchenNotes: 'Dressing wijen disendiri/terpisah, Less Oil',
      createdAt: '2026-10-05T08:30:00Z',
    },
    {
      id: 'ORD-2025092',
      customerName: 'Amanda Wijaya',
      customerPhone: '+62 821-9980-1123',
      customerAddress: 'SCBD Suites Tower 2, Unit 08A',
      addressDetail: 'Jakarta Pusat • Diantar ke Lobby',
      customerType: 'Korporat / Kantor',
      packageName: 'Paket Makan Siang Kantor',
      packageDetail: '2 Box Makan Siang',
      menuName: 'Grilled Chicken + Salad Brokoli',
      menuDetail: 'Nasi Merah Organik • Less Oil (2 Porsi)',
      portionsCount: 2,
      deliverySchedule: '11:30 - 13:00 WIB',
      deliveryBatch: 'Pagi/Siang',
      day: 'Senin',
      status: 'Diproses',
      totalPrice: 90000,
      paymentMethod: 'Bank Transfer (BCA VA)',
      paymentStatus: 'Lunas',
      courierName: 'Budi Santoso - Motor 01',
      courierNotes: 'Hubungi via WhatsApp sebelum tiba di lobby barat',
      kitchenNotes: 'Pastikan sendok dan garpu kayu lengkap 2 set',
      createdAt: '2026-10-05T08:45:00Z',
    },
    {
      id: 'ORD-2025093',
      customerName: 'Bambang Prakoso',
      customerPhone: '+62 813-7720-9944',
      customerAddress: 'Jl. Kuningan Barat IX No. 44',
      addressDetail: 'Mampang Prapatan • Pagar Hitam',
      customerType: 'Personal',
      packageName: 'Paket Diet Sehat Mingguan',
      packageDetail: '3 Porsi Makan Siang Keluarga',
      menuName: 'Grilled Chicken + Salad Brokoli',
      menuDetail: 'Nasi Merah Organik • Less Oil (3 Porsi)',
      portionsCount: 3,
      deliverySchedule: '11:30 - 13:00 WIB',
      deliveryBatch: 'Pagi/Siang',
      day: 'Senin',
      status: 'Diproses',
      totalPrice: 135000,
      paymentMethod: 'QRIS (ShopeePay)',
      paymentStatus: 'Lunas',
      courierName: 'Budi Santoso - Motor 01',
      courierNotes: 'Pagar hitam, gantung di cantolan pagar depan jika bell tidak direspon',
      kitchenNotes: 'Tanpa bawang goreng di salad',
      createdAt: '2026-10-05T09:00:00Z',
    },
    {
      id: 'ORD-2025094',
      customerName: 'Anita Wijaya',
      customerPhone: '+62 811-2300-881',
      customerAddress: 'Perumahan Kemang Pratama 3 Blok F No. 12',
      addressDetail: 'Bekasi Selatan • Diterima ART',
      customerType: 'Keluarga',
      packageName: 'Paket Family Sehat',
      packageDetail: '1 Porsi Makan Malam',
      menuName: 'Dada Ayam Panggang Wortel Serut',
      menuDetail: 'Kukus Labu Siam & Jagung (1 Porsi)',
      portionsCount: 1,
      deliverySchedule: '17:00 - 18:30 WIB',
      deliveryBatch: 'Sore/Malam',
      day: 'Senin',
      status: 'Diterima',
      totalPrice: 52000,
      paymentMethod: 'Bank Transfer (BCA VA)',
      paymentStatus: 'Lunas',
      courierName: 'Ahmad Fauzi - Motor 02',
      courierNotes: 'Serahkan langsung ke ART (Mbak Siti)',
      kitchenNotes: 'Kuah kaldu labu siam dikemas dalam pouch hangat tersendiri',
      createdAt: '2026-10-05T10:15:00Z',
    },
    {
      id: 'ORD-2025095',
      customerName: 'dr. Hendra Salim',
      customerPhone: '+62 856-1109-3321',
      customerAddress: 'Pondok Indah Golf Apartment Tower 1 Unit 15C',
      addressDetail: 'Jakarta Selatan • Khusus Medical Diet',
      customerType: 'Personal',
      packageName: 'Paket Medical Diet',
      packageDetail: '2 Porsi Makan Malam Rendah Garam',
      menuName: 'Dada Ayam Panggang Wortel Serut',
      menuDetail: 'Kukus Labu Siam & Jagung (2 Porsi)',
      portionsCount: 2,
      deliverySchedule: '17:00 - 18:30 WIB',
      deliveryBatch: 'Sore/Malam',
      day: 'Senin',
      status: 'Diterima',
      totalPrice: 104000,
      paymentMethod: 'E-Wallet (GoPay)',
      paymentStatus: 'Lunas',
      courierName: 'Ahmad Fauzi - Motor 02',
      courierNotes: 'Khusus paket medical diet steril, jangan ditumpuk barang lain',
      kitchenNotes: 'Sangat rendah natrium / garam maksimal 2g',
      createdAt: '2026-10-05T11:00:00Z',
    },
    {
      id: 'ORD-2025096',
      customerName: 'Jessica Natalie',
      customerPhone: '+62 818-0922-3114',
      customerAddress: 'Apartemen Cosmo Park Thamrin City Lt. 10',
      addressDetail: 'Jakarta Pusat • Titip Security Lobby',
      customerType: 'Personal',
      packageName: 'Paket Diet Sehat Mingguan',
      packageDetail: '1 Porsi Makan Siang',
      menuName: 'Pepes Tongkol Bumbu Kuning',
      menuDetail: 'Nasi Merah Organik + Sayur Asem Bening (1 Porsi)',
      portionsCount: 1,
      deliverySchedule: '11:30 - 13:00 WIB',
      deliveryBatch: 'Pagi/Siang',
      day: 'Selasa',
      status: 'Diterima',
      totalPrice: 48000,
      paymentMethod: 'QRIS (GoPay)',
      paymentStatus: 'Lunas',
      courierName: 'Budi Santoso - Motor 01',
      courierNotes: 'Titip security lobby Cosmo Park',
      kitchenNotes: 'Pedas sedang',
      createdAt: '2026-10-05T12:00:00Z',
    },
    {
      id: 'ORD-2025097',
      customerName: 'Dimas Wicaksono',
      customerPhone: '+62 812-7788-9900',
      customerAddress: 'Wisma Nusantara Lt. 18, Jl. MH Thamrin',
      addressDetail: 'Jakarta Pusat • Security Pintu Selatan',
      customerType: 'Korporat / Kantor',
      packageName: 'Paket Makan Siang Kantor',
      packageDetail: '5 Box Bento Sehat',
      menuName: 'Beef Teriyaki Rendah Lemak + Brokoli',
      menuDetail: 'Nasi Shirataki & Tumis Jagung Manis (5 Porsi)',
      portionsCount: 5,
      deliverySchedule: '11:30 - 13:00 WIB',
      deliveryBatch: 'Pagi/Siang',
      day: 'Selasa',
      status: 'Diproses',
      totalPrice: 275000,
      paymentMethod: 'Bank Transfer (Mandiri)',
      paymentStatus: 'Lunas',
      courierName: 'Budi Santoso - Motor 01',
      courierNotes: 'Pengiriman untuk meeting direksi jam 12:00',
      kitchenNotes: 'Sertakan tissue basah dan kartu menu kalori',
      createdAt: '2026-10-05T12:30:00Z',
    },
  ];

  public customers: Customer[] = [
    {
      id: 'cst-1',
      name: 'Dimas Pratama',
      email: 'dimas.pratama@gmail.com',
      phone: '0812-8890-1122',
      address: 'Jl. Soekarno Hatta No. 45, Lowokwaru, Malang',
      type: 'Personal',
      totalOrders: 14,
      totalSpent: 4200000,
      activeSubscription: 'Paket Diet Sehat Mingguan',
      joinedDate: '2024-03-15',
      allergies: ['Kacang Tanah', 'Udang / Seafood'],
      dietaryGoals: ['Defisit Kalori', 'Tinggi Protein'],
      targetCalories: 1650,
    },
    {
      id: 'cst-2',
      name: 'Amanda Putri',
      email: 'amanda.putri@kantor.co.id',
      phone: '0858-7702-9901',
      address: 'Gedung Graha Pena Lt. 4, Jl. Ahmad Yani, Malang',
      type: 'Korporat / Kantor',
      companyName: 'PT Digita Kreasi Nusa',
      totalOrders: 28,
      totalSpent: 14700000,
      activeSubscription: 'Paket Makan Siang Kantor',
      joinedDate: '2024-01-10',
      allergies: ['Gluten (Celiac)'],
      dietaryGoals: ['Clean Eating', 'Less Oil & Low Sodium'],
      targetCalories: 1400,
    },
    {
      id: 'cst-3',
      name: 'Dr. Rio Wicaksono',
      email: 'rio.wicaksono@rsud.ac.id',
      phone: '0819-3331-4455',
      address: 'Perumahan Permata Jingga Blok D-12, Malang',
      type: 'Personal',
      totalOrders: 8,
      totalSpent: 5440000,
      activeSubscription: 'Paket Family 5 Hari',
      joinedDate: '2024-06-01',
      allergies: ['None / Tidak Ada'],
      dietaryGoals: ['Gizi Seimbang Keluarga', 'Organic Only'],
      targetCalories: 2100,
    },
    {
      id: 'cst-4',
      name: 'Citra Kirana',
      email: 'citra.procurement@majubersama.com',
      phone: '0821-6577-8898',
      address: 'Kawasan Industri Arjosari Malang',
      type: 'Korporat / Kantor',
      companyName: 'PT Maju Bersama',
      totalOrders: 42,
      totalSpent: 48500000,
      activeSubscription: 'Prasmanan Rapat Kantor',
      joinedDate: '2023-11-20',
      allergies: ['None / Tidak Ada'],
      dietaryGoals: ['Halal Certified', 'Executive Healthy Bento'],
      targetCalories: 1800,
    },
    {
      id: 'cst-5',
      name: 'Kevin Tan',
      email: 'kevin.tan99@gmail.com',
      phone: '0877-6411-2233',
      address: 'Apartemen Begawan Lt. 12 No. 04, Malang',
      type: 'Personal',
      totalOrders: 6,
      totalSpent: 1110000,
      activeSubscription: 'Paket Diet Sehat Mingguan',
      joinedDate: '2024-08-12',
      allergies: ['Laktosa / Susu Sapi'],
      dietaryGoals: ['Muscle Building', 'High Protein (120g/hari)'],
      targetCalories: 2200,
    },
  ];

  // Meals
  public getMeals(filter?: { category?: string; search?: string }) {
    let list = [...this.meals];
    if (filter?.category && filter.category !== 'Semua') {
      list = list.filter(
        (m) => m.category.toLowerCase() === filter.category!.toLowerCase()
      );
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getMealById(id: string) {
    return this.meals.find((m) => m.id === id);
  }

  public createMeal(data: Omit<MealItem, 'id'>) {
    const newItem: MealItem = {
      id: `item-${Date.now()}`,
      ...data,
    };
    this.meals.unshift(newItem);
    return newItem;
  }

  public updateMeal(id: string, data: Partial<MealItem>) {
    const index = this.meals.findIndex((m) => m.id === id);
    if (index === -1) return null;
    this.meals[index] = { ...this.meals[index], ...data };
    return this.meals[index];
  }

  public deleteMeal(id: string) {
    const index = this.meals.findIndex((m) => m.id === id);
    if (index === -1) return false;
    this.meals.splice(index, 1);
    return true;
  }

  // Packages
  public getPackages() {
    return [...this.packages];
  }

  public getPackageById(id: string) {
    return this.packages.find((p) => p.id === id);
  }

  public createPackage(data: Omit<CateringPackage, 'id'>) {
    const newPkg: CateringPackage = {
      id: `pkg-${Date.now()}`,
      ...data,
    };
    this.packages.push(newPkg);
    return newPkg;
  }

  public updatePackage(id: string, data: Partial<CateringPackage>) {
    const index = this.packages.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.packages[index] = { ...this.packages[index], ...data };
    return this.packages[index];
  }

  public deletePackage(id: string) {
    const index = this.packages.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.packages.splice(index, 1);
    return true;
  }

  // Orders
  public getOrders(filter?: { status?: string; search?: string; batch?: string; day?: string }) {
    let list = [...this.orders];
    if (filter?.status && filter.status !== 'Semua') {
      list = list.filter((o) => o.status === filter.status);
    }
    if (filter?.batch && filter.batch !== 'Semua') {
      list = list.filter((o) => o.deliveryBatch === filter.batch);
    }
    if (filter?.day && filter.day !== 'Semua' && filter.day !== 'Semua Hari') {
      list = list.filter((o) => (o.day || 'Senin') === filter.day);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.packageName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.customerAddress && o.customerAddress.toLowerCase().includes(q)) ||
          (o.addressDetail && o.addressDetail.toLowerCase().includes(q)) ||
          (o.menuName && o.menuName.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getOrderById(id: string) {
    return this.orders.find((o) => o.id === id);
  }

  public createOrder(data: Omit<CateringOrder, 'id' | 'createdAt'>) {
    const newOrder: CateringOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  public updateOrderStatus(id: string, status: OrderStatus) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    return order;
  }

  public deleteOrder(id: string) {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return false;
    this.orders.splice(index, 1);
    return true;
  }

  public vouchers: VoucherPromo[] = [
    {
      id: 'voc-1',
      code: 'NUTRI15K',
      title: 'Diskon Rp15.000',
      discountType: 'nominal',
      discountValue: 15000,
      minSpend: 75000,
      categoryTag: 'NutriPay / Saldo',
      badgeText: 'TERPILIH',
      isActive: true,
      quota: 100,
      usedCount: 42,
      validUntil: '2026-12-31',
    },
    {
      id: 'voc-2',
      code: 'FREEONGKIR',
      title: 'Gratis Ongkir s.d. Rp15.000',
      discountType: 'free_shipping',
      discountValue: 15000,
      maxDiscount: 15000,
      minSpend: 75000,
      categoryTag: '✓ Semua Menu Diet & Katering',
      badgeText: 'REKOMENDASI',
      isActive: true,
      quota: 150,
      usedCount: 98,
      validUntil: '2026-11-30',
    },
    {
      id: 'voc-3',
      code: 'DIET30',
      title: 'Diskon 30% Katering Sehat',
      discountType: 'percent',
      discountValue: 30,
      maxDiscount: 40000,
      minSpend: 120000,
      categoryTag: 'Langganan Baru',
      badgeText: '⚡ Terbatas',
      isActive: true,
      quota: 50,
      usedCount: 21,
      validUntil: '2026-10-31',
    },
    {
      id: 'voc-4',
      code: 'CASHBACK20',
      title: 'Cashback 20% Koin Sehat',
      discountType: 'cashback',
      discountValue: 20,
      maxDiscount: 10000,
      minSpend: 50000,
      categoryTag: 'Spesial NutriPay',
      isActive: true,
      quota: 80,
      usedCount: 35,
      validUntil: '2026-12-31',
    },
  ];

  public activeSubscriptions: ActiveSubscription[] = [
    {
      id: 'sub-1',
      customerId: 'cst-1',
      customerName: 'Dimas Pratama',
      customerPhone: '0812-8890-1122',
      packageName: 'Paket Diet Sehat Mingguan',
      mealSlot: 'Siang & Malam',
      deliveryTimeSlot: '11.30 – 13.00 WIB (Slot Utama)',
      startDate: '2026-10-01',
      endDate: '2026-10-14',
      daysRemaining: 4,
      totalDays: 14,
      status: 'Aktif',
      autoRenew: true,
      address: 'Jl. Soekarno Hatta No. 45, Lowokwaru, Malang',
    },
    {
      id: 'sub-2',
      customerId: 'cst-2',
      customerName: 'Amanda Putri',
      customerPhone: '0858-7702-9901',
      packageName: 'Paket Makan Siang Kantor',
      mealSlot: 'Makan Siang',
      deliveryTimeSlot: '11.30 – 13.00 WIB (Slot Utama)',
      startDate: '2026-10-01',
      endDate: '2026-10-30',
      daysRemaining: 21,
      totalDays: 30,
      status: 'Aktif',
      autoRenew: true,
      address: 'Gedung Graha Pena Lt. 4, PT Digita Kreasi Nusa, Malang',
    },
    {
      id: 'sub-3',
      customerId: 'cst-3',
      customerName: 'Dr. Rio Wicaksono',
      customerPhone: '0819-3331-4455',
      packageName: 'Paket Family 5 Hari',
      mealSlot: 'Siang & Malam',
      deliveryTimeSlot: '12.30 – 13.30 WIB (Terakhir Siang)',
      startDate: '2026-10-05',
      endDate: '2026-10-10',
      daysRemaining: 2,
      totalDays: 5,
      status: 'Dijeda',
      pauseReason: 'Cuti / Dinas luar kota ke Surabaya',
      autoRenew: false,
      address: 'Perumahan Permata Jingga Blok D-12, Malang',
    },
    {
      id: 'sub-4',
      customerId: 'cst-5',
      customerName: 'Kevin Tan',
      customerPhone: '0877-6411-2233',
      packageName: 'Paket Diet Sehat Mingguan',
      mealSlot: 'Makan Siang',
      deliveryTimeSlot: '10.30 – 11.30 WIB (Lebih Awal)',
      startDate: '2026-10-08',
      endDate: '2026-10-15',
      daysRemaining: 6,
      totalDays: 7,
      status: 'Aktif',
      autoRenew: false,
      address: 'Apartemen Begawan Lt. 12 No. 04, Malang',
    },
  ];

  // Customers
  public getCustomers(search?: string) {
    let list = [...this.customers];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.companyName && c.companyName.toLowerCase().includes(q))
      );
    }
    return list;
  }

  // Vouchers
  public getVouchers() {
    return [...this.vouchers];
  }

  public createVoucher(data: Omit<VoucherPromo, 'id' | 'usedCount'>) {
    const newVoucher: VoucherPromo = {
      id: `voc-${Date.now()}`,
      usedCount: 0,
      ...data,
    };
    this.vouchers.unshift(newVoucher);
    return newVoucher;
  }

  public updateVoucher(id: string, data: Partial<VoucherPromo>) {
    const index = this.vouchers.findIndex((v) => v.id === id);
    if (index === -1) return null;
    this.vouchers[index] = { ...this.vouchers[index], ...data };
    return this.vouchers[index];
  }

  public deleteVoucher(id: string) {
    const index = this.vouchers.findIndex((v) => v.id === id);
    if (index === -1) return false;
    this.vouchers.splice(index, 1);
    return true;
  }

  public toggleVoucherStatus(id: string) {
    const v = this.vouchers.find((voc) => voc.id === id);
    if (!v) return null;
    v.isActive = !v.isActive;
    return v;
  }

  // Subscriptions
  public getActiveSubscriptions() {
    return [...this.activeSubscriptions];
  }

  public updateSubscriptionStatus(id: string, status: 'Aktif' | 'Dijeda' | 'Selesai', pauseReason?: string) {
    const sub = this.activeSubscriptions.find((s) => s.id === id);
    if (!sub) return null;
    sub.status = status;
    if (pauseReason !== undefined) sub.pauseReason = pauseReason;
    return sub;
  }

  // Analytics & Dashboard Summary
  public getAnalytics() {
    return {
      kpi: {
        totalOrdersToday: 142,
        totalOrdersChange: '+16.2%',
        readyToShip: 96,
        inProcess: 46,
        monthlyRevenue: 18500000,
        monthlyRevenueDisplay: 'Rp 18.5jt',
        monthlyRevenueChange: '+14.5%',
        dailyRevenueAverage: 'Rp 720rb',
        activeCustomers: 320,
        newCustomersThisMonth: 28,
        personalCustomers: 215,
        corporateCustomers: 105,
        activeMenus: 24,
        availablePackages: 5,
      },
      weeklySales: [
        { day: 'Sen (18 Okt)', diet: 45, kantor: 35, family: 20, event: 10, total: 110 },
        { day: 'Sel (19 Okt)', diet: 55, kantor: 40, family: 25, event: 15, total: 135 },
        { day: 'Rab (20 Okt)', diet: 50, kantor: 42, family: 22, event: 12, total: 126 },
        { day: 'Kam (21 Okt - Hari Ini)', diet: 65, kantor: 50, family: 30, event: 18, total: 163 },
        { day: 'Jum (22 Okt)', diet: 60, kantor: 48, family: 28, event: 14, total: 150 },
        { day: 'Sab (23 Okt)', diet: 40, kantor: 25, family: 35, event: 22, total: 122 },
        { day: 'Min (24 Okt)', diet: 35, kantor: 15, family: 40, event: 30, total: 120 },
      ],
      packageDonut: {
        totalSoldPortions: 1428,
        categories: [
          { name: 'Paket Sehat Diet', percent: 42, portions: 600, color: '#059669' },
          { name: 'Paket Makan Siang Kantor', percent: 31, portions: 443, color: '#0284c7' },
          { name: 'Paket Family 5 Hari', percent: 18, portions: 257, color: '#d97706' },
          { name: 'Prasmanan / Event', percent: 9, portions: 128, color: '#dc2626' },
        ],
      },
      deliveryBatches: {
        morning: {
          title: 'Batch Pagi / Siang',
          timeRange: '11:00 - 12:30 WIB',
          countText: '96 Box Siap & Terkirim',
          status: 'Selesai',
        },
        evening: {
          title: 'Batch Sore / Malam',
          timeRange: '16:00 - 17:30 WIB',
          countText: '46 Box Sedang Dimasak',
          status: 'Diproses',
        },
      },
      inventoryNote: {
        content:
          'Stok ayam fillet dan sayuran segar mencukupi untuk 3 hari ke depan. Pastikan konfirmasi jadwal katering kantor sebelum pukul 15:00 WIB.',
      },
    };
  }

  public static getInstance(): NutriMealDatabase {
    if (!NutriMealDatabase.instance) {
      NutriMealDatabase.instance = new NutriMealDatabase();
    }
    return NutriMealDatabase.instance;
  }
}

export const db = NutriMealDatabase.getInstance();
