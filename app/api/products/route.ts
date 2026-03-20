import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/store';

// Public endpoint — no auth required
export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export const dynamic = 'force-dynamic';
