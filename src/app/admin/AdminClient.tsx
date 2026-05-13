"use client"

import { useState } from 'react';
import { Product } from '@prisma/client';
import { upsertProduct, deleteProduct } from '@/actions/products';
import { Plus, Edit2, Trash2, ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingProduct?.id,
      name: formData.get('name') as string,
      price: Math.round(parseFloat(formData.get('price') as string) * 100),
      category: formData.get('category') as string,
    };

    const res = await upsertProduct(data);
    if (res.success) {
      window.location.reload(); // Simples e eficaz para o senhor de idade
    } else {
      alert('Erro ao salvar produto');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto do cardapio?')) {
      const res = await deleteProduct(id);
      if (res.success) {
        window.location.reload();
      }
    }
  };

  const openModal = (product: Partial<Product> | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/vendas" className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-black">Gestão do Cardápio</h1>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-green-500/20"
          >
            <Plus size={20} />
            <span>Novo Produto</span>
          </button>
        </header>

        <div className="grid gap-4">
          {products.filter(p => p.active).map((product) => (
            <div key={product.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex justify-between items-center group hover:border-slate-700 transition-all">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{product.category}</span>
                <h3 className="text-xl font-bold text-slate-200">{product.name}</h3>
                <p className="text-green-400 font-mono text-lg font-bold">
                  {(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(product)}
                  className="p-3 bg-slate-800 text-slate-300 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-3 bg-slate-800 text-slate-300 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Cadastro/Edicao */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingProduct?.id ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Nome do Produto</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-green-500 outline-none"
                  placeholder="Ex: Coca-Cola Lata"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Preço (R$)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct && editingProduct.price ? editingProduct.price / 100 : ''}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-green-500 outline-none"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Categoria</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'Bebidas'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-green-500 outline-none"
                  >
                    <option value="Bebidas">Bebidas</option>
                    <option value="Lanches">Lanches</option>
                    <option value="Doces">Doces</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
              >
                <Save size={24} />
                SALVAR PRODUTO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
