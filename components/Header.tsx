'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center font-display text-black text-sm shadow-[0_0_20px_rgba(245,166,35,0.3)]">
            CC
          </div>
          <span className="font-display text-[1.1rem] tracking-wider uppercase text-white">
            Cabos <span className="text-brand">&amp;</span> Cobres
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Início', href: '/' },
            { label: 'Catálogo', href: '#produtos' },
            { label: 'Contato', href: '#contato' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-gray-400 text-sm font-medium tracking-wider uppercase hover:text-white transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-[42px] h-[42px] rounded-full border border-[#222] flex items-center justify-center text-white hover:border-brand hover:text-brand transition-all hover:shadow-[0_0_15px_rgba(245,166,35,0.2)]"
          >
            <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-black text-[0.6rem] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center badge-bounce">
                {totalItems}
              </span>
            )}
          </button>

          <button
            className="md:hidden flex flex-col gap-[5px] p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`block w-6 h-[2px] bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-6 h-[2px] bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-[2px] bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#222] bg-[#0a0a0a] px-6 py-4 flex flex-col gap-3">
          {[
            { label: 'Início', href: '/' },
            { label: 'Catálogo', href: '#produtos' },
            { label: 'Contato', href: '#contato' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 text-sm font-medium tracking-wider uppercase py-2 hover:text-brand transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
