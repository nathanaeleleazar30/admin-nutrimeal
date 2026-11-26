import { NextResponse } from 'next/server';
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
      const validStatuses: OrderStatus[] = ['Diterima', 'Diproses', 'Dikirim', 'Selesai'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: 'Status tidak valid.' },
          { status: 400 }
        );
      }

      try {
        const res = await fetch(`${BACKEND_ORDERS_URL}/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: body.status }),
        });
        if (res.ok) {
          const json = await res.json();
          db.updateOrderStatus(id, body.status);
          return NextResponse.json({
            success: true,
            message: `Status pesanan ${id} berhasil diperbarui di backend database.`,
            data: json.data || { id, status: body.status },
          });
        }
      } catch (backendErr) {
        console.warn(`⚠️ Gagal PATCH order status ${id} ke Express:`, backendErr);
      }

      const updated = db.updateOrderStatus(id, body.status);
      if (!updated) {
        return NextResponse.json(
          { success: false, message: `Pesanan dengan ID ${id} tidak ditemukan.` },
          { status: 404 }
        );
      }
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
