import 'server-only';
import {
  Meal,
  CateringPackage,
  CateringOrder,
  Voucher,
  Customer,
  Subscription,
  Faq,
  ApiResponse,
} from '@/types';

// URL API Express dari environment variable (default: port 5000)
const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Helper fetch aman untuk pemanggilan ke Express Backend
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      // Mengaktifkan revalidasi cache atau no-store sesuai kebutuhan RSC
      next: { revalidate: options?.next?.revalidate ?? 0 },
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(
        errorBody?.message || `HTTP Error ${res.status}: ${res.statusText} saat mengakses ${endpoint}`
      );
    }

    const json: ApiResponse<T> = await res.json();
    return (json.data ?? json) as T;
  } catch (error) {
    console.error(`❌ Gagal mengambil data dari Express [${url}]:`, error);
    throw error;
  }
}

// ========================================================
// 1. API MEALS (Menu Makanan Sehat)
// ========================================================
export async function getMeals(category?: string, search?: string): Promise<Meal[]> {
  const query = new URLSearchParams();
  if (category && category !== 'Semua') query.append('category', category);
  if (search) query.append('search', search);

  const endpoint = `/api/meals${query.toString() ? `?${query.toString()}` : ''}`;
  return fetchApi<Meal[]>(endpoint);
}

export async function getMealById(id: string): Promise<Meal | null> {
  try {
    return await fetchApi<Meal>(`/api/meals/${id}`);
  } catch {
    return null;
  }
}

// ========================================================
// 2. API PACKAGES (Paket Langganan Katering)
// ========================================================
export async function getPackages(): Promise<CateringPackage[]> {
  return fetchApi<CateringPackage[]>('/api/packages');
}

export async function getPackageById(id: string): Promise<CateringPackage | null> {
  try {
    return await fetchApi<CateringPackage>(`/api/packages/${id}`);
  } catch {
    return null;
  }
}

// ========================================================
// 3. API ORDERS (Pesanan & Pengiriman Katering)
// ========================================================
export async function getOrders(filter?: {
  status?: string;
  batch?: string;
  day?: string;
  search?: string;
}): Promise<CateringOrder[]> {
  const query = new URLSearchParams();
  if (filter?.status && filter.status !== 'Semua') query.append('status', filter.status);
  if (filter?.batch && filter.batch !== 'Semua') query.append('batch', filter.batch);
  if (filter?.day && filter.day !== 'Semua' && filter.day !== 'Semua Hari') query.append('day', filter.day);
  if (filter?.search) query.append('search', filter.search);

  const endpoint = `/api/orders${query.toString() ? `?${query.toString()}` : ''}`;
  return fetchApi<CateringOrder[]>(endpoint);
}

export async function getOrderById(id: string): Promise<CateringOrder | null> {
  try {
    return await fetchApi<CateringOrder>(`/api/orders/${id}`);
  } catch {
    return null;
  }
}

// ========================================================
// 4. API VOUCHERS (Kupon & Promo Diskon)
// ========================================================
export async function getVouchers(): Promise<Voucher[]> {
  return fetchApi<Voucher[]>('/api/vouchers');
}

export async function getVoucherById(id: string): Promise<Voucher | null> {
  try {
    return await fetchApi<Voucher>(`/api/vouchers/${id}`);
  } catch {
    return null;
  }
}

// ========================================================
// 5. API CUSTOMERS (Data Pelanggan & Alergi Medis)
// ========================================================
export async function getCustomers(search?: string): Promise<Customer[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchApi<Customer[]>(`/api/customers${query}`);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    return await fetchApi<Customer>(`/api/customers/${id}`);
  } catch {
    return null;
  }
}

// ========================================================
// 6. API SUBSCRIPTIONS (Langganan Aktif & Jeda Cuti)
// ========================================================
export async function getSubscriptions(): Promise<Subscription[]> {
  return fetchApi<Subscription[]>('/api/subscriptions');
}

// ========================================================
// 7. API FAQS (Pusat Bantuan & Tanya Jawab)
// ========================================================
export async function getFaqs(): Promise<Faq[]> {
  return fetchApi<Faq[]>('/api/faqs');
}
