import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PRODUCTS } from '@/lib/products';

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity = 1 } = await req.json();

    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: product.name,
              description: `Código: ${product.code}`,
              images: product.images.slice(0, 1),
            },
            unit_amount: product.price,
          },
          quantity,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['BR'],
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Erro ao criar sessão Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
