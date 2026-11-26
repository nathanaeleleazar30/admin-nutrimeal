import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_FAQS_URL = `${BACKEND_BASE}/api/faqs`;

function mapBackendFaqToFrontend(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    category: row.category,
    question: row.question,
    answer: row.answer,
    isActive: row.is_active === 1 || row.is_active === true,
    viewCount: Number(row.view_count || 0),
  };
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const res = await fetch(`${BACKEND_FAQS_URL}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: body.category,
        question: body.question,
        answer: body.answer,
        is_active: body.isActive !== undefined ? (body.isActive ? 1 : 0) : undefined,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return NextResponse.json({
        success: true,
        data: json.data ? mapBackendFaqToFrontend(json.data) : null,
      });
    }
    const errJson = await res.json().catch(() => null);
    return NextResponse.json(
      { success: false, message: errJson?.message || 'Gagal memperbarui FAQ di backend' },
      { status: res.status || 400 }
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const res = await fetch(`${BACKEND_FAQS_URL}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    }
    const errJson = await res.json().catch(() => null);
    return NextResponse.json(
      { success: false, message: errJson?.message || 'Gagal menghapus FAQ di backend' },
      { status: res.status || 400 }
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
