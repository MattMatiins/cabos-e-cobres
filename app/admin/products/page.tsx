'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/lib/admin-auth';

interface ProductForm {
  name: string;
  code: string;
  price: string;
  description: string;
  category: string;
  imageUrls: string;
  inStock: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  code: '',
  price: '',
  description: '',
  category: '',
  imageUrls: '',
  inStock: true,
};

export default function AdminProducts() {
  const { headers } = useAdminAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchProducts() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/products', { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else if (res.status === 401) {
        setError('Senha de admin incorreta. Faça logout e entre novamente.');
      } else {
        setError(`Erro ao carregar produtos (${res.status})`);
      }
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function openNew() {
    setForm(emptyForm);
    setUploadedImages([]);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(product: any) {
    const httpImages = (product.images || []).filter((img: string) => img.startsWith('http'));
    const dataImages = (product.images || []).filter((img: string) => img.startsWith('data:'));
    setForm({
      name: product.name,
      code: product.code,
      price: String(product.price / 100),
      description: product.description || '',
      category: product.category || '',
      imageUrls: httpImages.join('\n'),
      inStock: product.inStock,
    });
    setUploadedImages(dataImages);
    setEditing(product.id);
    setShowForm(true);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        alert(`Imagem "${file.name}" é maior que 5MB. Tente uma imagem menor.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          // Compress image via canvas
          const img = document.createElement('img');
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 800;
            let w = img.width;
            let h = img.height;
            if (w > MAX || h > MAX) {
              if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
              else { w = Math.round(w * MAX / h); h = MAX; }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setUploadedImages((prev) => [...prev, compressed]);
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeUploadedImage(index: number) {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Combine uploaded images + URL images
    const urlImages = form.imageUrls.split('\n').map((s) => s.trim()).filter(Boolean);
    const allImages = [...uploadedImages, ...urlImages];

    const data = {
      name: form.name,
      code: form.code,
      price: Math.round(parseFloat(form.price) * 100),
      description: form.description,
      category: form.category,
      images: allImages,
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
      setUploadedImages([]);
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

  // Helper to render product thumbnail (supports data URLs and http URLs)
  function ProductThumb({ src, alt }: { src: string; alt: string }) {
    if (src.startsWith('data:')) {
      /* eslint-disable-next-line @next/next/no-img-element */
      return <img src={src} alt={alt} className="w-full h-full object-cover" />;
    }
    return <Image src={src} alt={alt} width={300} height={300} className="w-full h-full object-cover" unoptimized />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-white mb-1">Produtos</h1>
          <p className="text-gray-500 text-sm">{products.length} produtos no catálogo</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-orange-500 text-black px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all"
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
                <h2 className="font-extrabold text-lg">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
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
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Código"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço (R$)"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <input
                type="text"
                placeholder="Categoria"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
              />
              <textarea
                placeholder="Descrição"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
              />

              {/* ── Image Upload ── */}
              <div>
                <label className="block text-gray-400 text-xs mb-2 font-semibold uppercase tracking-wider">Imagens do Produto</label>

                {/* Upload button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#333] hover:border-orange-500/40 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                >
                  <svg width={32} height={32} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="mx-auto text-gray-600 group-hover:text-orange-400 transition-colors mb-2">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-xs">Clique para fazer upload de imagens</p>
                  <p className="text-gray-600 text-[10px] mt-1">JPG, PNG até 5MB — serão redimensionadas automaticamente</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Uploaded image previews */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative group/img aspect-square rounded-lg overflow-hidden bg-[#0e0e0e]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <svg width={10} height={10} fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL input (optional) */}
                <details className="mt-3">
                  <summary className="text-gray-600 text-[10px] cursor-pointer hover:text-gray-400 transition-colors">
                    Ou cole URLs de imagens externas
                  </summary>
                  <textarea
                    placeholder="https://exemplo.com/imagem.jpg (uma por linha)"
                    rows={2}
                    value={form.imageUrls}
                    onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
                    className="w-full mt-2 bg-[#161616] border border-[#222] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none font-mono text-xs"
                  />
                </details>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <span className="text-sm text-gray-300">Em estoque</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 text-black py-3 rounded-xl font-bold text-sm tracking-wider uppercase disabled:opacity-50"
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full mx-auto mb-4" style={{ animation: 'spin 1s linear infinite' }} />
          <p className="text-gray-500 text-sm">Carregando produtos...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 text-center mb-6">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button onClick={fetchProducts} className="text-orange-400 text-xs font-bold uppercase tracking-wider hover:underline">
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#333] transition-all group">
            <div className="aspect-square bg-[#0e0e0e] relative overflow-hidden">
              {product.images?.[0] ? (
                <ProductThumb src={product.images[0]} alt={product.name} />
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
              <p className="text-orange-400 font-extrabold text-lg mb-3">{product.priceFormatted}</p>
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
      </div>}
    </div>
  );
}
