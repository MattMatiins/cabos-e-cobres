'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { DEFAULT_MESSAGES, SHIPPING_STATES } from '@/lib/types';

export default function AdminSettings() {
  const { headers } = useAdminAuth();
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings', { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setError('');
      } else if (res.status === 401) {
        setError('Senha de admin incorreta. Faça login novamente.');
        setSettings({
          stripeSecretKey: '',
          stripePublishableKey: '',
          smsApiKey: '',
          smsFromNumber: '',
          messages: { ...DEFAULT_MESSAGES },
          shippingRates: [...SHIPPING_STATES],
        });
      } else {
        setError('Erro ao carregar configurações.');
        setSettings({
          stripeSecretKey: '',
          stripePublishableKey: '',
          smsApiKey: '',
          smsFromNumber: '',
          messages: { ...DEFAULT_MESSAGES },
          shippingRates: [...SHIPPING_STATES],
        });
      }
    } catch {
      setError('Erro de conexão. Usando valores padrão.');
      setSettings({
        stripeSecretKey: '',
        stripePublishableKey: '',
        smsApiKey: '',
        smsFromNumber: '',
        messages: { ...DEFAULT_MESSAGES },
        shippingRates: [...SHIPPING_STATES],
      });
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Erro ao salvar. Verifique a senha de admin.');
      }
    } catch {
      setError('Erro de conexão ao salvar.');
    }
    setSaving(false);
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl text-white mb-1">Configurações</h1>
        <p className="text-gray-500 text-sm">Stripe, SMS, frete e mensagens personalizadas</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        {/* Stripe */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h2 className="font-display text-lg mb-1 flex items-center gap-3">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x={1} y={4} width={22} height={16} rx={2} ry={2} /><line x1={1} y1={10} x2={23} y2={10} />
            </svg>
            Stripe
          </h2>
          <p className="text-gray-500 text-xs mb-5">Configure suas chaves do Stripe para processar pagamentos</p>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Chave Secreta (Secret Key)</label>
              <input
                type="text"
                value={settings.stripeSecretKey || ''}
                onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                placeholder="sk_live_..."
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Chave Pública (Publishable Key)</label>
              <input
                type="text"
                value={settings.stripePublishableKey || ''}
                onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                placeholder="pk_live_..."
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h2 className="font-display text-lg mb-1 flex items-center gap-3">
            <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
            </svg>
            Frete por Estado
          </h2>
          <p className="text-gray-500 text-xs mb-5">Configure o valor do frete por estado. Informe 0 para frete grátis.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
            {(settings.shippingRates || SHIPPING_STATES).map((rate: any, i: number) => (
              <div key={rate.state} className="flex items-center gap-2 bg-[#161616] border border-[#222] rounded-lg px-3 py-2">
                <span className="text-xs text-gray-400 font-bold w-6">{rate.state}</span>
                <span className="text-gray-600 text-xs">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={(rate.price / 100).toFixed(2)}
                  onChange={(e) => {
                    const newRates = [...(settings.shippingRates || SHIPPING_STATES)];
                    newRates[i] = { ...newRates[i], price: Math.round(parseFloat(e.target.value || '0') * 100) };
                    setSettings({ ...settings, shippingRates: newRates });
                  }}
                  className="flex-1 bg-transparent text-sm text-white w-16 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SMS */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h2 className="font-display text-lg mb-1 flex items-center gap-3">
            <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            SMS (Twilio)
          </h2>
          <p className="text-gray-500 text-xs mb-5">Configure o envio de SMS para notificações de pedidos</p>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">API Key (AccountSID:AuthToken)</label>
              <input
                type="text"
                value={settings.smsApiKey || ''}
                onChange={(e) => setSettings({ ...settings, smsApiKey: e.target.value })}
                placeholder="ACxxxxxxx:xxxxxxxx"
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Número de Envio</label>
              <input
                type="text"
                value={settings.smsFromNumber || ''}
                onChange={(e) => setSettings({ ...settings, smsFromNumber: e.target.value })}
                placeholder="+5517999999999"
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h2 className="font-display text-lg mb-1 flex items-center gap-3">
            <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Mensagens Personalizadas
          </h2>
          <p className="text-gray-500 text-xs mb-5">
            Personalize as mensagens SMS. Use: {'{nome}'}, {'{id}'}, {'{rastreio}'}, {'{total}'}
          </p>
          <div className="space-y-4">
            {[
              { key: 'novo', label: 'Pedido Novo', color: '#3B82F6' },
              { key: 'pago', label: 'Pagamento Confirmado', color: '#F59E0B' },
              { key: 'pronto', label: 'Pedido Pronto', color: '#8B5CF6' },
              { key: 'em_rota', label: 'Em Rota de Entrega', color: '#F97316' },
              { key: 'entregue', label: 'Pedido Entregue', color: '#22C55E' },
              { key: 'retirada_pronto', label: 'Pronto para Retirada', color: '#EC4899' },
            ].map((msg) => (
              <div key={msg.key}>
                <label className="flex items-center gap-2 text-xs mb-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: msg.color }} />
                  <span className="text-gray-400">{msg.label}</span>
                </label>
                <textarea
                  rows={2}
                  value={settings.messages?.[msg.key] || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messages: { ...settings.messages, [msg.key]: e.target.value },
                    })
                  }
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50 resize-none"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, messages: { ...DEFAULT_MESSAGES } })}
            className="mt-3 text-gray-500 text-xs hover:text-brand transition-colors"
          >
            Restaurar mensagens padrão
          </button>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-black px-8 py-3 rounded-xl font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_30px_rgba(245,166,35,0.3)] disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                Salvando...
              </>
            ) : saved ? (
              <>
                <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                Salvo!
              </>
            ) : (
              'Salvar Configurações'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
