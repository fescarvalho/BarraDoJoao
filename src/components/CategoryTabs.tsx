"use client"

import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <div className="flex overflow-x-auto no-scrollbar gap-2 p-4 bg-slate-900 border-b border-slate-800">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          "whitespace-nowrap px-6 py-3 rounded-full font-semibold text-sm transition-all flex-shrink-0 border",
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
            "whitespace-nowrap px-6 py-3 rounded-full font-semibold text-sm transition-all flex-shrink-0 border",
            activeCategory === category
              ? "bg-slate-100 text-slate-900 border-slate-100 shadow-sm"
              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
