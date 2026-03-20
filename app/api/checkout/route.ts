import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProducts, createOrder, getSettings } from '@/lib/store';
import type { DeliveryMethod, Order } from '@/lib/types';

// ── Stripe Checkout ──────────────────────────────────────────────
async function createStripeCheckout(
  items: { productId: string; quantity: number }[],
  orderId: string,
  deliveryMethod: DeliveryMethod,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  shippingAddress: string,
  origin: string
) {
  if (!stripe) {
    throw new Error('Stripe não está configurado. Verifique suas chaves no painel de administração.');
  }

  const lineItems = items
    .map((item) => {
      const product = getProducts().find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: product.name,
            description: `Código: ${product.code}`,
            images: product.images.filter((img: string) => img.startsWith('http')).slice(0, 1),
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  if (lineItems.length === 0) throw new Error('Nenhum produto válido');

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
  return { url: session.url || '', sessionId: session.id };
}

// ── Mercado Pago Checkout ────────────────────────────────────────
async function createMercadoPagoCheckout(
  items: { productId: string; quantity: number }[],
  orderId: string,
  customerName: string,
  customerEmail: string,
  origin: string,
  accessToken: string
) {
  const mpItems = items
    .map((item) => {
      const product = getProducts().find((p) => p.id === item.productId);
      if (!product) return null;
      const httpImage = product.images.find((img: string) => img.startsWith('http'));
      const mpItem: any = {
        title: product.name,
        description: product.code ? `Código: ${product.code}` : product.name,
        quantity: item.quantity,
        currency_id: 'BRL',
        unit_price: Math.round(product.price) / 100, // MP uses reais, max 2 decimals
      };
      // Only include picture_url if we have a valid HTTP URL (MP rejects empty strings)
      if (httpImage) {
        mpItem.picture_url = httpImage;
      }
      return mpItem;
    })
    .filter(Boolean);

  if (mpItems.length === 0) throw new Error('Nenhum produto válido');

  // Validate unit_price > 0
  const invalidItem = mpItems.find((item: any) => !item.unit_price || item.unit_price <= 0);
  if (invalidItem) {
    throw new Error(`Produto "${invalidItem.title}" tem preço inválido`);
  }

  const preference: any = {
    items: mpItems,
    external_reference: orderId,
    back_urls: {
      success: `${origin}/success?order_id=${orderId}`,
      failure: `${origin}/cancel`,
      pending: `${origin}/success?order_id=${orderId}&pending=true`,
    },
    auto_return: 'approved',
    statement_descriptor: 'CABOSECOBRES',
  };

  // Add payer info (name always, email only if provided)
  if (customerName || customerEmail) {
    preference.payer = {} as any;
    if (customerName) preference.payer.name = customerName;
    if (customerEmail) preference.payer.email = customerEmail;
  }

  // Only add notification_url for production (MP rejects localhost)
  if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    preference.notification_url = `${origin}/api/webhooks/mercadopago`;
  }

  console.log('[MP Checkout] Creating preference:', JSON.stringify({
    items: mpItems.length,
    orderId,
    origin,
    hasPayerEmail: !!customerEmail,
    tokenType: accessToken.startsWith('TEST-') ? 'TEST' : accessToken.startsWith('APP_USR') ? 'APP_USR' : 'OTHER',
  }));

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preference),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    console.error('[MP Checkout] API Error:', res.status, errorText);
    let errorMsg = `Erro Mercado Pago (${res.status})`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.message) errorMsg = `MP: ${errorData.message}`;
      if (errorData.cause?.[0]?.description) errorMsg = `MP: ${errorData.cause[0].description}`;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await res.json();
  // Use sandbox URL for test tokens, production for live tokens
  const checkoutUrl = accessToken.startsWith('TEST-') ? data.sandbox_init_point : data.init_point;

  console.log('[MP Checkout] Preference created:', {
    preferenceId: data.id,
    checkoutUrl: checkoutUrl ? 'OK' : 'MISSING',
    initPoint: data.init_point ? 'present' : 'absent',
    sandboxInitPoint: data.sandbox_init_point ? 'present' : 'absent',
  });

  if (!checkoutUrl) {
    throw new Error('Mercado Pago não retornou URL de checkout. Verifique se o token está ativo.');
  }

  return { url: checkoutUrl, preferenceId: data.id };
}

// ── Main Handler ─────────────────────────────────────────────────
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

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const settings = getSettings();

    // Calculate total
    const total = items.reduce((sum, item) => {
      const product = getProducts().find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    // Create order
    const order: Order = {
      id: orderId,
      items: items
        .map((item) => {
          const product = getProducts().find((p) => p.id === item.productId);
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
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        { status: 'novo', timestamp: new Date().toISOString(), note: 'Pedido criado' },
      ],
    };

    // Route to correct payment gateway
    let checkoutResult: { url: string; sessionId?: string; preferenceId?: string };

    if (settings.paymentGateway === 'mercadopago') {
      if (!settings.mercadoPagoAccessToken) {
        return NextResponse.json(
          { error: 'Mercado Pago não está configurado. Configure o Access Token no painel admin.' },
          { status: 500 }
        );
      }
      checkoutResult = await createMercadoPagoCheckout(
        items,
        orderId,
        customerName,
        customerEmail,
        origin,
        settings.mercadoPagoAccessToken
      );
    } else {
      checkoutResult = await createStripeCheckout(
        items,
        orderId,
        deliveryMethod,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress || '',
        origin
      );
      order.stripeSessionId = checkoutResult.sessionId;
    }

    createOrder(order);

    return NextResponse.json({ url: checkoutResult.url, orderId, preferenceId: checkoutResult.preferenceId });
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
