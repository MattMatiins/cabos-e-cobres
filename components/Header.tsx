'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[70px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <Image
            src="/logo.png"
            alt="Cabos e Cobres"
            width={38}
            height={38}
            className="w-[38px] h-[38px] rounded-lg object-cover"
          />
          <div className="hidden sm:block">
            <span className="font-bold text-[0.95rem] tracking-wide text-white">
              Cabos & Cobres
            </span>
            <span className="block text-[0.6rem] text-slate-400 tracking-[0.15em] uppercase font-medium -mt-0.5">
              Peças Bambozzi
            </span>
          </div>
          <span className="sm:hidden font-bold text-sm tracking-wide text-white">
            C&C
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Início', href: '/' },
            { label: 'Catálogo', href: '#produtos' },
            { label: 'Sobre', href: '#sobre' },
            { label: 'Contato', href: '#contato' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-slate-300 text-sm font-medium hover:text-orange-400 transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-[42px] h-[42px] rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 hover:border-orange-500/30 hover:text-orange-400 transition-all"
          >
            <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[0.6rem] font-bold w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(249,115,22,0.4)] badge-bounce">
                {totalItems}
              </span>
            )}
          </button>

          <button
            className="md:hidden flex flex-col gap-[5px] p-2 rounded-xl bg-slate-800/50 border border-white/5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`block w-5 h-[2px] bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-[2px] bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[2px] bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0f172a]/98 backdrop-blur-xl px-6 py-5 flex flex-col gap-1" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {[
            { label: 'Início', href: '/' },
            { label: 'Catálogo', href: '#produtos' },
            { label: 'Sobre', href: '#sobre' },
            { label: 'Contato', href: '#contato' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-slate-300 text-sm font-medium py-4 px-4 rounded-xl hover:bg-slate-800/50 hover:text-orange-400 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
