import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_SUBS_URL = `${BACKEND_BASE}/api/subscriptions`;

export function mapBackendSubscriptionToFrontend(row: any) {
  return {
    id: String(row.id),
    customerId: row.customer_id || row.customerId,
    customerName: row.customer_name || row.customerName,
    customerPhone: row.customer_phone || row.customerPhone || '-',
    packageName: row.package_name || row.packageName,
    mealSlot: row.meal_slot || row.mealSlot || 'Siang',
    deliveryTimeSlot: row.delivery_time_slot || row.deliveryTimeSlot || '11.00 – 12.00 WIB',
    startDate: row.start_date ? String(row.start_date).slice(0, 10) : '2026-10-01',
    endDate: row.end_date ? String(row.end_date).slice(0, 10) : '2026-10-31',
    daysRemaining: Number(row.days_remaining || row.daysRemaining || 0),
    totalDays: Number(row.total_days || row.totalDays || 30),
    status: row.status || 'Aktif',
    pauseReason: row.pause_reason || row.pauseReason || undefined,
    autoRenew: row.auto_renew === 1 || row.auto_renew === true || row.autoRenew === true,
    address: row.address || 'Alamat belum diatur',
  };
}

export async function GET() {
  try {
    const res = await fetch(BACKEND_SUBS_URL, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapBackendSubscriptionToFrontend);
        return NextResponse.json({ success: true, data: mapped });
      }
    }
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke Express Backend untuk GET /api/subscriptions, fallback ke data-store:', error);
  }

  try {
    const subs = db.getActiveSubscriptions();
    return NextResponse.json({ success: true, data: subs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data langganan' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, pauseReason } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Parameter id dan status wajib diisi' }, { status: 400 });
    }

    try {
      const res = await fetch(`${BACKEND_SUBS_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, pause_reason: pauseReason || null }),
      });
      if (res.ok) {
        db.updateSubscriptionStatus(id, status, pauseReason);
        return NextResponse.json({ success: true, message: 'Status langganan berhasil diperbarui di database backend.' });
      }
    } catch (backendErr) {
      console.warn(`⚠️ Gagal PATCH subscription status ${id} ke Express:`, backendErr);
    }

    const updated = db.updateSubscriptionStatus(id, status, pauseReason);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Langganan tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status langganan' },
      { status: 500 }
    );
  }
}
