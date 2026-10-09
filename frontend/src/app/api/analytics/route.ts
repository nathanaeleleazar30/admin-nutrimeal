import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const analytics = db.getAnalytics();
  return NextResponse.json({
    success: true,
    data: analytics,
  });
}
