import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const batch = searchParams.get('batch') || undefined;
  const day = searchParams.get('day') || undefined;

  const orders = db.getOrders({ status, search, batch, day });

  return NextResponse.json({
    success: true,
    total: orders.length,
    data: orders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.packageName || !body.totalPrice) {
      return NextResponse.json(
        { success: false, message: 'Nama pelanggan, paket, dan total harga wajib diisi.' },
        { status: 400 }
      );
    }

    const order = db.createOrder({
      customerName: body.customerName,
      customerPhone: body.customerPhone || '-',
      customerAddress: body.customerAddress || '-',
      customerType: body.customerType || 'Personal',
      packageName: body.packageName,
      packageDetail: body.packageDetail || '1 Paket Katering',
      deliverySchedule: body.deliverySchedule || 'Siang (11:30 WIB)',
      deliveryBatch: body.deliveryBatch || 'Pagi/Siang',
      status: body.status || 'Diterima',
      totalPrice: Number(body.totalPrice),
      notes: body.notes,
      day: body.day || 'Senin',
      addressDetail: body.addressDetail || '',
      menuName: body.menuName || body.packageName,
      menuDetail: body.menuDetail || body.packageDetail,
      portionsCount: Number(body.portionsCount) || 1,
      paymentMethod: body.paymentMethod || 'Bank Transfer',
      paymentStatus: body.paymentStatus || 'Lunas',
      courierName: body.courierName || 'Kurir NutriMeal',
      courierNotes: body.courierNotes || '',
      kitchenNotes: body.kitchenNotes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Pesanan katering berhasil dibuat.',
      data: order,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal membuat pesanan baru.' },
      { status: 500 }
    );
  }
}
