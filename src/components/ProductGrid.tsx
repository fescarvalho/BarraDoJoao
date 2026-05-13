"use client"

import { Product } from '@prisma/client';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => addToCart(product)}
          className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-95 transition-all rounded-2xl p-4 flex flex-col items-center justify-center min-h-[120px] border border-slate-700 shadow-md"
        >
          <span className="text-slate-100 font-semibold text-lg text-center mb-2 line-clamp-2 leading-tight">
            {product.name}
          </span>
          <span className="text-green-400 font-bold text-xl">
            {formatCurrency(product.price)}
          </span>
        </button>
      ))}
    </div>
  );
}
