import { NextRequest, NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/store';

function checkAdminAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  return auth === `Bearer ${password}`;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getProducts());
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const product = addProduct({
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      slug: body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      name: body.name,
      code: body.code || '',
      price: body.price,
      priceFormatted: `R$ ${(body.price / 100).toFixed(2).replace('.', ',')}`,
      description: body.description || '',
      images: body.images || [],
      category: body.category || 'Geral',
      inStock: body.inStock !== false,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (data.price) {
      data.priceFormatted = `R$ ${(data.price / 100).toFixed(2).replace('.', ',')}`;
    }
    const updated = updateProduct(id, data);
    if (!updated) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    const deleted = deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
