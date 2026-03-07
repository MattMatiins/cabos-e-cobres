'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, totalItems, isOpen, setIsOpen } = useCart();
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (items.length === 0) return;
    setSharing(true);
    try {
      const res = await fetch('/api/share-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.url);
      }
    } catch {}
    setSharing(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0f172a] border-l border-white/5 z-[301] flex flex-col cart-drawer">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
              <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Carrinho</h2>
              <p className="text-slate-500 text-xs">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all">
            <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg width={32} height={32} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-slate-600">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm mb-1">Seu carrinho está vazio</p>
              <p className="text-slate-500 text-xs">Adicione produtos para continuar</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-[#1e293b] border border-white/5 rounded-xl p-3 group" style={{ animation: 'scaleIn 0.3s ease-out' }}>
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#0f172a] flex-shrink-0">
                  {item.product.images[0]?.startsWith('data:') ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Image src={item.product.images[0] || '/logo.png'} alt={item.product.name} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug mb-1">{item.product.name}</h3>
                  <p className="text-orange-400 font-bold text-sm">{item.product.priceFormatted}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-md bg-slate-700 text-slate-400 flex items-center justify-center hover:bg-slate-600 hover:text-white transition-colors text-sm">-</button>
                    <span className="text-sm font-medium w-6 text-center text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-md bg-slate-700 text-slate-400 flex items-center justify-center hover:bg-slate-600 hover:text-white transition-colors text-sm">+</button>
                    <button onClick={() => removeItem(item.product.id)} className="ml-auto w-7 h-7 rounded-md text-slate-600 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-colors">
                      <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Subtotal</span>
              <span className="font-extrabold text-xl text-orange-400">R$ {(total / 100).toFixed(2).replace('.', ',')}</span>
            </div>

            {/* Share link */}
            {shareUrl ? (
              <div className="flex gap-2">
                <input type="text" readOnly value={shareUrl} className="flex-1 bg-slate-800 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono truncate" />
                <button onClick={handleCopy} className={`px-3 py-2 rounded-lg text-xs font-bold ${copied ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'} transition-all`}>
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            ) : (
              <button onClick={handleShare} disabled={sharing} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 text-slate-400 text-xs hover:text-white hover:border-white/10 transition-all disabled:opacity-50">
                <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx={18} cy={5} r={3} /><circle cx={6} cy={12} r={3} /><circle cx={18} cy={19} r={3} /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                {sharing ? 'Gerando link...' : 'Compartilhar Carrinho'}
              </button>
            )}

            <Link href="/checkout" onClick={() => setIsOpen(false)}
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-4 rounded-xl font-bold text-sm tracking-wider uppercase shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.4)] transition-all">
              Finalizar Compra
            </Link>
            <button onClick={() => setIsOpen(false)} className="block w-full text-center text-slate-500 text-sm hover:text-white transition-colors py-2">
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
