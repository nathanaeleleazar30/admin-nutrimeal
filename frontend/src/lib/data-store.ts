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
  spicyLevel?: 'Tidak Pedas' | 'Sedang' | 'Pedas';
  isVegetarian?: boolean;
  eventTags?: string[];
  stockQuantity?: number;
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
      name: 'Paket Mingguan (Trial)',
      type: 'Mingguan',
      description:
        'Paket trial 7 hari untuk 14x makan (Siang & Malam). Cocok bagi yang baru mencoba gaya hidup sehat.',
      price: 175000,
      portions: '14x Makan (Siang & Malam)',
      portionCount: 600,
      targetAudience: 'Personal',
      salesCount: 600,
      percentage: 42,
      color: '#059669', // Emerald
      includedMeals: ['Grilled Chicken', 'Chicken Salad', 'Pepes Tongkol'],
    },
    {
      id: 'pkg-2',
      name: 'Paket Bulanan Lengkap',
      type: 'Bulanan',
      description:
        'Paket paling populer hemat 35%! 30 hari penuh untuk 60x makan siang & malam dengan rotasi menu variatif.',
      price: 650000,
      portions: '60x Makan (Siang & Malam)',
      portionCount: 840,
      targetAudience: 'Personal',
      salesCount: 840,
      percentage: 38,
      color: '#059669', // Emerald
      includedMeals: ['Grilled Chicken', 'Cheesy Chicken', 'Beef Brokoli', 'Pepes Tongkol'],
    },
    {
      id: 'pkg-3',
      name: 'Paket Hemat Siang (Khusus Kantor)',
      type: 'Bulanan',
      description:
        '30 Hari • 30x makan (1x makan siang/hari). Solusi makan siang bergizi langsung tiba di meja kantor.',
      price: 400000,
      portions: '30x Makan Siang Kantor',
      portionCount: 443,
      targetAudience: 'Korporat / Kantor',
      salesCount: 443,
      percentage: 26,
      color: '#0284c7', // Sky blue
      includedMeals: ['Beef Veggie', 'Chicken Kare', 'Grilled Chicken'],
    },
    {
      id: 'pkg-4',
      name: 'Paket Family Sehat 5 Hari',
      type: 'Mingguan',
      description:
        'Menu santap bersama keluarga untuk 4 orang setiap hari Senin hingga Jumat dengan lauk pauk tinggi serat.',
      price: 680000,
      portions: 'Lengkap 4 Porsi Keluarga (20 Box)',
      portionCount: 257,
      targetAudience: 'Keluarga',
      salesCount: 257,
      percentage: 18,
      color: '#d97706', // Amber
      includedMeals: ['Pepes Tongkol', 'Beef Veggie', 'Ayam Bakar Madu'],
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

  public orders: CateringOrder[] = [];

  public customers: Customer[] = [
    {
      id: 'cst-1792473012910',
      name: 'nael',
      email: 'nael@gmail.com',
      phone: '08316194848',
      address: 'Jl. Candi Mendut No. 5, Malang',
      type: 'Personal',
      totalOrders: 0,
      totalSpent: 0,
      activeSubscription: 'Paket Bulanan Lengkap',
      joinedDate: '2026-10-20',
      allergies: [],
      dietaryGoals: ['Gizi Seimbang'],
      targetCalories: 1800,
    },
    {
      id: 'cst-1794419849764',
      name: 'Raihan',
      email: 'tugasraihan.69@gmail.com',
      phone: '085745496617',
      address: 'Jl. Sukarno Hatta No. 10, Malang',
      type: 'Personal',
      totalOrders: 0,
      totalSpent: 0,
      activeSubscription: 'Paket Bulanan Lengkap',
      joinedDate: '2026-11-10',
      allergies: [],
      dietaryGoals: ['Defisit Kalori'],
      targetCalories: 1800,
    },
    {
      id: 'cst-1791734190821',
      name: 'bintang',
      email: 'bintangfatahillah12@gmail.com',
      phone: '087797669180',
      address: 'Malang',
      type: 'Personal',
      totalOrders: 0,
      totalSpent: 0,
      joinedDate: '2026-10-15',
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

  public createOrder(data: Omit<CateringOrder, 'id' | 'createdAt'> & { id?: string }) {
    const newOrder: CateringOrder = {
      id: data.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
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

  public vouchers: VoucherPromo[] = [];

  public activeSubscriptions: ActiveSubscription[] = [
    {
      id: 'sub-nael',
      customerId: 'cst-1792473012910',
      customerName: 'nael',
      customerPhone: '08316194848',
      packageName: 'Paket Bulanan Lengkap',
      mealSlot: 'Siang & Malam',
      deliveryTimeSlot: '11.30 – 13.00 WIB (Slot Utama)',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      daysRemaining: 20,
      totalDays: 30,
      status: 'Aktif',
      autoRenew: true,
      address: 'Jl. Candi Mendut No. 5, Malang',
    },
    {
      id: 'sub-raihan',
      customerId: 'cst-1794419849764',
      customerName: 'Raihan',
      customerPhone: '085745496617',
      packageName: 'Paket Bulanan Lengkap',
      mealSlot: 'Siang & Malam',
      deliveryTimeSlot: '11.30 – 13.00 WIB (Slot Utama)',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      daysRemaining: 20,
      totalDays: 30,
      status: 'Aktif',
      autoRenew: true,
      address: 'Jl. Sukarno Hatta No. 10, Malang',
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

  public getVoucherById(id: string) {
    return this.vouchers.find((v) => v.id === id);
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
    const totalRevenue = this.orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const readyToShip = this.orders.filter((o) => o.status === 'Dikirim').length;
    const inProcess = this.orders.filter((o) => o.status === 'Diproses').length;
    const revenueDisplay = totalRevenue > 0
      ? (totalRevenue >= 1000000 ? `Rp ${(totalRevenue / 1000000).toFixed(1)}jt` : `Rp ${(totalRevenue / 1000).toFixed(0)}rb`)
      : 'Rp 0';

    return {
      kpi: {
        totalOrdersToday: this.orders.length,
        totalOrdersChange: '0%',
        readyToShip,
        inProcess,
        monthlyRevenue: totalRevenue,
        monthlyRevenueDisplay: revenueDisplay,
        monthlyRevenueChange: '0%',
        dailyRevenueAverage: 'Rp 0',
        activeCustomers: this.customers.length,
        newCustomersThisMonth: this.customers.length,
        personalCustomers: this.customers.filter((c) => c.type === 'Personal').length,
        corporateCustomers: this.customers.filter((c) => c.type === 'Korporat / Kantor').length,
        activeMenus: this.meals.length,
        availablePackages: this.packages.length,
      },
      weeklySales: [
        { day: 'Sen', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
        { day: 'Sel', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
        { day: 'Rab', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
        { day: 'Kam', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
        { day: 'Jum', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
        { day: 'Sab', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
        { day: 'Min', diet: 0, kantor: 0, family: 0, event: 0, total: 0 },
      ],
      packageDonut: {
        totalSoldPortions: this.packages.reduce((sum, p) => sum + p.portionCount, 0),
        categories: this.packages.map((pkg) => ({
          name: pkg.name,
          percent: pkg.percentage,
          portions: pkg.portionCount,
          color: pkg.color,
        })),
      },
      deliveryBatches: {
        morning: {
          title: 'Batch Pagi / Siang',
          timeRange: '11:00 - 12:30 WIB',
          countText: `${readyToShip} Box Siap & Terkirim`,
          status: readyToShip > 0 ? 'Selesai' : 'Siap',
        },
        evening: {
          title: 'Batch Sore / Malam',
          timeRange: '16:00 - 17:30 WIB',
          countText: `${inProcess} Box Sedang Dimasak`,
          status: inProcess > 0 ? 'Diproses' : 'Siap',
        },
      },
      inventoryNote: {
        content:
          'Stok dapur katering sehat siap melayani pesanan katering baru.',
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
