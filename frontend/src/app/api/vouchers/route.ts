import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function GET() {
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
