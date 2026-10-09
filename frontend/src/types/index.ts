// Central Type Definitions untuk NutriMeal Frontend & Backend Response

export type MealCategory = 'Ayam' | 'Ikan' | 'Daging' | 'Seafood' | 'Roti';

export interface NutritionInfo {
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
}

export interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  calories: number;
  price: number;
  discount_percent?: number;
  image_url: string;
  description: string;
  tags?: string;
  schedule: string;
  delivery_time: string;
  protein: string;
  fat: string;
  carbs: string;
  is_available: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export type PackageType = 'Harian' | 'Mingguan' | 'Bulanan' | 'Prasmanan / Event';
export type TargetAudience = 'Personal' | 'Korporat / Kantor' | 'Keluarga';

export interface CateringPackage {
  id: string;
  name: string;
  type: PackageType;
  description: string;
  price: number;
  portions: string;
  target_audience: TargetAudience;
  sales_count: number;
  percentage: number;
  color: string;
  included_meals?: string[] | string;
  created_at?: string;
}

export type OrderStatus = 'Diterima' | 'Diproses' | 'Dikirim' | 'Selesai';
export type CustomerType = 'Personal' | 'Korporat / Kantor' | 'Keluarga';

export interface CateringOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  address_detail?: string;
  customer_type: CustomerType;
  package_name: string;
  package_detail?: string;
  menu_name?: string;
  menu_detail?: string;
  portions_count: number;
  delivery_schedule: string;
  delivery_batch: 'Pagi/Siang' | 'Sore/Malam';
  day: string;
  status: OrderStatus;
  total_price: number;
  payment_method: string;
  payment_status: 'Lunas' | 'Menunggu Pembayaran' | 'COD';
  courier_name?: string;
  courier_notes?: string;
  kitchen_notes?: string;
  created_at?: string;
}

export type VoucherDiscountType = 'nominal' | 'percent' | 'free_shipping' | 'cashback';

export interface Voucher {
  id: string;
  code: string;
  title: string;
  discount_type: VoucherDiscountType;
  discount_value: number;
  max_discount?: number;
  min_spend: number;
  category_tag: string;
  badge_text?: string;
  is_active: boolean | number;
  quota: number;
  used_count: number;
  valid_until: string;
  created_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: CustomerType;
  company_name?: string;
  total_orders: number;
  total_spent: number;
  active_subscription?: string;
  allergies?: string[] | string;
  dietary_goals?: string[] | string;
  target_calories?: number;
  joined_date: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  package_name: string;
  meal_slot: 'Makan Siang' | 'Makan Malam' | 'Siang & Malam' | 'Full Day (3x)';
  delivery_time_slot: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  total_days: number;
  status: 'Aktif' | 'Dijeda' | 'Selesai';
  pause_reason?: string;
  auto_renew: boolean | number;
  address: string;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
  is_active: boolean | number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
