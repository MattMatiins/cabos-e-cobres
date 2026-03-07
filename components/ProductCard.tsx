'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, WHATSAPP_URL } from '@/lib/products';
import { useCart } from '@/lib/cart-context';

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `Olá! Gostaria de mais informações sobre: ${product.name} (Cód. ${product.code}) - ${product.priceFormatted}`
    );
    window.open(`${WHATSAPP_URL}?text=${msg}`, '_blank');
  }

  return (
    <div
      className="product-card-stagger opacity-0"
      style={{ animation: `fadeUp 0.5s ease-out ${0.05 + index * 0.04}s forwards` }}
    >
      <div className="product-card bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden group flex flex-col">
        {/* Image */}
        <div className="product-img-wrapper relative bg-[#0f172a]">
          {!imgError && product.images?.[0] ? (
            product.images[0].startsWith('data:') ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={600}
                height={450}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                unoptimized
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
              <svg width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <rect x={3} y={3} width={18} height={18} rx={2} />
                <circle cx={8.5} cy={8.5} r={1.5} />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}

          {/* Hover overlay - subtle decorative */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Stock badge */}
          {product.inStock && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-green-500/90 text-white text-[0.55rem] md:text-[0.6rem] font-bold tracking-wider uppercase px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg backdrop-blur-sm">
              Em Estoque
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-5 flex flex-col flex-1">
          <p className="text-orange-400/70 text-[0.6rem] md:text-[0.65rem] tracking-[0.12em] uppercase font-semibold mb-0.5">
            {product.category}
          </p>
          <p className="text-slate-500 text-[0.6rem] md:text-[0.65rem] tracking-[0.1em] uppercase font-medium mb-1">
            Cód. {product.code}
          </p>
          <h3 className="font-semibold text-[0.8rem] md:text-[0.9rem] text-slate-100 mb-2 md:mb-3 line-clamp-2 leading-snug md:leading-relaxed flex-1">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1.5 md:gap-2">
            <span className="font-extrabold text-lg md:text-2xl text-orange-400">
              {product.priceFormatted}
            </span>
            <span className="text-[0.6rem] md:text-[0.65rem] text-slate-500 font-medium">no PIX</span>
          </div>

          {/* CTA Buttons - always visible */}
          <div className="flex gap-2 mt-3 md:mt-4">
            <button
              onClick={handleAddToCart}
              className={`flex-1 ${added ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'} text-white rounded-xl py-2.5 md:py-3 font-bold text-[0.65rem] md:text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 md:gap-2 min-h-[44px]`}
            >
              {added ? (
                <>
                  <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  <span className="hidden sm:inline">Adicionado!</span>
                  <span className="sm:hidden">OK!</span>
                </>
              ) : (
                <>
                  <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                  Adicionar
                </>
              )}
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-11 md:w-12 min-h-[44px] bg-[#25D366] text-white rounded-xl flex items-center justify-center hover:bg-[#20bd5a] transition-colors flex-shrink-0"
              aria-label="WhatsApp"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
