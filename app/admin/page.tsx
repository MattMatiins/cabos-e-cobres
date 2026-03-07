'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';

interface Stats {
  realtime: number;
  lastHour: number;
  today: number;
}

export default function AdminDashboard() {
  const { headers } = useAdminAuth();
  const [visitors, setVisitors] = useState<Stats>({ realtime: 0, lastHour: 0, today: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visRes, ordRes, prodRes] = await Promise.all([
          fetch('/api/visitors'),
          fetch('/api/admin/orders', { headers: headers() }),
          fetch('/api/admin/products', { headers: headers() }),
        ]);
        if (visRes.ok) setVisitors(await visRes.json());
        if (ordRes.ok) setOrders(await ordRes.json());
        if (prodRes.ok) setProducts(await prodRes.json());
      } catch {}
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const revenue = orders
    .filter((o) => o.status !== 'novo')
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const statusCounts = {
    novo: orders.filter((o) => o.status === 'novo').length,
    pago: orders.filter((o) => o.status === 'pago').length,
    pronto: orders.filter((o) => o.status === 'pronto').length,
    em_rota: orders.filter((o) => o.status === 'em_rota').length,
    entregue: orders.filter((o) => o.status === 'entregue').length,
  };

  const cards = [
    {
      label: 'Visitantes Online',
      value: visitors.realtime,
      sub: `${visitors.lastHour} última hora`,
      color: '#22C55E',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    },
    {
      label: 'Pedidos Hoje',
      value: orders.length,
      sub: `${statusCounts.novo} novos`,
      color: '#3B82F6',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      label: 'Receita',
      value: `R$ ${(revenue / 100).toFixed(2).replace('.', ',')}`,
      sub: 'pedidos pagos',
      color: '#F5A623',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Produtos',
      value: products.length,
      sub: 'no catálogo',
      color: '#8B5CF6',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-extrabold text-2xl text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#111] border border-[#222] rounded-2xl p-5 hover:border-[#333] transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}
              >
                <svg width={20} height={20} fill="none" stroke={card.color} strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              {card.label === 'Visitantes Online' && (
                <span className="flex items-center gap-1.5 text-green-400 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
                  Ao vivo
                </span>
              )}
            </div>
            <p className="font-bold text-2xl text-white mb-1">{card.value}</p>
            <p className="text-gray-500 text-xs">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Order Status Pipeline */}
      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-lg mb-5">Pipeline de Pedidos</h2>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Novo', count: statusCounts.novo, color: '#3B82F6' },
            { label: 'Pago', count: statusCounts.pago, color: '#F59E0B' },
            { label: 'Pronto', count: statusCounts.pronto, color: '#8B5CF6' },
            { label: 'Em Rota', count: statusCounts.em_rota, color: '#F97316' },
            { label: 'Entregue', count: statusCounts.entregue, color: '#22C55E' },
          ].map((s, i) => (
            <div key={s.label} className="text-center">
              <div
                className="h-2 rounded-full mb-3"
                style={{ background: `${s.color}30` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    background: s.color,
                    width: orders.length > 0 ? `${Math.max(10, (s.count / Math.max(orders.length, 1)) * 100)}%` : '10%',
                  }}
                />
              </div>
              <p className="font-bold text-lg" style={{ color: s.color }}>{s.count}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-5">Pedidos Recentes</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Nenhum pedido ainda</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center gap-4 p-3 bg-[#161616] rounded-xl">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background:
                      order.status === 'novo' ? '#3B82F6'
                        : order.status === 'pago' ? '#F59E0B'
                        : order.status === 'pronto' ? '#8B5CF6'
                        : order.status === 'em_rota' ? '#F97316'
                        : '#22C55E',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.id.slice(-6).toUpperCase()} - {order.items?.length || 0} itens</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 text-sm font-bold">
                    R$ {(order.total / 100).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
