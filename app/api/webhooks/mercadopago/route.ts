import { NextRequest, NextResponse } from 'next/server';
import { getOrders, updateOrder } from '@/lib/store';
import { getSettings } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mercado Pago sends different notification types
    if (body.type === 'payment' || body.action === 'payment.updated') {
      const paymentId = body.data?.id;
      if (!paymentId) {
        return NextResponse.json({ ok: true });
      }

      const settings = getSettings();
      if (!settings.mercadoPagoAccessToken) {
        console.error('MP webhook: no access token configured');
        return NextResponse.json({ error: 'Not configured' }, { status: 500 });
      }

      // Fetch payment details from Mercado Pago
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${settings.mercadoPagoAccessToken}`,
        },
      });

      if (!paymentRes.ok) {
        console.error('MP webhook: failed to fetch payment', await paymentRes.text());
        return NextResponse.json({ error: 'Payment fetch failed' }, { status: 500 });
      }

      const payment = await paymentRes.json();
      const orderId = payment.external_reference;

      if (!orderId) {
        return NextResponse.json({ ok: true });
      }

      // Update order status based on payment status
      if (payment.status === 'approved') {
        updateOrder(orderId, {
          status: 'pago',
          statusHistory: [
            ...(getOrders().find((o) => o.id === orderId)?.statusHistory || []),
            {
              status: 'pago',
              timestamp: new Date().toISOString(),
              note: `Pagamento confirmado via Mercado Pago (ID: ${paymentId})`,
            },
          ],
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('MP webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
