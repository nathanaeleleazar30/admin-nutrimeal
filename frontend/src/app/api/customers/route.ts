import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;

  const customers = db.getCustomers(search);

  return NextResponse.json({
    success: true,
    total: customers.length,
    data: customers,
  });
}
