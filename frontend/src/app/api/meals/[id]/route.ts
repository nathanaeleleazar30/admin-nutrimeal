import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { mapBackendMealToFrontend } from '../route';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_MEALS_URL = `${BACKEND_BASE}/api/meals`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND_MEALS_URL}/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return NextResponse.json({
          success: true,
          data: mapBackendMealToFrontend(json.data),
        });
      }
    }
  } catch (error) {
    console.warn(`⚠️ Gagal fetch meal ${id} dari backend Express:`, error);
  }

  // Fallback ke data-store lokal
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

    // Petakan payload agar kompatibel dengan Express & MySQL
    const mappedPayload: Record<string, any> = {};
    if (body.name !== undefined) mappedPayload.name = body.name;
    if (body.category !== undefined) mappedPayload.category = body.category;
    if (body.calories !== undefined) mappedPayload.calories = Number(body.calories);
    if (body.price !== undefined) mappedPayload.price = Number(body.price);
    if (body.discount_percent !== undefined || body.discountPercent !== undefined) {
      mappedPayload.discount_percent = Number(body.discount_percent ?? body.discountPercent);
    }
    if (body.image_url !== undefined || body.imageUrl !== undefined) {
      mappedPayload.image_url = body.image_url || body.imageUrl;
    }
    if (body.description !== undefined) mappedPayload.description = body.description;
    if (body.schedule !== undefined) mappedPayload.schedule = body.schedule;
    if (body.delivery_time !== undefined || body.deliveryTime !== undefined) {
      mappedPayload.delivery_time = body.delivery_time || body.deliveryTime;
    }
    if (body.tags !== undefined) {
      mappedPayload.tags = Array.isArray(body.tags) ? body.tags.join(', ') : body.tags;
    }
    if (body.nutrition?.protein || body.protein !== undefined) {
      mappedPayload.protein = body.protein || body.nutrition?.protein;
    }
    if (body.nutrition?.fat || body.fat !== undefined) {
      mappedPayload.fat = body.fat || body.nutrition?.fat;
    }
    if (body.nutrition?.carbs || body.carbs !== undefined) {
      mappedPayload.carbs = body.carbs || body.nutrition?.carbs;
    }
    if (body.is_available !== undefined) {
      mappedPayload.is_available = body.is_available ? 1 : 0;
    } else if (body.isAvailable !== undefined) {
      mappedPayload.is_available = body.isAvailable ? 1 : 0;
    }

    // 1. Update ke Backend Express
    try {
      const backendRes = await fetch(`${BACKEND_MEALS_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedPayload),
      });

      if (backendRes.ok) {
        const backendJson = await backendRes.json();
        const updatedMeal = mapBackendMealToFrontend(backendJson.data);

        // Update juga data-store lokal
        try {
          db.updateMeal(id, {
            ...updatedMeal,
            imageUrl: updatedMeal.image_url,
            isAvailable: updatedMeal.isAvailable,
          });
        } catch {}

        return NextResponse.json({
          success: true,
          message: 'Menu berhasil diperbarui di database backend.',
          data: updatedMeal,
        });
      }
    } catch (err) {
      console.warn(`⚠️ Gagal update meal ${id} ke backend Express:`, err);
    }

    // 2. Fallback update ke data-store lokal
    const updated = db.updateMeal(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: `Menu dengan ID ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Menu berhasil diperbarui (disimpan sementara di memori).',
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

  // 1. Hapus dari Backend Express
  let backendDeleted = false;
  try {
    const backendRes = await fetch(`${BACKEND_MEALS_URL}/${id}`, {
      method: 'DELETE',
    });
    if (backendRes.ok) {
      backendDeleted = true;
    }
  } catch (err) {
    console.warn(`⚠️ Gagal delete meal ${id} dari backend Express:`, err);
  }

  // 2. Hapus dari data-store lokal
  const localDeleted = db.deleteMeal(id);

  if (!backendDeleted && !localDeleted) {
    return NextResponse.json(
      { success: false, message: `Menu dengan ID ${id} tidak ditemukan.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Menu berhasil dihapus dari sistem dan database.',
  });
}
