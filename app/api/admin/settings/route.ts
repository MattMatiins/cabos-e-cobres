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
    stripePublishableKey: settings.stripePublishableKey || '',
    mercadoPagoAccessToken: settings.mercadoPagoAccessToken ? '****' + settings.mercadoPagoAccessToken.slice(-4) : '',
    smsApiKey: settings.smsApiKey ? '****' + settings.smsApiKey.slice(-4) : '',
  });
}

export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Don't overwrite sensitive fields if they come back masked
    const currentSettings = getSettings();
    if (body.stripeSecretKey && body.stripeSecretKey.startsWith('****')) {
      body.stripeSecretKey = currentSettings.stripeSecretKey;
    }
    if (body.mercadoPagoAccessToken && body.mercadoPagoAccessToken.startsWith('****')) {
      body.mercadoPagoAccessToken = currentSettings.mercadoPagoAccessToken;
    }
    if (body.smsApiKey && body.smsApiKey.startsWith('****')) {
      body.smsApiKey = currentSettings.smsApiKey;
    }

    const updated = updateSettings(body);
    return NextResponse.json({
      ...updated,
      stripeSecretKey: updated.stripeSecretKey ? '****' + updated.stripeSecretKey.slice(-4) : '',
      mercadoPagoAccessToken: updated.mercadoPagoAccessToken ? '****' + updated.mercadoPagoAccessToken.slice(-4) : '',
      smsApiKey: updated.smsApiKey ? '****' + updated.smsApiKey.slice(-4) : '',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
