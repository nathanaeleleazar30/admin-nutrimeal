import { NextResponse } from 'next/server';

const BACKEND_URL =
  (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, email, name, googleId, forAdmin } = body;

    // Teruskan ke Backend Express — wajib terhubung, tidak ada fallback
    let backendRes: Response;
    try {
      backendRes = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          email,
          name,
          googleId,
          forAdmin: forAdmin ?? true,
        }),
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Server backend tidak dapat dijangkau. Pastikan backend Express berjalan di port 5000.',
        },
        { status: 503 }
      );
    }

    const backendData = await backendRes.json();

    if (!backendRes.ok || !backendData.success) {
      return NextResponse.json(
        {
          success: false,
          message: backendData.message || 'Verifikasi Google Admin gagal.',
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login Google Admin berhasil.',
      data: backendData.data,
    });

    // Simpan cookie admin_token
    if (backendData.data?.token) {
      response.cookies.set('admin_token', backendData.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memproses login Google.' },
      { status: 500 }
    );
  }
}
