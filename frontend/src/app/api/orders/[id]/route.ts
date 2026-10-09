import { NextResponse } from 'next/server';
import { db, OrderStatus } from '@/lib/data-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      { success: false, message: 'Tidak ada perubahan yang dikirim.' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status pesanan.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = db.deleteOrder(id);

  if (!deleted) {
    return NextResponse.json(
      { success: false, message: `Pesanan dengan ID ${id} tidak ditemukan.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Pesanan ${id} berhasil dihapus.`,
  });
}
