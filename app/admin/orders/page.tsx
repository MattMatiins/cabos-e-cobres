'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/lib/types';

const STATUSES: OrderStatus[] = ['novo', 'pago', 'pronto', 'em_rota', 'entregue'];

export default function AdminOrders() {
  const { headers } = useAdminAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [updating, setUpdating] = useState(false);

  async function fetchOrders() {
    try {
      const res = await fetch('/api/admin/orders', { headers: headers() });
      if (res.ok) setOrders(await res.json());
    } catch {}
  }

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdating(true);
    try {
      const body: any = { orderId, status: newStatus };
      if (trackingCode) body.trackingCode = trackingCode;

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selected?.id === orderId) setSelected(updated);
        setTrackingCode('');
      }
    } catch {}
    setUpdating(false);
  }

  async function handleTrackingUpdate(orderId: string) {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ orderId, trackingCode }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selected?.id === orderId) setSelected(updated);
      }
    } catch {}
    setUpdating(false);
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-white mb-1">Pedidos</h1>
          <p className="text-gray-500 text-sm">{orders.length} pedidos no total</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
            filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
          }`}
        >
          Todos ({orders.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
              filter === s ? 'text-white' : 'text-gray-500 hover:text-white'
            }`}
            style={filter === s ? { background: `${ORDER_STATUS_COLORS[s]}20`, color: ORDER_STATUS_COLORS[s] } : {}}
          >
            {ORDER_STATUS_LABELS[s]} ({orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Order List */}
        <div className={`space-y-3 ${selected ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
          {filtered.length === 0 ? (
            <div className="bg-[#111] border border-[#222] rounded-2xl p-12 text-center">
              <p className="text-gray-500">Nenhum pedido encontrado</p>
            </div>
          ) : (
            filtered.map((order) => (
              <div
                key={order.id}
                onClick={() => { setSelected(order); setTrackingCode(order.trackingCode || ''); }}
                className={`bg-[#111] border rounded-xl p-4 cursor-pointer transition-all hover:border-[#333] ${
                  selected?.id === order.id ? 'border-orange-500/40' : 'border-[#222]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: ORDER_STATUS_COLORS[order.status as OrderStatus] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{order.customerName}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider"
                        style={{
                          background: `${ORDER_STATUS_COLORS[order.status as OrderStatus]}20`,
                          color: ORDER_STATUS_COLORS[order.status as OrderStatus],
                        }}
                      >
                        {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                      </span>
                      {order.deliveryMethod === 'retirada' && (
                        <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400">
                          Retirada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      #{order.id.slice(-6).toUpperCase()} - {order.items?.length || 0} itens - {order.customerPhone}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-orange-400 font-bold text-sm">
                      R$ {(order.total / 100).toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {new Date(order.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Detail */}
        {selected && (
          <div className="lg:col-span-2">
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">
                  #{selected.id.slice(-6).toUpperCase()}
                </h2>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">
                  <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status */}
              <div className="mb-5">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Status</p>
                <div className="flex gap-1.5 flex-wrap">
                  {STATUSES.map((s) => {
                    const currentIdx = STATUSES.indexOf(selected.status);
                    const idx = STATUSES.indexOf(s);
                    const isActive = s === selected.status;
                    const isPast = idx < currentIdx;

                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selected.id, s)}
                        disabled={updating}
                        className={`px-3 py-1.5 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
                          isActive
                            ? 'text-white shadow-lg'
                            : isPast
                            ? 'opacity-40'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{
                          background: isActive ? ORDER_STATUS_COLORS[s] : `${ORDER_STATUS_COLORS[s]}20`,
                          color: isActive ? '#000' : ORDER_STATUS_COLORS[s],
                        }}
                      >
                        {ORDER_STATUS_LABELS[s]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tracking Code */}
              <div className="mb-5">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Código de Rastreio</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ex: BR123456789BR"
                    className="flex-1 bg-[#161616] border border-[#222] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                  />
                  <button
                    onClick={() => handleTrackingUpdate(selected.id)}
                    disabled={updating || !trackingCode}
                    className="px-4 py-2 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-bold uppercase hover:bg-orange-500/20 disabled:opacity-50 transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-5">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Cliente</p>
                <div className="space-y-1.5 text-sm">
                  <p className="text-gray-200">{selected.customerName}</p>
                  <p className="text-gray-400">{selected.customerEmail}</p>
                  <p className="text-gray-400">{selected.customerPhone}</p>
                  {selected.shippingAddress && (
                    <p className="text-gray-400">{selected.shippingAddress}</p>
                  )}
                  <p className="text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{
                        background: selected.deliveryMethod === 'retirada' ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)',
                        color: selected.deliveryMethod === 'retirada' ? '#8B5CF6' : '#3B82F6',
                      }}
                    >
                      {selected.deliveryMethod === 'retirada' ? 'Retirada na loja' : 'Entrega'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-5">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Itens</p>
                <div className="space-y-2">
                  {selected.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-300 truncate flex-1">{item.quantity}x {item.name}</span>
                      <span className="text-gray-400 ml-2">
                        R$ {((item.price * item.quantity) / 100).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#222] mt-3 pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-orange-400">
                    R$ {(selected.total / 100).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Status History */}
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Histórico</p>
                <div className="space-y-2">
                  {selected.statusHistory?.map((h: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: ORDER_STATUS_COLORS[h.status as OrderStatus] }}
                      />
                      <span className="text-gray-400">
                        {ORDER_STATUS_LABELS[h.status as OrderStatus]}
                        {h.note && ` - ${h.note}`}
                      </span>
                      <span className="text-gray-600 ml-auto">
                        {new Date(h.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
