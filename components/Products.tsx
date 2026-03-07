'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Product } from '@/lib/products';
import ProductCard from './ProductCard';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['Todos', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategory !== 'Todos') {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, activeCategory, searchQuery]);

  return (
    <section className="bg-[#0f172a] py-20" id="produtos">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="section-divider mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Nosso Catálogo
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Peças originais Bambozzi para geradores, soldas e equipamentos industriais
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={11} cy={11} r={8} /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/30 transition-colors"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white shadow-[0_2px_12px_rgba(249,115,22,0.3)]'
                    : 'bg-[#1e293b] text-slate-400 border border-white/5 hover:border-orange-500/20 hover:text-orange-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500 text-sm">
            {loading ? 'Carregando...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden">
                <div className="aspect-square bg-slate-800/50" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-800/50 rounded w-1/3" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                  <div className="h-4 bg-slate-800/50 rounded w-2/3" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                  <div className="h-6 bg-slate-800/50 rounded w-1/2" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-slate-500">
                <circle cx={11} cy={11} r={8} /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium mb-1">Nenhum produto encontrado</p>
            <p className="text-slate-500 text-sm">Tente buscar por outro termo ou categoria</p>
          </div>
        )}
      </div>
    </section>
  );
}
