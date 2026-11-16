import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const BACKEND_FAQS_URL = `${BACKEND_BASE}/api/faqs`;

export function mapBackendFaqToFrontend(row: any) {
  return {
    id: String(row.id),
    category: row.category,
    question: row.question,
    answer: row.answer,
    isActive: row.is_active === 1 || row.is_active === true,
    viewCount: Number(row.view_count || 120),
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
  } catch (error) {
    console.warn('⚠️ Gagal terhubung ke Express Backend untuk GET /api/faqs:', error);
  }

  return NextResponse.json({
    success: true,
    data: [
      {
        id: 'faq-1',
        category: 'Pengiriman',
        question: 'Bagaimana cara mengubah alamat pengiriman langganan harian?',
        answer: 'Pelanggan dapat mengubah alamat pengiriman melalui tab Jadwal atau halaman Langganan Saya di aplikasi.',
        isActive: true,
        viewCount: 248,
      },
    ],
  });
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
      return NextResponse.json({ success: true, data: json.data }, { status: 201 });
    }
    return NextResponse.json({ success: false, message: 'Gagal membuat FAQ di backend' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

