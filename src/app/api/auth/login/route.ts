import { NextResponse } from 'next/server';

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

    // Dummy auth check (Siap dihubungkan ke Prisma/Database nanti)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 6 karakter.' },
        { status: 400 }
      );
    }

    const dummyUser = {
      id: 'usr_1',
      name: email.split('@')[0],
      email: email,
      token: 'jwt_dummy_nutrimeal_token_' + Date.now(),
    };

    return NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      data: dummyUser,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
