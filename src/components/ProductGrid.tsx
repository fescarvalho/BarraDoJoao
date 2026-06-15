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
    <div className="flex flex-col gap-3 p-4">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => addToCart(product)}
          className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-95 transition-all rounded-2xl p-4 flex flex-row justify-between items-center w-full border border-slate-700 shadow-md"
        >
          <div className="flex flex-col text-left w-2/3 pr-4">
            <span className="text-slate-100 font-semibold text-base break-words leading-tight">
              {product.name}
            </span>
            {product.name.includes('CHAPA MISTA COMPLETA') && (
              <span className="text-slate-400 text-xs mt-1 leading-tight">
                (PICANHA 500GR - LINGUIÇA 300GR - BATATA 250GR - PÃO DE ALHO)
              </span>
            )}
          </div>
          <span className="text-green-400 font-bold text-lg bg-slate-900/50 px-3 py-2 rounded-lg shrink-0 text-right">
            {formatCurrency(product.price)}
          </span>
        </button>
      ))}
    </div>
  );
}
