import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { mapBackendVoucherToFrontend } from '../route';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_VOUCHERS_URL = `${BACKEND_BASE}/api/vouchers`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND_VOUCHERS_URL}/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return NextResponse.json({
          success: true,
          data: mapBackendVoucherToFrontend(json.data),
        });
      }
    }
  } catch (error) {
    console.warn(`⚠️ Gagal fetch voucher ${id} dari Express:`, error);
  }

  const voucher = db.getVoucherById(id);
  if (!voucher) {
    return NextResponse.json(
      { success: false, message: 'Voucher tidak ditemukan.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: voucher });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    try {
      const backendPayload = {
        code: body.code ? body.code.toUpperCase().trim() : undefined,
        title: body.title,
        discount_type: body.discountType,
        discount_value: body.discountValue !== undefined ? Number(body.discountValue) : undefined,
        max_discount: body.maxDiscount !== undefined ? Number(body.maxDiscount) : undefined,
        min_spend: body.minSpend !== undefined ? Number(body.minSpend) : undefined,
        category_tag: body.categoryTag,
        badge_text: body.badgeText,
        is_active: body.isActive !== undefined ? (body.isActive ? 1 : 0) : undefined,
        quota: body.quota !== undefined ? Number(body.quota) : undefined,
        valid_until: body.validUntil,
      };

      const res = await fetch(`${BACKEND_VOUCHERS_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      if (res.ok) {
        const json = await res.json();
        db.updateVoucher(id, body);
        return NextResponse.json({
          success: true,
          message: 'Voucher berhasil diperbarui di backend database.',
          data: json.data || body,
        });
      }
    } catch (backendErr) {
      console.warn(`⚠️ Gagal PUT voucher ${id} ke Express:`, backendErr);
    }

    const updated = db.updateVoucher(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Voucher tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui voucher.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      const res = await fetch(`${BACKEND_VOUCHERS_URL}/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const json = await res.json();
        db.toggleVoucherStatus(id);
        return NextResponse.json({ success: true, data: json.data });
      }
    } catch (backendErr) {
      console.warn(`⚠️ Gagal toggle voucher ${id} ke Express:`, backendErr);
    }

    const toggled = db.toggleVoucherStatus(id);
    if (!toggled) {
      return NextResponse.json(
        { success: false, message: 'Voucher tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: toggled });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal mengubah status voucher.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      await fetch(`${BACKEND_VOUCHERS_URL}/${id}`, { method: 'DELETE' });
    } catch (backendErr) {
      console.warn(`⚠️ Gagal DELETE voucher ${id} ke Express:`, backendErr);
    }

    const deleted = db.deleteVoucher(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Voucher tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Voucher berhasil dihapus.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus voucher.' },
      { status: 500 }
    );
  }
}
