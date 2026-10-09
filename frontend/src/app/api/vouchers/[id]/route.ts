import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === 'toggle') {
      const toggled = db.toggleVoucherStatus(id);
      if (!toggled) {
        return NextResponse.json({ success: false, error: 'Voucher tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: toggled });
    }

    const updated = db.updateVoucher(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Voucher tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui voucher' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = db.deleteVoucher(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Voucher tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Voucher berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus voucher' },
      { status: 500 }
    );
  }
}
