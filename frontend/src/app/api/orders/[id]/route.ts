import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, OrderStatus } from '@/lib/data-store';
import { mapBackendOrderToFrontend } from '../route';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_ORDERS_URL = `${BACKEND_BASE}/api/orders`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND_ORDERS_URL}/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return NextResponse.json({
          success: true,
          data: mapBackendOrderToFrontend(json.data),
        });
      }
    }
  } catch (error) {
    console.warn(`⚠️ Gagal fetch order ${id} dari Express:`, error);
  }

  const order = db.getOrderById(id);

  if (!order) {
    return NextResponse.json(
      { success: false, message: `Pesanan dengan ID ${id} tidak ditemukan.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: order,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status) {
      const validStatuses: OrderStatus[] = [
        'Menunggu Pembayaran',
        'Diterima',
        'Diproses',
        'Dikirim',
        'Selesai',
        'Dibatalkan',
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: 'Status tidak valid.' },
          { status: 400 }
        );
      }

      try {
        const cookieStore = await cookies();
        const adminToken = cookieStore.get('admin_token')?.value;
        const res = await fetch(`${BACKEND_ORDERS_URL}/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify({ status: body.status }),
        });
        const json = await res.json().catch(() => null);
        if (res.ok) {
          db.updateOrderStatus(id, body.status);
          return NextResponse.json({
            success: true,
            message: `Status pesanan ${id} berhasil diperbarui di backend database.`,
            data: json?.data || { id, status: body.status },
          });
        }
        return NextResponse.json(
          {
            success: false,
            message: json?.message || `Gagal memperbarui status pesanan ${id}.`,
          },
          { status: res.status || 400 }
        );
      } catch (backendErr) {
        console.warn(`⚠️ Gagal PATCH order status ${id} ke Express:`, backendErr);
      }

      const existing = db.getOrderById(id);
      if (!existing) {
        return NextResponse.json(
          { success: false, message: `Pesanan dengan ID ${id} tidak ditemukan.` },
          { status: 404 }
        );
      }
      if (
        ['Diterima', 'Diproses', 'Dikirim', 'Selesai'].includes(body.status) &&
        !['Lunas', 'COD'].includes(existing.paymentStatus || '')
      ) {
        return NextResponse.json(
          {
            success: false,
            message: 'Pesanan belum dibayar (Lunas/COD), status tidak dapat diproses atau dikirim.',
          },
          { status: 409 }
        );
      }
      const updated = db.updateOrderStatus(id, body.status);
      return NextResponse.json({
        success: true,
        message: `Status pesanan ${id} berhasil diperbarui menjadi ${body.status}.`,
        data: updated,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Field status diperlukan.' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status pesanan.' },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;
