"use client"

import { ProductGrid } from '@/components/ProductGrid';
import { Cart } from '@/components/Cart';
import { CategoryTabs } from '@/components/CategoryTabs';
import { useState } from 'react';
import { Product } from '@prisma/client';
import { LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendasClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(initialProducts.map(p => p.category)));

  const filteredProducts = activeCategory 
    ? initialProducts.filter(p => p.category === activeCategory)
    : initialProducts;

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-slate-950">
      {/* Area de Produtos */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-100">Barraca do João</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-600 active:bg-blue-700 rounded-xl text-slate-300 hover:text-white transition-all"
              title="Gerenciar Produtos"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Gerenciar</span>
            </button>
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600 active:bg-red-700 rounded-xl text-slate-300 hover:text-white transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <CategoryTabs 
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <main className="flex-1 overflow-y-auto p-4">
          <ProductGrid products={filteredProducts} />
        </main>
      </div>

      {/* Barra de Carrinho para Celular (Fixa no rodape, sem tampar nada) */}
      <div className="md:hidden p-4 bg-slate-900 border-t border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <Cart isMobile />
      </div>

      {/* Carrinho Lateral para Computador */}
      <div className="hidden md:block w-[360px] flex-shrink-0 h-full border-l border-slate-800">
        <Cart />
      </div>
    </div>
  );
}
