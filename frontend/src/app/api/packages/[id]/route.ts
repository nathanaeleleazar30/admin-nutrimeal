import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pkg = db.getPackageById(id);

  if (!pkg) {
    return NextResponse.json(
      { success: false, message: `Paket dengan ID ${id} tidak ditemukan.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: pkg,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = db.updatePackage(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: `Paket dengan ID ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Paket katering berhasil diperbarui.',
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui paket katering.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = db.deletePackage(id);

  if (!deleted) {
    return NextResponse.json(
      { success: false, message: `Paket dengan ID ${id} tidak ditemukan.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Paket katering berhasil dihapus.',
  });
}
