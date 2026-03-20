'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types';
import type { OrderStatus } from '@/lib/types';

const STATUS_FLOW: OrderStatus[] = ['novo', 'pago', 'pronto', 'em_rota', 'entregue'];

interface TrackingData {
  trackingId: string;
  status: OrderStatus;
  deliveryMethod: string;
  trackingCode: string | null;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  customerName: string;
  createdAt: string;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
}

export default function RastreioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><span className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>}>
      <RastreioContent />
    </Suspense>
  );
}

function RastreioContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const initialCode = searchParams.get('code');
    if (initialCode) {
      setCode(initialCode);
      lookupOrder(initialCode);
    }
  }, []);

  async function lookupOrder(trackingId: string) {
    const clean = trackingId.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    setError('');
    setData(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/order-status?trackingId=${encodeURIComponent(clean)}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        setError('Pedido não encontrado. Verifique o código e tente novamente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    lookupOrder(code);
  }

  function getStatusIndex(status: OrderStatus): number {
    return STATUS_FLOW.indexOf(status);
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <header className="border-b border-white/5 bg-[#0f172a]/95 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-[72px]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">CC</div>
            <span className="font-bold text-[1.1rem] tracking-wider uppercase text-white">
              Cabos <span className="text-orange-400">&amp;</span> Cobres
            </span>
          </Link>
          <span className="text-slate-500 text-sm">Rastrear Pedido</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="text-center mb-10">
          <h1 className="font-extrabold text-2xl md:text-3xl text-white mb-3">Rastrear Pedido</h1>
          <p className="text-slate-400 text-sm">Digite o código do pedido para acompanhar o status</p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-10 max-w-lg mx-auto">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CC-XXXXXX"
            className="flex-1 bg-[#1e293b] border border-white/10 rounded-xl px-5 py-3.5 text-white text-center text-lg font-mono tracking-[0.2em] placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors uppercase"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="bg-orange-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2 min-h-[48px]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} /><path d="M21 21l-4.35-4.35" />
              </svg>
            )}
            Buscar
          </button>
        </form>

        {error && (
          <div className="max-w-lg mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {!data && searched && !loading && !error && null}

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Order header */}
            <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Código do Pedido</p>
                  <p className="font-bold text-xl text-orange-400 font-mono tracking-wider">{data.trackingId}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Data do Pedido</p>
                  <p className="text-slate-300 text-sm">{formatDate(data.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: ORDER_STATUS_COLORS[data.status] }} />
                <span className="font-semibold text-sm" style={{ color: ORDER_STATUS_COLORS[data.status] }}>
                  {ORDER_STATUS_LABELS[data.status]}
                </span>
                <span className="text-slate-600 text-xs">
                  — {data.deliveryMethod === 'entrega' ? 'Entrega' : 'Retirada na loja'}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-6">Acompanhamento</h2>
              <div className="relative">
                {STATUS_FLOW.map((step, i) => {
                  const currentIndex = getStatusIndex(data.status);
                  const isCompleted = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  const historyEntry = data.statusHistory.find((h) => h.status === step);

                  return (
                    <div key={step} className="flex gap-4 pb-8 last:pb-0">
                      {/* Line + dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                            isCurrent
                              ? 'border-orange-500 bg-orange-500/20'
                              : isCompleted
                              ? 'border-green-500 bg-green-500/20'
                              : 'border-slate-700 bg-slate-800'
                          }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <svg width={14} height={14} fill="none" stroke="#22c55e" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-orange-500' : 'bg-slate-600'}`} />
                          )}
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-[32px] ${isCompleted && i < currentIndex ? 'bg-green-500/30' : 'bg-slate-700/50'}`} />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pt-1">
                        <p className={`font-semibold text-sm ${isCompleted ? 'text-white' : 'text-slate-600'}`}>
                          {ORDER_STATUS_LABELS[step]}
                        </p>
                        {historyEntry && (
                          <p className="text-slate-500 text-xs mt-0.5">{formatDate(historyEntry.timestamp)}</p>
                        )}
                        {historyEntry?.note && (
                          <p className="text-slate-400 text-xs mt-0.5">{historyEntry.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Code (Correios) */}
            {data.trackingCode && (
              <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="text-orange-400">
                    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  </svg>
                  Código de Rastreio
                </h2>
                <div className="flex items-center gap-3">
                  <span className="bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 font-mono text-orange-400 tracking-wider text-sm">
                    {data.trackingCode}
                  </span>
                  <a
                    href={`https://www.linkcorreios.com.br/?id=${data.trackingCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 text-xs font-semibold underline underline-offset-2"
                  >
                    Rastrear nos Correios →
                  </a>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-4">Itens do Pedido</h2>
              <div className="space-y-3">
                {data.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-300 text-sm">{item.name}</p>
                      <p className="text-slate-600 text-xs">Qtd: {item.quantity}</p>
                    </div>
                    <span className="text-orange-400 text-sm font-bold">
                      R$ {((item.price * item.quantity) / 100).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-orange-400">R$ {(data.total / 100).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-10">
          <Link href="/" className="text-slate-500 hover:text-orange-400 text-sm transition-colors">
            ← Voltar à loja
          </Link>
        </div>
      </div>
    </div>
  );
}
