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

export async function GET() {
  try {
    const res = await fetch(BACKEND_FAQS_URL, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapBackendFaqToFrontend);
        return NextResponse.json({ success: true, data: mapped });
      }
    }
    return NextResponse.json(
      { success: false, data: [], message: 'Gagal mengambil data FAQ dari backend' },
      { status: 502 }
    );
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke Express Backend untuk GET /api/faqs:', error);
    return NextResponse.json(
      { success: false, data: [], message: 'Backend Express tidak terjangkau' },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(BACKEND_FAQS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: body.category,
        question: body.question,
        answer: body.answer,
        is_active: body.isActive !== false ? 1 : 0,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(
        { success: true, data: json.data ? mapBackendFaqToFrontend(json.data) : null },
        { status: 201 }
      );
    }
    const errJson = await res.json().catch(() => null);
    return NextResponse.json(
      { success: false, message: errJson?.message || 'Gagal membuat FAQ di backend' },
      { status: res.status || 400 }
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

