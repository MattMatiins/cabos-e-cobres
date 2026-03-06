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
      className="perspective-container product-card-stagger opacity-0"
      style={{ animation: `cardIn 0.6s ease-out ${0.05 + index * 0.05}s forwards` }}
    >
      <div className="product-card card-3d bg-surface-card border border-[#222] rounded-[14px] overflow-hidden hover:border-[#333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_60px_rgba(245,166,35,0.1)] group">
        <div className="product-img-wrapper relative">
          {!imgError ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600">
              <svg width={48} height={48} fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <rect x={3} y={3} width={18} height={18} rx={2} />
                <circle cx={8.5} cy={8.5} r={1.5} />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 max-sm:hidden">
            <button
              onClick={handleAddToCart}
              className={`flex-1 ${added ? 'bg-green-500' : 'bg-brand'} text-black rounded-xl py-3 font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all font-[inherit] flex items-center justify-center gap-2`}
            >
              {added ? (
                <>
                  <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  Adicionado!
                </>
              ) : (
                <>
                  <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>
                  Adicionar
                </>
              )}
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center hover:bg-[#20bd5a] transition-colors"
              aria-label="WhatsApp"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
          </div>

          <div className="absolute top-3 left-3 bg-brand/90 text-black text-[0.65rem] font-bold tracking-wider uppercase px-3 py-1 rounded-full backdrop-blur-sm">
            Em Estoque
          </div>
        </div>

        <div className="p-5">
          <p className="text-gray-600 text-[0.7rem] tracking-[0.1em] uppercase mb-1.5">Cód. {product.code}</p>
          <h3 className="font-medium text-[0.9rem] text-gray-100 mb-3 line-clamp-2 leading-relaxed">{product.name}</h3>
          <div className="font-display text-xl text-brand">
            {product.priceFormatted}
            <span className="block text-[0.7rem] text-gray-500 font-body font-normal mt-0.5">à vista no PIX</span>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5 sm:hidden">
          <button
            onClick={handleAddToCart}
            className={`flex-1 ${added ? 'bg-green-500' : 'bg-brand'} text-black rounded-xl py-3 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors`}
          >
            {added ? (
              <>
                <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                Adicionado!
              </>
            ) : (
              'Adicionar ao Carrinho'
            )}
          </button>
          <button
            onClick={handleWhatsApp}
            className="w-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center"
            aria-label="WhatsApp"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
