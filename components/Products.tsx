'use client';

import { PRODUCTS } from '@/lib/products';
import ProductCard from './ProductCard';

export default function Products() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20" id="produtos">
      <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
        <h2 className="font-display text-2xl md:text-3xl flex items-center gap-4">
          <span className="w-1 h-7 bg-brand rounded-sm inline-block" />
          Produtos
        </h2>
        <p className="text-gray-500 text-sm">
          {PRODUCTS.length} produtos disponíveis
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {PRODUCTS.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
