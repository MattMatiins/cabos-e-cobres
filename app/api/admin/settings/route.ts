import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/store';

function checkAdminAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  return auth === `Bearer ${password}`;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const settings = getSettings();
  // Mask sensitive keys
  return NextResponse.json({
    ...settings,
    stripeSecretKey: settings.stripeSecretKey ? '****' + settings.stripeSecretKey.slice(-4) : '',
    smsApiKey: settings.smsApiKey ? '****' + settings.smsApiKey.slice(-4) : '',
  });
}

export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = updateSettings(body);
    return NextResponse.json({
      ...updated,
      stripeSecretKey: updated.stripeSecretKey ? '****' + updated.stripeSecretKey.slice(-4) : '',
      smsApiKey: updated.smsApiKey ? '****' + updated.smsApiKey.slice(-4) : '',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
