import { NextRequest, NextResponse } from 'next/server';

// POST: Create a shareable cart link
export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();
    // items: [{ productId: string, quantity: number }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    // Encode cart as base64
    const cartData = JSON.stringify(items.map((i: any) => ({ p: i.productId, q: i.quantity })));
    const encoded = Buffer.from(cartData).toString('base64url');

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const shareUrl = `${origin}/cart?s=${encoded}`;

    return NextResponse.json({ url: shareUrl, code: encoded });
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar link' }, { status: 500 });
  }
}
