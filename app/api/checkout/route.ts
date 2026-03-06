import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PRODUCTS } from '@/lib/products';
import { createOrder } from '@/lib/store';
import type { DeliveryMethod, Order } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      deliveryMethod,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
    }: {
      items: { productId: string; quantity: number }[];
      deliveryMethod: DeliveryMethod;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress?: string;
    } = body;

    // Validate items
    const lineItems = items
      .map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          price_data: {
            currency: 'brl',
            product_data: {
              name: product.name,
              description: `Código: ${product.code}`,
              images: product.images.slice(0, 1),
            },
            unit_amount: product.price,
          },
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'Nenhum produto válido' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Create Stripe session
    const sessionParams: any = {
      mode: 'payment',
      payment_method_types: ['card', 'boleto'],
      line_items: lineItems,
      customer_email: customerEmail,
      metadata: {
        orderId,
        deliveryMethod,
        customerName,
        customerPhone,
        shippingAddress: shippingAddress || '',
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/cancel`,
    };

    if (deliveryMethod === 'entrega') {
      sessionParams.shipping_address_collection = { allowed_countries: ['BR'] };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create order in store
    const total = items.reduce((sum, item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const order: Order = {
      id: orderId,
      items: items
        .map((item) => {
          const product = PRODUCTS.find((p) => p.id === item.productId);
          if (!product) return null;
          return {
            productId: product.id,
            name: product.name,
            code: product.code,
            price: product.price,
            quantity: item.quantity,
          };
        })
        .filter(Boolean) as Order['items'],
      status: 'novo',
      deliveryMethod,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      stripeSessionId: session.id,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        { status: 'novo', timestamp: new Date().toISOString(), note: 'Pedido criado' },
      ],
    };

    createOrder(order);

    return NextResponse.json({ url: session.url, orderId });
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
