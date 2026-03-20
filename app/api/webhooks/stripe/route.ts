import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getOrders, updateOrder } from '@/lib/store';
import { sendOrderSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    let event;

    if (endpointSecret && stripe) {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const orders = await getOrders();
        const existingOrder = orders.find((o) => o.id === orderId);
        const updated = await updateOrder(orderId, {
          status: 'pago',
          stripeSessionId: session.id,
          statusHistory: [
            ...(existingOrder?.statusHistory || []),
            { status: 'pago', timestamp: new Date().toISOString(), note: 'Pagamento confirmado via Stripe' },
          ],
        });

        if (updated) {
          await sendOrderSMS(updated, 'pago');
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
