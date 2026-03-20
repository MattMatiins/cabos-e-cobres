'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><span className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [trackingId, setTrackingId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/order-status?orderId=${encodeURIComponent(orderId)}`)
      .then((r) => r.json())
      .then((d) => { if (d.trackingId) setTrackingId(d.trackingId); })
      .catch(() => {});
  }, [orderId]);

  function handleCopy() {
    navigator.clipboard.writeText(trackingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-extrabold text-3xl text-white mb-3">Pedido Confirmado!</h1>
        <p className="text-slate-400 mb-6">
          Obrigado pela sua compra! Acompanhe o status do seu pedido com o código abaixo.
        </p>

        {trackingId && (
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Código do Pedido</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-bold text-2xl text-orange-400 font-mono tracking-[0.15em]">{trackingId}</span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Copiar código"
              >
                {copied ? (
                  <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x={9} y={9} width={13} height={13} rx={2} /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                )}
              </button>
            </div>
            <p className="text-slate-600 text-xs mt-3">Guarde este código para acompanhar seu pedido</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {trackingId && (
            <Link
              href={`/rastreio?code=${trackingId}`}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-orange-600 transition-all"
            >
              <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} /><path d="M21 21l-4.35-4.35" />
              </svg>
              Acompanhar Pedido
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-slate-600 transition-all"
          >
            Voltar à Loja
          </Link>
        </div>
      </div>
    </div>
  );
}
