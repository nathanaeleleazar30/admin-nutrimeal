import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meal = db.getMealById(id);

  if (!meal) {
    return NextResponse.json(
      { success: false, message: `Menu dengan ID ${id} tidak ditemukan.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: meal,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = db.updateMeal(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: `Menu dengan ID ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Menu berhasil diperbarui.',
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui menu.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = db.deleteMeal(id);

  if (!deleted) {
    return NextResponse.json(
      { success: false, message: `Menu dengan ID ${id} tidak ditemukan.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Menu berhasil dihapus.',
  });
}
