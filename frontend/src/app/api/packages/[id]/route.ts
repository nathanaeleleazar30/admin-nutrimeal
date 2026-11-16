import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { mapBackendPackageToFrontend } from '../route';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_PACKAGES_URL = `${BACKEND_BASE}/api/packages`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND_PACKAGES_URL}/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return NextResponse.json({
          success: true,
          data: mapBackendPackageToFrontend(json.data),
        });
      }
    }
  } catch (error) {
    console.warn(`⚠️ Gagal fetch package ${id} dari Express:`, error);
  }

  const pkg = db.getPackageById(id);
  if (!pkg) {
    return NextResponse.json(
      { success: false, message: 'Paket katering tidak ditemukan.' },
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

    try {
      const backendPayload = {
        name: body.name,
        type: body.type,
        description: body.description,
        price: body.price !== undefined ? Number(body.price) : undefined,
        portions: body.portions,
        target_audience: body.targetAudience,
        sales_count: body.salesCount !== undefined ? Number(body.salesCount) : undefined,
        percentage: body.percentage !== undefined ? Number(body.percentage) : undefined,
        color: body.color,
        included_meals: body.includedMeals ? JSON.stringify(body.includedMeals) : undefined,
      };

      const res = await fetch(`${BACKEND_PACKAGES_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      if (res.ok) {
        const json = await res.json();
        db.updatePackage(id, body);
        return NextResponse.json({
          success: true,
          message: 'Paket berhasil diperbarui di backend database.',
          data: json.data || body,
        });
      }
    } catch (backendErr) {
      console.warn(`⚠️ Gagal PUT package ${id} ke Express:`, backendErr);
    }

    const updated = db.updatePackage(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Paket katering tidak ditemukan.' },
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
  try {
    const { id } = await params;

    try {
      await fetch(`${BACKEND_PACKAGES_URL}/${id}`, { method: 'DELETE' });
    } catch (backendErr) {
      console.warn(`⚠️ Gagal DELETE package ${id} ke Express:`, backendErr);
    }

    const deleted = db.deletePackage(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Paket katering tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Paket katering berhasil dihapus.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus paket katering.' },
      { status: 500 }
    );
  }
}
