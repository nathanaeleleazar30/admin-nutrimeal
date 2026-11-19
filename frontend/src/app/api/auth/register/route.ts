import { NextResponse } from 'next/server';

const BACKEND_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // Pendaftaran Admin hanya bisa dilakukan oleh Superadmin melalui backend
    // Endpoint register di sini diteruskan ke backend
    let backendRes: Response;
    try {
      backendRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, whatsapp, password }),
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Server backend tidak dapat dijangkau. Pastikan backend berjalan di port 5000.',
        },
        { status: 503 }
      );
    }

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Pendaftaran gagal.' },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Pendaftaran berhasil.',
      data: data.data,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pendaftaran.' },
      { status: 500 }
    );
  }
}
