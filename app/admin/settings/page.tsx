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
        setSettings(getDefaults());
      } else {
        setError('Erro ao carregar configurações.');
        setSettings(getDefaults());
      }
    } catch {
      setError('Erro de conexão. Usando valores padrão.');
      setSettings(getDefaults());
    }
  }

  function getDefaults() {
    return {
      paymentGateway: 'mercadopago',
      stripeSecretKey: '',
      stripePublishableKey: '',
      mercadoPagoAccessToken: '',
      mercadoPagoPublicKey: '',
      smsApiKey: '',
      smsFromNumber: '',
      messages: { ...DEFAULT_MESSAGES },
      shippingRates: [...SHIPPING_STATES],
    };
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
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-extrabold text-2xl text-white mb-1">Configurações</h1>
        <p className="text-gray-500 text-sm">Pagamento, WhatsApp, frete e mensagens personalizadas</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        {/* ── Payment Gateway Selector ── */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-1 flex items-center gap-3">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x={1} y={4} width={22} height={16} rx={2} ry={2} /><line x1={1} y1={10} x2={23} y2={10} />
            </svg>
            Gateway de Pagamento
          </h2>
          <p className="text-gray-500 text-xs mb-5">Escolha o provedor de pagamento ativo para sua loja</p>

          {/* Toggle buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, paymentGateway: 'mercadopago' })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                settings.paymentGateway === 'mercadopago'
                  ? 'border-orange-500 bg-orange-500/5'
                  : 'border-[#222] hover:border-[#333]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                  settings.paymentGateway === 'mercadopago' ? 'bg-[#009ee3] text-white' : 'bg-[#222] text-gray-500'
                }`}>
                  MP
                </div>
                <div>
                  <p className={`font-bold text-sm ${settings.paymentGateway === 'mercadopago' ? 'text-white' : 'text-gray-400'}`}>
                    Mercado Pago
                  </p>
                  <p className="text-gray-600 text-[10px]">PIX, Cartão, Boleto</p>
                </div>
              </div>
              {settings.paymentGateway === 'mercadopago' && (
                <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold">
                  <svg width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  Ativo
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, paymentGateway: 'stripe' })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                settings.paymentGateway === 'stripe'
                  ? 'border-orange-500 bg-orange-500/5'
                  : 'border-[#222] hover:border-[#333]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                  settings.paymentGateway === 'stripe' ? 'bg-[#635bff] text-white' : 'bg-[#222] text-gray-500'
                }`}>
                  S
                </div>
                <div>
                  <p className={`font-bold text-sm ${settings.paymentGateway === 'stripe' ? 'text-white' : 'text-gray-400'}`}>
                    Stripe
                  </p>
                  <p className="text-gray-600 text-[10px]">Cartão, Boleto</p>
                </div>
              </div>
              {settings.paymentGateway === 'stripe' && (
                <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold">
                  <svg width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  Ativo
                </div>
              )}
            </button>
          </div>

          {/* Mercado Pago Fields */}
          {settings.paymentGateway === 'mercadopago' && (
            <div className="space-y-3 border-t border-[#222] pt-5">
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Access Token (Mercado Pago)</label>
                <input
                  type="text"
                  value={settings.mercadoPagoAccessToken || ''}
                  onChange={(e) => setSettings({ ...settings, mercadoPagoAccessToken: e.target.value })}
                  placeholder="APP_USR-... ou TEST-..."
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 font-mono"
                />
                <p className="text-gray-600 text-[10px] mt-1.5">
                  Obtenha em: Mercado Pago → Seu negócio → Configurações → Credenciais
                </p>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Public Key (Mercado Pago)</label>
                <input
                  type="text"
                  value={settings.mercadoPagoPublicKey || ''}
                  onChange={(e) => setSettings({ ...settings, mercadoPagoPublicKey: e.target.value })}
                  placeholder="APP_USR-... ou TEST-..."
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 font-mono"
                />
                <p className="text-gray-600 text-[10px] mt-1.5">
                  Chave pública para pagamento inline. Mesma página de credenciais do Mercado Pago.
                </p>
              </div>
            </div>
          )}

          {/* Stripe Fields */}
          {settings.paymentGateway === 'stripe' && (
            <div className="space-y-3 border-t border-[#222] pt-5">
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Chave Secreta (Secret Key)</label>
                <input
                  type="text"
                  value={settings.stripeSecretKey || ''}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                  placeholder="sk_live_..."
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Chave Pública (Publishable Key)</label>
                <input
                  type="text"
                  value={settings.stripePublishableKey || ''}
                  onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                  placeholder="pk_live_..."
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Shipping ── */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-1 flex items-center gap-3">
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

        {/* ── WhatsApp Notifications ── */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-1 flex items-center gap-3">
            <svg width={20} height={20} fill="currentColor" viewBox="0 0 24 24" className="text-green-500">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp / Notificações
          </h2>
          <p className="text-gray-500 text-xs mb-5">
            Configure notificações automáticas via WhatsApp (CallMeBot) ou manual
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">API Key do CallMeBot (opcional)</label>
              <input
                type="text"
                value={settings.smsApiKey || ''}
                onChange={(e) => setSettings({ ...settings, smsApiKey: e.target.value })}
                placeholder="callmebot:SUA_API_KEY"
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 font-mono"
              />
              <p className="text-gray-600 text-[10px] mt-1.5">
                Gratuito! Cadastre em: https://www.callmebot.com/blog/free-api-whatsapp-messages/
              </p>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">Número WhatsApp (com código do país)</label>
              <input
                type="text"
                value={settings.smsFromNumber || ''}
                onChange={(e) => setSettings({ ...settings, smsFromNumber: e.target.value })}
                placeholder="5517999999999"
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
              />
              <p className="text-gray-600 text-[10px] mt-1.5">
                Sem API? Um link WhatsApp será gerado para envio manual na tela de pedidos.
              </p>
            </div>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-1 flex items-center gap-3">
            <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Mensagens Personalizadas
          </h2>
          <p className="text-gray-500 text-xs mb-5">
            Personalize as mensagens WhatsApp. Use: {'{nome}'}, {'{id}'}, {'{rastreio}'}, {'{total}'}
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
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, messages: { ...DEFAULT_MESSAGES } })}
            className="mt-3 text-gray-500 text-xs hover:text-orange-400 transition-colors"
          >
            Restaurar mensagens padrão
          </button>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 text-black px-8 py-3 rounded-xl font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_30px_rgba(245,166,35,0.3)] disabled:opacity-50 transition-all flex items-center gap-2"
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
