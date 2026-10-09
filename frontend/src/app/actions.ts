'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface FormActionState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

/**
 * Server Action: Tambah Menu Makanan Baru
 */
export async function createMealAction(
  prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const price = formData.get('price') as string;
  const calories = formData.get('calories') as string;
  const description = formData.get('description') as string;
  const schedule = formData.get('schedule') as string;
  const imageUrl = formData.get('image_url') as string || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

  // Validasi di Server
  const errors: Record<string, string> = {};
  if (!name || name.trim().length < 3) errors.name = 'Nama menu minimal 3 karakter';
  if (!category) errors.category = 'Pilih salah satu kategori menu';
  if (!price || Number(price) <= 0) errors.price = 'Harga menu harus lebih besar dari 0';
  if (!calories || Number(calories) <= 0) errors.calories = 'Jumlah kalori harus diisi';

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: 'Validasi gagal, silakan periksa formulir.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        category,
        price: Number(price),
        calories: Number(calories),
        description: description || 'Menu katering sehat bergizi',
        schedule: schedule || 'Setiap Hari',
        image_url: imageUrl,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { success: false, message: err?.message || 'Gagal menyimpan menu ke backend Express' };
    }

    revalidatePath('/admin/menu');
    revalidatePath('/');
  } catch (error: any) {
    return { success: false, message: error?.message || 'Terjadi kesalahan koneksi ke server Express' };
  }

  redirect('/admin/menu');
}

/**
 * Server Action: Buat Voucher Promo Baru
 */
export async function createVoucherAction(
  prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const code = formData.get('code') as string;
  const title = formData.get('title') as string;
  const discountType = formData.get('discount_type') as string;
  const discountValue = formData.get('discount_value') as string;
  const minSpend = formData.get('min_spend') as string;
  const quota = formData.get('quota') as string;
  const validUntil = formData.get('valid_until') as string;

  const errors: Record<string, string> = {};
  if (!code || code.trim().length < 3) errors.code = 'Kode voucher minimal 3 karakter';
  if (!title) errors.title = 'Judul promo harus diisi';
  if (!discountValue || Number(discountValue) <= 0) errors.discount_value = 'Nilai diskon harus lebih besar dari 0';

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: 'Validasi form voucher gagal.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.toUpperCase().trim(),
        title,
        discount_type: discountType || 'nominal',
        discount_value: Number(discountValue),
        min_spend: Number(minSpend || 0),
        quota: Number(quota || 100),
        valid_until: validUntil || '2026-12-31',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { success: false, message: err?.message || 'Gagal menyimpan voucher ke server Express' };
    }

    revalidatePath('/admin/vouchers');
  } catch (error: any) {
    return { success: false, message: error?.message || 'Terjadi kesalahan koneksi' };
  }

  redirect('/admin/vouchers');
}

/**
 * Server Action: Update Status Pesanan Katering
 */
export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error('Gagal memperbarui status pesanan');

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

/**
 * Server Action: Toggle Status Langganan / Jeda Cuti
 */
export async function toggleSubscriptionStatusAction(subId: string, newStatus: string, pauseReason?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/${subId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, pause_reason: pauseReason }),
    });

    if (!res.ok) throw new Error('Gagal memperbarui status langganan');

    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}
