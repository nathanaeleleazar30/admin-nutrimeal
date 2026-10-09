import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function GET() {
  try {
    const subs = db.getActiveSubscriptions();
    return NextResponse.json({ success: true, data: subs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data langganan' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, pauseReason } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Parameter id dan status wajib diisi' }, { status: 400 });
    }
    const updated = db.updateSubscriptionStatus(id, status, pauseReason);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Langganan tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status langganan' },
      { status: 500 }
    );
  }
}
