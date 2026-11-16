import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_VOUCHERS_URL = `${BACKEND_BASE}/api/vouchers`;

export function mapBackendVoucherToFrontend(row: any) {
  return {
    id: String(row.id),
    code: row.code,
    title: row.title,
    discountType: row.discount_type || row.discountType || 'nominal',
    discountValue: Number(row.discount_value || row.discountValue || 0),
    maxDiscount: row.max_discount || row.maxDiscount ? Number(row.max_discount || row.maxDiscount) : undefined,
    minSpend: Number(row.min_spend || row.minSpend || 0),
    categoryTag: row.category_tag || row.categoryTag || 'Semua Menu',
    badgeText: row.badge_text || row.badgeText || '',
    isActive: row.is_active === 1 || row.is_active === true || row.isActive === true,
    quota: Number(row.quota || 100),
    usedCount: Number(row.used_count || row.usedCount || 0),
    validUntil: row.valid_until ? String(row.valid_until).slice(0, 10) : (row.validUntil || '2026-12-31'),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const res = await fetch(BACKEND_VOUCHERS_URL, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapBackendVoucherToFrontend);
        return NextResponse.json({ success: true, data: mapped });
      }
    }
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke Express Backend untuk GET /api/vouchers, fallback ke data-store:', error);
  }

  try {
    const vouchers = db.getVouchers();
    return NextResponse.json({ success: true, data: vouchers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data voucher' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    try {
      const backendPayload = {
        code: body.code.toUpperCase().trim(),
        title: body.title,
        discount_type: body.discountType || 'nominal',
        discount_value: Number(body.discountValue),
        max_discount: body.maxDiscount ? Number(body.maxDiscount) : null,
        min_spend: Number(body.minSpend || 0),
        category_tag: body.categoryTag || 'Semua Menu',
        badge_text: body.badgeText || null,
        is_active: body.isActive !== false ? 1 : 0,
        quota: Number(body.quota || 100),
        valid_until: body.validUntil || '2026-12-31',
      };

      const res = await fetch(BACKEND_VOUCHERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const mapped = mapBackendVoucherToFrontend(json.data);
          db.createVoucher(mapped);
          return NextResponse.json({ success: true, data: mapped }, { status: 201 });
        }
      }
    } catch (backendErr) {
      console.warn('⚠️ Gagal POST voucher ke Express Backend, fallback ke data-store:', backendErr);
    }

    const newVoucher = db.createVoucher({
      code: body.code.toUpperCase().trim(),
      title: body.title,
      discountType: body.discountType,
      discountValue: Number(body.discountValue),
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      minSpend: Number(body.minSpend || 0),
      categoryTag: body.categoryTag || 'Semua Menu',
      badgeText: body.badgeText || '',
      isActive: body.isActive !== false,
      quota: Number(body.quota || 100),
      validUntil: body.validUntil || '2026-12-31',
    });
    return NextResponse.json({ success: true, data: newVoucher }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal membuat voucher baru' },
      { status: 400 }
    );
  }
}
