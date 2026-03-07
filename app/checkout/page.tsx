'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import type { DeliveryMethod } from '@/lib/types';

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('entrega');
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState<any>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<string>('mercadopago');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cep: '',
  });

  useEffect(() => {
    fetch('/api/payment-gateway')
      .then((r) => r.json())
      .then((d) => { if (d.gateway) setPaymentGateway(d.gateway); })
      .catch(() => {});
  }, []);

  async function calcShipping(cep: string) {
    if (cep.replace(/\D/g, '').length < 5) return;
    setShippingLoading(true);
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep }),
      });
      if (res.ok) setShipping(await res.json());
    } catch {}
    setShippingLoading(false);
  }

  function handleCepChange(value: string) {
    const clean = value.replace(/\D/g, '');
    let formatted = clean;
    if (clean.length > 5) formatted = clean.slice(0, 5) + '-' + clean.slice(5, 8);
    setForm({ ...form, cep: formatted });
    if (clean.length >= 5) calcShipping(clean);
  }

  const shippingCost = deliveryMethod === 'retirada' ? 0 : (shipping?.price || 0);
  const grandTotal = total + shippingCost;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          deliveryMethod,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          shippingAddress: deliveryMethod === 'entrega' ? form.address : undefined,
        }),
      });

      const data = await res.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        alert('Erro ao processar pagamento. Tente novamente.');
      }
    } catch {
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width={36} height={36} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-gray-600">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h1 className="font-extrabold text-2xl text-white mb-3">Carrinho Vazio</h1>
          <p className="text-gray-500 mb-8">Adicione produtos ao carrinho para continuar.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-orange-500 text-black px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider">
            Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <header className="border-b border-[#222] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">CC</div>
            <span className="font-bold text-[1.1rem] tracking-wider uppercase text-white">
              Cabos <span className="text-orange-400">&amp;</span> Cobres
            </span>
          </Link>
          <span className="text-gray-500 text-sm">Finalizar Compra</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left */}
          <div className="lg:col-span-3 space-y-8">
            {/* Delivery Method */}
            <div>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 text-sm font-bold">1</span>
                Método de Entrega
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setDeliveryMethod('entrega')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'entrega' ? 'border-orange-500 bg-orange-500/5' : 'border-[#222] hover:border-[#333]'}`}>
                  <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className={deliveryMethod === 'entrega' ? 'text-orange-400' : 'text-gray-500'}>
                    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  </svg>
                  <p className="font-bold text-sm mt-2">Entrega</p>
                  <p className="text-gray-500 text-xs mt-1">Receba no seu endereço</p>
                </button>
                <button type="button" onClick={() => setDeliveryMethod('retirada')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'retirada' ? 'border-orange-500 bg-orange-500/5' : 'border-[#222] hover:border-[#333]'}`}>
                  <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className={deliveryMethod === 'retirada' ? 'text-orange-400' : 'text-gray-500'}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <p className="font-bold text-sm mt-2">Retirada</p>
                  <p className="text-gray-500 text-xs mt-1">Retire na loja</p>
                </button>
              </div>
              {deliveryMethod === 'retirada' && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs leading-relaxed">
                  <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="inline mr-1">
                    <circle cx={12} cy={12} r={10} /><path d="M12 16v-4M12 8h.01" />
                  </svg>
                  Você receberá uma notificação por SMS assim que seu pedido estiver pronto para retirada.
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 text-sm font-bold">2</span>
                Dados de Contato
              </h2>
              <div className="space-y-3">
                <input type="text" placeholder="Nome completo" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="email" placeholder="E-mail" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
                  <input type="tel" placeholder="Telefone (com DDD)" required value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
                </div>

                {deliveryMethod === 'entrega' && (
                  <>
                    {/* CEP + Shipping Calc */}
                    <div className="flex gap-3">
                      <input type="text" placeholder="CEP (ex: 15000-000)" maxLength={9} value={form.cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className="w-40 bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
                      <div className="flex-1 flex items-center px-4 rounded-xl bg-[#161616] border border-[#222]">
                        {shippingLoading ? (
                          <span className="text-gray-500 text-xs">Calculando...</span>
                        ) : shipping ? (
                          <span className={`text-xs font-bold ${shipping.price === 0 ? 'text-green-400' : 'text-orange-400'}`}>
                            {shipping.priceFormatted} — {shipping.message}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">Informe o CEP para calcular o frete</span>
                        )}
                      </div>
                    </div>
                    <input type="text" placeholder="Endereço completo (Rua, Número, Bairro, Cidade - UF)" required
                      value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-5">Resumo do Pedido</h2>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#0e0e0e] flex-shrink-0">
                      <Image src={item.product.images[0]} alt={item.product.name} width={56} height={56} className="w-full h-full object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 line-clamp-2">{item.product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded bg-[#222] text-gray-400 flex items-center justify-center text-xs hover:bg-[#333]">-</button>
                          <span className="text-xs w-5 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded bg-[#222] text-gray-400 flex items-center justify-center text-xs hover:bg-[#333]">+</button>
                        </div>
                        <span className="text-orange-400 text-xs font-bold">
                          R$ {((item.product.price * item.quantity) / 100).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeItem(item.product.id)} className="text-gray-600 hover:text-red-400 self-start">
                      <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#222] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>R$ {(total / 100).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frete</span>
                  <span className={shippingCost === 0 ? 'text-green-400' : ''}>
                    {deliveryMethod === 'retirada' ? 'Grátis (retirada)' : shipping ? shipping.priceFormatted : 'Informe CEP'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#222]">
                  <span>Total</span>
                  <span className="text-orange-400">R$ {(grandTotal / 100).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-6 bg-orange-500 text-black py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_40px_rgba(245,166,35,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                    Processando...
                  </>
                ) : (
                  <>
                    <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect x={1} y={4} width={22} height={16} rx={2} ry={2} /><line x1={1} y1={10} x2={23} y2={10} />
                    </svg>
                    {paymentGateway === 'mercadopago' ? 'Pagar com Mercado Pago' : 'Pagar com Stripe'}
                  </>
                )}
              </button>
              <p className="text-center text-gray-600 text-[0.65rem] mt-3">
                {paymentGateway === 'mercadopago'
                  ? 'Pagamento seguro via Mercado Pago. Aceita PIX, cartão e boleto.'
                  : 'Pagamento seguro via Stripe. Aceita cartão, boleto e PIX.'}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
