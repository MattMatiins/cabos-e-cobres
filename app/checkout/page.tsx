'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import type { DeliveryMethod } from '@/lib/types';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

function loadMercadoPagoSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) { resolve(); return; }
    if (document.getElementById('mp-sdk')) {
      const check = setInterval(() => {
        if (window.MercadoPago) { clearInterval(check); resolve(); }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.id = 'mp-sdk';
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar SDK do Mercado Pago'));
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('entrega');
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState<any>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<string>('mercadopago');
  const [mpPublicKey, setMpPublicKey] = useState<string>('');
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cep: '',
  });

  // Phase 2: payment state
  const [phase, setPhase] = useState<'form' | 'payment'>('form');
  const [preferenceId, setPreferenceId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [brickReady, setBrickReady] = useState(false);
  const walletContainerRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const brickControllerRef = useRef<any>(null);

  useEffect(() => {
    fetch('/api/payment-gateway')
      .then((r) => r.json())
      .then((d) => {
        if (d.gateway) setPaymentGateway(d.gateway);
        if (d.mpPublicKey) setMpPublicKey(d.mpPublicKey);
      })
      .catch(() => {});
  }, []);

  // Render Wallet Brick when entering payment phase
  useEffect(() => {
    if (phase !== 'payment' || !preferenceId || !mpPublicKey || paymentGateway !== 'mercadopago') return;

    let cancelled = false;

    async function renderBrick() {
      try {
        await loadMercadoPagoSDK();
        if (cancelled) return;

        const mp = new window.MercadoPago(mpPublicKey, { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();

        // Clear previous brick if any
        if (walletContainerRef.current) {
          walletContainerRef.current.innerHTML = '';
        }

        const controller = await bricksBuilder.create('wallet', 'wallet_container', {
          initialization: {
            preferenceId: preferenceId,
            redirectMode: 'modal',
          },
          callbacks: {
            onReady: () => {
              if (!cancelled) setBrickReady(true);
            },
            onError: (error: any) => {
              console.error('[MP Brick Error]', error);
              if (!cancelled) setCheckoutError('Erro ao carregar pagamento. Tente novamente.');
            },
          },
        });

        if (!cancelled) {
          brickControllerRef.current = controller;
        }
      } catch (err: any) {
        console.error('[MP SDK Error]', err);
        if (!cancelled) setCheckoutError('Erro ao inicializar pagamento: ' + (err.message || 'Tente novamente'));
      }
    }

    renderBrick();
    return () => { cancelled = true; };
  }, [phase, preferenceId, mpPublicKey, paymentGateway]);

  // Poll order status when in payment phase
  const pollOrderStatus = useCallback(() => {
    if (!orderId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/order-status?orderId=${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'pago') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setPaymentStatus('pago');
            clearCart();
            window.location.href = `/success?order_id=${orderId}`;
          }
        }
      } catch {}
    }, 3000);
  }, [orderId, clearCart]);

  useEffect(() => {
    if (phase === 'payment' && orderId) {
      pollOrderStatus();
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [phase, orderId, pollOrderStatus]);

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
    setCheckoutError('');
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

      if (paymentGateway === 'mercadopago' && data.preferenceId) {
        // Inline payment: transition to payment phase
        setPreferenceId(data.preferenceId);
        setOrderId(data.orderId);
        setPhase('payment');
      } else if (data.url) {
        // Stripe or fallback: redirect
        clearCart();
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || 'Erro ao processar pagamento. Tente novamente.');
      }
    } catch {
      setCheckoutError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleBackToForm() {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (brickControllerRef.current?.unmount) {
      brickControllerRef.current.unmount();
    }
    setPhase('form');
    setPreferenceId('');
    setOrderId('');
    setBrickReady(false);
    setCheckoutError('');
  }

  if (items.length === 0 && phase !== 'payment') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width={36} height={36} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-slate-600">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h1 className="font-extrabold text-2xl text-white mb-3">Carrinho Vazio</h1>
          <p className="text-slate-500 mb-8">Adicione produtos ao carrinho para continuar.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider">
            Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <header className="border-b border-white/5 bg-[#0f172a]/95 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">CC</div>
            <span className="font-bold text-[1.1rem] tracking-wider uppercase text-white">
              Cabos <span className="text-orange-400">&amp;</span> Cobres
            </span>
          </Link>
          <span className="text-slate-500 text-sm">
            {phase === 'payment' ? 'Pagamento' : 'Finalizar Compra'}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {phase === 'form' ? (
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
                    className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'entrega' ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-white/20'}`}>
                    <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className={deliveryMethod === 'entrega' ? 'text-orange-400' : 'text-slate-500'}>
                      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    </svg>
                    <p className="font-bold text-sm mt-2">Entrega</p>
                    <p className="text-slate-500 text-xs mt-1">Receba no seu endereço</p>
                  </button>
                  <button type="button" onClick={() => setDeliveryMethod('retirada')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'retirada' ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-white/20'}`}>
                    <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className={deliveryMethod === 'retirada' ? 'text-orange-400' : 'text-slate-500'}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <p className="font-bold text-sm mt-2">Retirada</p>
                    <p className="text-slate-500 text-xs mt-1">Retire na loja</p>
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
                    className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="email" placeholder="E-mail" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors" />
                    <input type="tel" placeholder="Telefone (com DDD)" required value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors" />
                  </div>

                  {deliveryMethod === 'entrega' && (
                    <>
                      <div className="flex gap-3">
                        <input type="text" placeholder="CEP (ex: 15000-000)" maxLength={9} value={form.cep}
                          onChange={(e) => handleCepChange(e.target.value)}
                          className="w-40 bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors" />
                        <div className="flex-1 flex items-center px-4 rounded-xl bg-[#1e293b] border border-white/5">
                          {shippingLoading ? (
                            <span className="text-slate-500 text-xs">Calculando...</span>
                          ) : shipping ? (
                            <span className={`text-xs font-bold ${shipping.price === 0 ? 'text-green-400' : 'text-orange-400'}`}>
                              {shipping.priceFormatted} — {shipping.message}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">Informe o CEP para calcular o frete</span>
                          )}
                        </div>
                      </div>
                      <input type="text" placeholder="Endereço completo (Rua, Número, Bairro, Cidade - UF)" required
                        value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors" />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Summary */}
            <div className="lg:col-span-2">
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 sticky top-24">
                <h2 className="font-bold text-lg mb-5">Resumo do Pedido</h2>
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#0f172a] flex-shrink-0">
                        {item.product.images[0]?.startsWith('data:') ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Image src={item.product.images[0] || '/placeholder.png'} alt={item.product.name} width={56} height={56} className="w-full h-full object-cover" unoptimized />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 line-clamp-2">{item.product.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded bg-slate-700 text-slate-400 flex items-center justify-center text-xs hover:bg-slate-600">-</button>
                            <span className="text-xs w-5 text-center">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded bg-slate-700 text-slate-400 flex items-center justify-center text-xs hover:bg-slate-600">+</button>
                          </div>
                          <span className="text-orange-400 text-xs font-bold">
                            R$ {((item.product.price * item.quantity) / 100).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeItem(item.product.id)} className="text-slate-600 hover:text-red-400 self-start">
                        <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span>R$ {(total / 100).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Frete</span>
                    <span className={shippingCost === 0 ? 'text-green-400' : ''}>
                      {deliveryMethod === 'retirada' ? 'Grátis (retirada)' : shipping ? shipping.priceFormatted : 'Informe CEP'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-orange-400">R$ {(grandTotal / 100).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full mt-6 bg-orange-500 text-white py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-orange-600 hover:shadow-[0_0_40px_rgba(245,166,35,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
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
                {checkoutError && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                    <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="inline mr-1">
                      <circle cx={12} cy={12} r={10} /><path d="M12 8v4M12 16h.01" />
                    </svg>
                    {checkoutError}
                  </div>
                )}
                <p className="text-center text-slate-500 text-[0.65rem] mt-3">
                  {paymentGateway === 'mercadopago'
                    ? 'Pagamento seguro via Mercado Pago. Aceita PIX, cartão e boleto.'
                    : 'Pagamento seguro via Stripe. Aceita cartão, boleto e PIX.'}
                </p>
              </div>
            </div>
          </form>
        ) : (
          /* ── PAYMENT PHASE ── */
          <div className="max-w-2xl mx-auto">
            {/* Back button */}
            <button onClick={handleBackToForm} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
              <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar e alterar dados
            </button>

            {/* Order summary card */}
            <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Resumo do Pedido</h2>
                <span className="text-slate-500 text-xs font-mono">{orderId}</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{form.name}</span>
                  <span className="text-slate-400">{form.email}</span>
                </div>
                {deliveryMethod === 'entrega' && form.address && (
                  <p className="text-slate-500 text-xs">{form.address}</p>
                )}
              </div>
              <div className="border-t border-white/5 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-400">R$ {(grandTotal / 100).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Wallet Brick container */}
            <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#009ee3]/10 border border-[#009ee3]/20 rounded-lg flex items-center justify-center">
                  <span className="text-[#009ee3] font-bold text-xs">MP</span>
                </div>
                Escolha a forma de pagamento
              </h2>
              <p className="text-slate-500 text-xs mb-6">Clique abaixo para pagar com PIX, cartão de crédito, débito ou boleto.</p>

              {!brickReady && !checkoutError && (
                <div className="flex items-center justify-center py-8 gap-3">
                  <span className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                  <span className="text-slate-400 text-sm">Carregando opções de pagamento...</span>
                </div>
              )}

              <div id="wallet_container" ref={walletContainerRef} />

              {checkoutError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                  <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="inline mr-1">
                    <circle cx={12} cy={12} r={10} /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  {checkoutError}
                </div>
              )}

              {brickReady && paymentStatus !== 'pago' && (
                <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs">
                  <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x={3} y={11} width={18} height={11} rx={2} ry={2} /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Pagamento seguro via Mercado Pago
                </div>
              )}

              {paymentStatus === 'pago' && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                  <svg width={32} height={32} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="text-green-400 mx-auto mb-2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-green-400 font-bold">Pagamento confirmado!</p>
                  <p className="text-slate-400 text-xs mt-1">Redirecionando...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
