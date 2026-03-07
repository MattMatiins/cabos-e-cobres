'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminAuthContext, type AdminAuthContextType } from '@/lib/admin-auth';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Pedidos', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { label: 'Produtos', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Configurações', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) {
      // Validate saved token against server
      fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: saved }),
      })
        .then((res) => {
          if (res.ok) {
            setToken(saved);
          } else {
            localStorage.removeItem('admin_token');
            setError('Sessão expirada. Faça login novamente.');
          }
        })
        .catch(() => {
          setToken(saved); // Offline? Try with saved token
        });
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: input }),
      });
      if (res.ok) {
        localStorage.setItem('admin_token', input);
        setToken(input);
      } else {
        setError('Senha incorreta. Tente novamente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    setToken('');
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center font-display text-black text-xl mx-auto mb-4 shadow-[0_0_40px_rgba(245,166,35,0.3)]">
              CC
            </div>
            <h1 className="font-display text-2xl text-white mb-1">Admin</h1>
            <p className="text-gray-500 text-sm">Cabos &amp; Cobres</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Senha de acesso"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-orange-500 text-black py-3 rounded-xl font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_30px_rgba(245,166,35,0.3)] transition-all"
            >
              Entrar
            </button>
          </form>

          <Link href="/" className="block text-center text-gray-600 text-xs mt-6 hover:text-gray-400 transition-colors">
            Voltar à loja
          </Link>
        </div>
      </div>
    );
  }

  const authValue: AdminAuthContextType = {
    token,
    headers: () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }),
  };

  return (
    <AdminAuthContext.Provider value={authValue}>
      <div className="min-h-screen bg-[#0a0a0a] flex">
        {/* Sidebar */}
        <aside className={`admin-sidebar border-r border-[#222] flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          <div className="p-4 border-b border-[#222] flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center font-display text-black text-xs flex-shrink-0">
              CC
            </div>
            {sidebarOpen && (
              <span className="font-display text-sm tracking-wider uppercase text-white truncate">Admin</span>
            )}
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                  title={item.label}
                >
                  <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[#222] space-y-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-[#1a1a1a] w-full transition-all"
            >
              <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="flex-shrink-0">
                <path d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
              </svg>
              {sidebarOpen && <span>Recolher</span>}
            </button>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-[#1a1a1a] w-full transition-all"
            >
              <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="flex-shrink-0">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {sidebarOpen && <span>Voltar à Loja</span>}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 w-full transition-all"
            >
              <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="flex-shrink-0">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && <span>Sair</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthContext.Provider>
  );
}
