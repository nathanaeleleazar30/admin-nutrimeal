import { NextResponse } from 'next/server';

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

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      whatsapp: whatsapp || '',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil.',
      data: newUser,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pendaftaran.' },
      { status: 500 }
    );
  }
}
