import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_MEALS_URL = `${BACKEND_BASE}/api/meals`;

export function mapBackendMealToFrontend(row: any) {
  const calories = Number(row.calories) || 0;
  const protein = row.protein || '30g';
  const fat = row.fat || '10g';
  const carbs = row.carbs || '40g';
  const isAvailable = row.is_available === 1 || row.is_available === true;
  const imageUrl =
    row.image_url ||
    row.imageUrl ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';

  let tags: string[] = [];
  if (Array.isArray(row.tags)) {
    tags = row.tags;
  } else if (typeof row.tags === 'string' && row.tags.trim()) {
    tags = row.tags.split(',').map((t: string) => t.trim());
  }

  return {
    ...row,
    id: String(row.id),
    name: row.name,
    category: row.category,
    calories,
    price: Number(row.price) || 0,
    discountPercent: Number(row.discount_percent || row.discountPercent || 0),
    discount_percent: Number(row.discount_percent || row.discountPercent || 0),
    imageUrl,
    image_url: imageUrl,
    description: row.description || '',
    tags,
    schedule: row.schedule || 'Setiap Hari',
    deliveryTime: row.delivery_time || row.deliveryTime || '12:00 - 13:00 WIB',
    delivery_time: row.delivery_time || row.deliveryTime || '12:00 - 13:00 WIB',
    nutrition: {
      calories,
      protein,
      fat,
      carbs,
    },
    protein,
    fat,
    carbs,
    isAvailable,
    is_available: isAvailable ? 1 : 0,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  const query = new URLSearchParams();
  if (category && category !== 'Semua') query.append('category', category);
  if (search) query.append('search', search);
  const queryString = query.toString();

  try {
    const res = await fetch(`${BACKEND_MEALS_URL}${queryString ? `?${queryString}` : ''}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapBackendMealToFrontend);
        return NextResponse.json({
          success: true,
          total: mapped.length,
          data: mapped,
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke Express Backend untuk GET /api/meals, beralih ke fallback data-store:', error);
  }

  // Fallback ke in-memory data store jika backend tidak merespons
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
    if (!body.name || !body.category || body.price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Nama, kategori, dan harga wajib diisi.' },
        { status: 400 }
      );
    }

    const payload = {
      name: body.name,
      category: body.category,
      calories: Number(body.calories) || 350,
      price: Number(body.price) || 0,
      discount_percent: Number(body.discount_percent ?? body.discountPercent ?? 0),
      image_url:
        body.image_url ||
        body.imageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      description: body.description || 'Menu katering sehat bergizi',
      schedule: body.schedule || 'Setiap Hari',
      delivery_time: body.delivery_time || body.deliveryTime || '12:00 - 13:00 WIB',
      tags: Array.isArray(body.tags) ? body.tags.join(', ') : body.tags || '',
      protein: body.protein || body.nutrition?.protein || '30g',
      fat: body.fat || body.nutrition?.fat || '10g',
      carbs: body.carbs || body.nutrition?.carbs || '40g',
      is_available:
        body.is_available !== undefined
          ? (body.is_available ? 1 : 0)
          : body.isAvailable !== undefined
          ? (body.isAvailable ? 1 : 0)
          : 1,
    };

    // 1. Simpan ke Backend Express & MySQL
    try {
      const backendRes = await fetch(BACKEND_MEALS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (backendRes.ok) {
        const backendJson = await backendRes.json();
        const savedMeal = mapBackendMealToFrontend(backendJson.data);

        // Sinkronkan juga ke data-store lokal
        try {
          db.createMeal({
            ...savedMeal,
            id: savedMeal.id,
            imageUrl: savedMeal.image_url,
            isAvailable: savedMeal.isAvailable,
          });
        } catch {}

        return NextResponse.json(
          {
            success: true,
            message: 'Menu berhasil ditambahkan ke database backend.',
            data: savedMeal,
          },
          { status: 201 }
        );
      } else {
        const errJson = await backendRes.json().catch(() => null);
        console.error('Backend returned error on POST /api/meals:', errJson);
      }
    } catch (err) {
      console.warn('⚠️ Gagal terhubung ke Express Backend untuk POST /api/meals:', err);
    }

    // 2. Fallback: jika backend offline, simpan ke in-memory data store
    const created = db.createMeal({
      name: payload.name,
      category: payload.category,
      calories: payload.calories,
      price: payload.price,
      discountPercent: payload.discount_percent,
      imageUrl: payload.image_url,
      description: payload.description,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t: string) => t.trim()) : []),
      schedule: payload.schedule,
      deliveryTime: payload.delivery_time,
      nutrition: {
        calories: payload.calories,
        protein: payload.protein,
        fat: payload.fat,
        carbs: payload.carbs,
      },
      isAvailable: payload.is_available === 1,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Menu berhasil ditambahkan (disimpan sementara di memori).',
        data: created,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses data menu.' },
      { status: 500 }
    );
  }
}
