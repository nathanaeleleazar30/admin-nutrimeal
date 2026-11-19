import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada file gambar yang dikirim.' },
        { status: 400 }
      );
    }

    // Teruskan FormData langsung ke Express Backend
    const backendFormData = new FormData();
    backendFormData.append('image', file, file.name);

    const res = await fetch(`${BACKEND_BASE}/api/upload`, {
      method: 'POST',
      body: backendFormData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error uploading file in Next.js API:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal mengunggah file ke backend.' },
      { status: 500 }
    );
  }
}
