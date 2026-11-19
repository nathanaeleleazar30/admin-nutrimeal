import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_CUSTOMERS_URL = `${BACKEND_BASE}/api/customers`;

export function mapBackendCustomerToFrontend(row: any) {
  let allergies: string[] = [];
  if (Array.isArray(row.allergies)) {
    allergies = row.allergies;
  } else if (typeof row.allergies === 'string' && row.allergies.trim()) {
    try {
      const parsed = JSON.parse(row.allergies);
      allergies = Array.isArray(parsed) ? parsed : [row.allergies];
    } catch {
      allergies = row.allergies.split(',').map((s: string) => s.trim());
    }
  }

  let dietaryGoals: string[] = [];
  if (Array.isArray(row.dietary_goals || row.dietaryGoals)) {
    dietaryGoals = row.dietary_goals || row.dietaryGoals;
  } else if (typeof (row.dietary_goals || row.dietaryGoals) === 'string') {
    const raw = row.dietary_goals || row.dietaryGoals;
    try {
      const parsed = JSON.parse(raw);
      dietaryGoals = Array.isArray(parsed) ? parsed : [raw];
    } catch {
      dietaryGoals = raw.split(',').map((s: string) => s.trim());
    }
  }

  return {
    id: String(row.id),
    name: row.name || 'Pelanggan',
    email: row.email || '-',
    phone: row.phone || '-',
    address: row.address || 'Belum diisi',
    type: row.type || 'Personal',
    companyName: row.company_name || row.companyName || undefined,
    totalOrders: Number(row.total_orders || row.totalOrders || 0),
    totalSpent: Number(row.total_spent || row.totalSpent || 0),
    activeSubscription: row.active_subscription || row.activeSubscription || undefined,
    avatarUrl: row.avatar_url || row.avatarUrl || undefined,
    allergies,
    dietaryGoals,
    targetCalories: Number(row.target_calories || row.targetCalories || 1800),
    joinedDate: row.joined_date ? String(row.joined_date).slice(0, 10) : (row.created_at ? String(row.created_at).slice(0, 10) : '2026-01-01'),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;

  try {
    const res = await fetch(`${BACKEND_CUSTOMERS_URL}${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapBackendCustomerToFrontend);
        return NextResponse.json({
          success: true,
          total: mapped.length,
          data: mapped,
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke Express Backend untuk GET /api/customers, fallback ke data-store:', error);
  }

  const customers = db.getCustomers(search);

  return NextResponse.json({
    success: true,
    total: customers.length,
    data: customers,
  });
}
