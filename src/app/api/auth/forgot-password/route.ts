import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Tautan instruksi reset kata sandi telah dikirim ke email ${email}. Silakan cek kotak masuk Anda.`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses permintaan reset kata sandi.' },
      { status: 500 }
    );
  }
}
