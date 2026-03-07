'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { PRODUCTS } from '@/lib/products';

function SharedCartContent() {
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const [loaded, setLoaded] = useState(false);
  const [sharedItems, setSharedItems] = useState<{ product: any; quantity: number }[]>([]);

  useEffect(() => {
    const encoded = searchParams.get('s');
    if (!encoded || loaded) return;

    try {
      const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString());
      const parsedItems = decoded
        .map((item: { p: string; q: number }) => {
          const product = PRODUCTS.find((prod) => prod.id === item.p);
          return product ? { product, quantity: item.q } : null;
        })
        .filter(Boolean);

      setSharedItems(parsedItems);

      // Add to cart
      parsedItems.forEach((item: any) => {
        addItem(item.product, item.quantity);
      });

      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }, [searchParams, loaded, addItem]);

  const sharedTotal = sharedItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <>
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="text-brand">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <h1 className="font-display text-2xl text-white mb-2">Carrinho Compartilhado</h1>
        <p className="text-gray-500 text-sm">
          {sharedItems.length > 0
            ? 'Estes itens foram adicionados ao seu carrinho.'
            : loaded
              ? 'Link inválido ou carrinho vazio.'
              : 'Carregando...'}
        </p>
      </div>

      {sharedItems.length > 0 && (
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-6">
          <div className="space-y-4 mb-6">
            {sharedItems.map((item) => (
              <div key={item.product.id} className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#0e0e0e] flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 line-clamp-2">{item.product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.quantity}x {item.product.priceFormatted}</p>
                </div>
                <p className="text-brand font-bold text-sm flex-shrink-0">
                  R$ {((item.product.price * item.quantity) / 100).toFixed(2).replace('.', ',')}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#222] pt-4 flex items-center justify-between">
            <span className="text-gray-400">Total</span>
            <span className="font-display text-xl text-brand">
              R$ {(sharedTotal / 100).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/checkout"
          className="flex-1 bg-brand text-black text-center py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_40px_rgba(245,166,35,0.3)] transition-all"
        >
          Finalizar Compra
        </Link>
        <Link
          href="/"
          className="flex-1 text-center py-4 rounded-xl border border-[#222] text-gray-400 text-sm hover:text-white hover:border-[#333] transition-all"
        >
          Continuar Comprando
        </Link>
      </div>
    </>
  );
}

function CartLoadingFallback() {
  return (
    <div className="text-center py-20">
      <div className="w-12 h-12 border-2 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Carregando carrinho...</p>
    </div>
  );
}

export default function SharedCartPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <header className="border-b border-[#222] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center font-display text-black text-sm">CC</div>
            <span className="font-display text-[1.1rem] tracking-wider uppercase text-white">
              Cabos <span className="text-brand">&amp;</span> Cobres
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Suspense fallback={<CartLoadingFallback />}>
          <SharedCartContent />
        </Suspense>
      </div>
    </div>
  );
}
