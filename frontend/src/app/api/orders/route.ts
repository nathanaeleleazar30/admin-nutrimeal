import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_ORDERS_URL = `${BACKEND_BASE}/api/orders`;

export function mapBackendOrderToFrontend(row: any) {
  return {
    id: String(row.id),
    customerName: row.customer_name || row.customerName || 'Pelanggan',
    customerPhone: row.customer_phone || row.customerPhone || '-',
    customerAddress: row.customer_address || row.customerAddress || '-',
    addressDetail: row.address_detail || row.addressDetail || '',
    customerType: row.customer_type || row.customerType || 'Personal',
    packageName: row.package_name || row.packageName || 'Paket Katering',
    packageDetail: row.package_detail || row.packageDetail || '1 Paket Katering',
    menuName: row.menu_name || row.menuName || row.package_name || row.packageName || 'Menu Sehat',
    menuDetail: row.menu_detail || row.menuDetail || row.package_detail || row.packageDetail || '',
    portionsCount: Number(row.portions_count || row.portionsCount || 1),
    deliverySchedule: row.delivery_schedule || row.deliverySchedule || 'Siang (11:30 WIB)',
    deliveryBatch: row.delivery_batch || row.deliveryBatch || 'Pagi/Siang',
    day: row.day || 'Senin',
    status: row.status || 'Diterima',
    totalPrice: Number(row.total_price || row.totalPrice || 0),
    paymentMethod: row.payment_method || row.paymentMethod || 'Bank Transfer',
    paymentStatus: row.payment_status || row.paymentStatus || 'Lunas',
    courierName: row.courier_name || row.courierName || 'Kurir NutriMeal',
    courierNotes: row.courier_notes || row.courierNotes || '',
    kitchenNotes: row.kitchen_notes || row.kitchenNotes || '',
    notes: row.kitchen_notes || row.courier_notes || row.notes || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const batch = searchParams.get('batch') || undefined;
  const day = searchParams.get('day') || undefined;

  const query = new URLSearchParams();
  if (status && status !== 'Semua') query.append('status', status);
  if (search) query.append('search', search);
  if (batch && batch !== 'Semua') query.append('batch', batch);
  if (day && day !== 'Semua' && day !== 'Semua Hari') query.append('day', day);
  const queryString = query.toString();

  try {
    const res = await fetch(`${BACKEND_ORDERS_URL}${queryString ? `?${queryString}` : ''}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapBackendOrderToFrontend);
        return NextResponse.json({
          success: true,
          total: mapped.length,
          data: mapped,
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke Express Backend untuk GET /api/orders, fallback ke data-store:', error);
  }

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

    try {
      const backendPayload = {
        customer_name: body.customerName,
        customer_phone: body.customerPhone || '-',
        customer_address: body.customerAddress || '-',
        address_detail: body.addressDetail || null,
        customer_type: body.customerType || 'Personal',
        package_name: body.packageName,
        package_detail: body.packageDetail || '1 Paket Katering',
        menu_name: body.menuName || body.packageName,
        menu_detail: body.menuDetail || body.packageDetail,
        portions_count: Number(body.portionsCount) || 1,
        delivery_schedule: body.deliverySchedule || 'Siang (11:30 WIB)',
        delivery_batch: body.deliveryBatch || 'Pagi/Siang',
        day: body.day || 'Senin',
        status: body.status || 'Diterima',
        total_price: Number(body.totalPrice),
        payment_method: body.paymentMethod || 'Bank Transfer',
        payment_status: body.paymentStatus || 'Lunas',
        courier_name: body.courierName || null,
        courier_notes: body.courierNotes || null,
        kitchen_notes: body.notes || body.kitchenNotes || null,
      };

      const res = await fetch(BACKEND_ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const mapped = mapBackendOrderToFrontend(json.data);
          db.createOrder({
            id: mapped.id,
            customerName: mapped.customerName,
            customerPhone: mapped.customerPhone,
            customerAddress: mapped.customerAddress,
            customerType: mapped.customerType as any,
            packageName: mapped.packageName,
            packageDetail: mapped.packageDetail,
            deliverySchedule: mapped.deliverySchedule,
            deliveryBatch: mapped.deliveryBatch as any,
            status: mapped.status as any,
            totalPrice: mapped.totalPrice,
            notes: mapped.notes,
            day: mapped.day,
            addressDetail: mapped.addressDetail,
            menuName: mapped.menuName,
            menuDetail: mapped.menuDetail,
            portionsCount: mapped.portionsCount,
            paymentMethod: mapped.paymentMethod,
            paymentStatus: mapped.paymentStatus as any,
            courierName: mapped.courierName,
            courierNotes: mapped.courierNotes,
            kitchenNotes: mapped.kitchenNotes,
          });
          return NextResponse.json({
            success: true,
            message: 'Pesanan katering berhasil dibuat di database backend.',
            data: mapped,
          }, { status: 201 });
        }
      }
    } catch (backendErr) {
      console.warn('⚠️ Gagal POST order ke Express Backend, fallback ke data-store:', backendErr);
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
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal membuat pesanan baru.' },
      { status: 500 }
    );
  }
}
