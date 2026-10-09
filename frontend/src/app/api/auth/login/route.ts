import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi.' },
        { status: 400 }
      );
    }

    // Hubungkan langsung ke Backend Express + Database MySQL
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const backendData = await backendRes.json();

      if (!backendRes.ok || !backendData.success) {
        return NextResponse.json(
          {
            success: false,
            message: backendData.message || 'Email atau password salah.',
          },
          { status: backendRes.status || 401 }
        );
      }

      // Berhasil terautentikasi oleh Express + MySQL
      const response = NextResponse.json({
        success: true,
        message: 'Login berhasil.',
        data: backendData.data,
      });

      // Set cookie session admin
      response.cookies.set('admin_token', backendData.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 hari
      });

      return response;
    } catch (backendError) {
      console.warn('Backend Express tidak dapat dijangkau:', backendError);
      
      // Fallback validasi lokal jika backend offline
      if (email.toLowerCase().trim() === 'nathanael@nutrimeal.id' && password === 'nathanael123') {
        return NextResponse.json({
          success: true,
          message: 'Login berhasil (Admin Nathanael).',
          data: {
            id: 'adm-1',
            name: 'Nathanael',
            email: 'nathanael@nutrimeal.id',
            role: 'superadmin',
            token: 'token_nutrimeal_nathanael_' + Date.now(),
          },
        });
      }

      return NextResponse.json(
        { success: false, message: 'Gagal terhubung ke server backend Express (port 5000).' },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
