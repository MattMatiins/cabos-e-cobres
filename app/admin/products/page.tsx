'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/lib/admin-auth';

interface ProductForm {
  name: string;
  code: string;
  price: string;
  description: string;
  category: string;
  images: string;
  inStock: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  code: '',
  price: '',
  description: '',
  category: '',
  images: '',
  inStock: true,
};

export default function AdminProducts() {
  const { headers } = useAdminAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/admin/products', { headers: headers() });
      if (res.ok) setProducts(await res.json());
    } catch {}
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(product: any) {
    setForm({
      name: product.name,
      code: product.code,
      price: String(product.price / 100),
      description: product.description || '',
      category: product.category || '',
      images: (product.images || []).join('\n'),
      inStock: product.inStock,
    });
    setEditing(product.id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const data = {
      name: form.name,
      code: form.code,
      price: Math.round(parseFloat(form.price) * 100),
      description: form.description,
      category: form.category,
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      inStock: form.inStock,
    };

    try {
      if (editing) {
        await fetch('/api/admin/products', {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify({ id: editing, ...data }),
        });
      } else {
        await fetch('/api/admin/products', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(data),
        });
      }

      setShowForm(false);
      setEditing(null);
      await fetchProducts();
    } catch {}
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ id }),
      });
      await fetchProducts();
    } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-white mb-1">Produtos</h1>
          <p className="text-gray-500 text-sm">{products.length} produtos no catálogo</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-brand text-black px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all"
        >
          <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo Produto
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-[#111] border border-[#222] rounded-2xl z-[301] overflow-y-auto max-h-[90vh]">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-lg">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                  <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              <input
                type="text"
                placeholder="Nome do produto"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Código"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço (R$)"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
                />
              </div>
              <input
                type="text"
                placeholder="Categoria"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50"
              />
              <textarea
                placeholder="Descrição"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50 resize-none"
              />
              <textarea
                placeholder="URLs das imagens (uma por linha)"
                rows={3}
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/50 resize-none font-mono text-xs"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand"
                />
                <span className="text-sm text-gray-300">Em estoque</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand text-black py-3 rounded-xl font-bold text-sm tracking-wider uppercase disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar Produto'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl text-gray-400 border border-[#222] text-sm hover:text-white hover:border-[#333] transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#333] transition-all group">
            <div className="aspect-square bg-[#0e0e0e] relative overflow-hidden">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <svg width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <rect x={3} y={3} width={18} height={18} rx={2} /><circle cx={8.5} cy={8.5} r={1.5} /><path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-red-400 text-xs font-bold uppercase">Esgotado</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-[0.65rem] tracking-wider mb-1">Cód. {product.code}</p>
              <h3 className="text-sm font-medium text-gray-200 line-clamp-2 mb-2">{product.name}</h3>
              <p className="text-brand font-display text-lg mb-3">{product.priceFormatted}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(product)}
                  className="flex-1 py-2 rounded-lg bg-[#1a1a1a] text-gray-400 text-xs font-bold uppercase hover:text-white hover:bg-[#222] transition-all"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="py-2 px-3 rounded-lg bg-red-500/5 text-red-400/60 text-xs font-bold uppercase hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
