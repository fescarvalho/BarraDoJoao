"use client"

import { ProductGrid } from '@/components/ProductGrid';
import { Cart } from '@/components/Cart';
import { CategoryTabs } from '@/components/CategoryTabs';
import { useState } from 'react';
import { Product } from '@prisma/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendasClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(initialProducts.map(p => p.category)));

  const filteredProducts = activeCategory 
    ? initialProducts.filter(p => p.category === activeCategory)
    : initialProducts;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Left Area - Products */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-100">FestaPDV</h1>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-slate-300 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </header>

        <CategoryTabs 
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <main className="flex-1 overflow-y-auto">
          <ProductGrid products={filteredProducts} />
        </main>
      </div>

      {/* Right Area - Cart */}
      <div className="w-[360px] flex-shrink-0 h-full hidden md:block">
        <Cart />
      </div>

      {/* Mobile Cart Overlay could go here in future */}
    </div>
  );
}
