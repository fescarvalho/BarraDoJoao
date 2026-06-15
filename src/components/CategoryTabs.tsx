"use client"

import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelectCategory }: CategoryTabsProps) {
  const getShortName = (name: string) => {
    if (name === 'PORÇÕES DE CARNE') return 'CARNES';
    if (name === 'PORÇÕES BATATA') return 'BATATAS';
    if (name === 'CHOPP DE VINHO') return 'VINHO';
    if (name === 'CHOPP IPA') return 'IPA';
    if (name === 'CHOPP PILSEN') return 'PILSEN';
    return name;
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-900 border-b border-slate-800">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          "px-4 py-2 rounded-full font-semibold text-sm transition-all border",
          activeCategory === null
            ? "bg-slate-100 text-slate-900 border-slate-100 shadow-sm"
            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200"
        )}
      >
        Todos
      </button>
      
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={cn(
            "px-4 py-2 rounded-full font-semibold text-sm transition-all border",
            activeCategory === category
              ? "bg-slate-100 text-slate-900 border-slate-100 shadow-sm"
              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200"
          )}
        >
          {getShortName(category)}
        </button>
      ))}
    </div>
  );
}
