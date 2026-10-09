import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  const meals = db.getMeals({ category, search });

  return NextResponse.json({
    success: true,
    total: meals.length,
    data: meals,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.category || !body.price) {
      return NextResponse.json(
        { success: false, message: 'Nama, kategori, dan harga wajib diisi.' },
        { status: 400 }
      );
    }

    const created = db.createMeal({
      name: body.name,
      category: body.category,
      calories: Number(body.calories) || 350,
      price: Number(body.price),
      discountPercent: body.discountPercent ? Number(body.discountPercent) : undefined,
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      description: body.description || '',
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t: string) => t.trim()) : []),
      schedule: body.schedule || 'Setiap Hari',
      deliveryTime: body.deliveryTime || '12:00 - 13:00 WIB',
      nutrition: body.nutrition || {
        calories: Number(body.calories) || 350,
        protein: body.protein || '30g',
        fat: body.fat || '10g',
        carbs: body.carbs || '40g',
      },
      isAvailable: body.isAvailable !== false,
    });

    return NextResponse.json({
      success: true,
      message: 'Menu berhasil ditambahkan.',
      data: created,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses data menu.' },
      { status: 500 }
    );
  }
}
