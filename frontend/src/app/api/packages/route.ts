import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_PACKAGES_URL = `${BACKEND_BASE}/api/packages`;

export function mapBackendPackageToFrontend(row: any) {
  let includedMeals: string[] = [];
  if (Array.isArray(row.included_meals || row.includedMeals)) {
    includedMeals = row.included_meals || row.includedMeals;
  } else if (typeof (row.included_meals || row.includedMeals) === 'string') {
    const raw = row.included_meals || row.includedMeals;
    try {
      const parsed = JSON.parse(raw);
      includedMeals = Array.isArray(parsed) ? parsed : [raw];
    } catch {
      includedMeals = raw.split(',').map((s: string) => s.trim());
    }
  }

  return {
    id: String(row.id),
    name: row.name,
    type: row.type || 'Mingguan',
    description: row.description || '',
    price: Number(row.price) || 0,
    portions: row.portions || '1 Porsi',
    portionCount: Number(row.portion_count || row.portionCount || 1),
    targetAudience: row.target_audience || row.targetAudience || 'Personal',
    salesCount: Number(row.sales_count || row.salesCount || 0),
    percentage: Number(row.percentage || 10),
    color: row.color || '#059669',
    includedMeals,
  };
}

export async function GET() {
  try {
    const res = await fetch(BACKEND_PACKAGES_URL, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapBackendPackageToFrontend);
        return NextResponse.json({
          success: true,
          total: mapped.length,
          data: mapped,
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke Express Backend untuk GET /api/packages, fallback ke data-store:', error);
  }

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

    try {
      const backendPayload = {
        name: body.name,
        type: body.type,
        description: body.description || '',
        price: Number(body.price),
        portions: body.portions || '1 Porsi',
        target_audience: body.targetAudience || 'Personal',
        sales_count: Number(body.salesCount) || 0,
        percentage: Number(body.percentage) || 10,
        color: body.color || '#059669',
        included_meals: JSON.stringify(body.includedMeals || []),
      };

      const res = await fetch(BACKEND_PACKAGES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const mapped = mapBackendPackageToFrontend(json.data);
          db.createPackage(mapped);
          return NextResponse.json({
            success: true,
            message: 'Paket katering berhasil ditambahkan ke database backend.',
            data: mapped,
          }, { status: 201 });
        }
      }
    } catch (backendErr) {
      console.warn('⚠️ Gagal POST package ke Express Backend, fallback ke data-store:', backendErr);
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
