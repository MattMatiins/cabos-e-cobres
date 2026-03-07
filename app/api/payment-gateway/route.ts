import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/store';

export async function GET() {
  const settings = getSettings();
  return NextResponse.json({ gateway: settings.paymentGateway });
}
