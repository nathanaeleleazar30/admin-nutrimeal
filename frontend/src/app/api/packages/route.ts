import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const packages = db.getPackages();
  return NextResponse.json({
    success: true,
    total: packages.length,
    data: packages,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.type || !body.price) {
      return NextResponse.json(
        { success: false, message: 'Nama paket, tipe, dan harga wajib diisi.' },
        { status: 400 }
      );
    }

    const newPackage = db.createPackage({
      name: body.name,
      type: body.type,
      description: body.description || '',
      price: Number(body.price),
      portions: body.portions || '1 Porsi',
      portionCount: Number(body.portionCount) || 1,
      targetAudience: body.targetAudience || 'Personal',
      salesCount: Number(body.salesCount) || 0,
      percentage: Number(body.percentage) || 10,
      color: body.color || '#059669',
      includedMeals: Array.isArray(body.includedMeals) ? body.includedMeals : [],
    });

    return NextResponse.json({
      success: true,
      message: 'Paket katering berhasil ditambahkan.',
      data: newPackage,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal membuat paket katering.' },
      { status: 500 }
    );
  }
}
