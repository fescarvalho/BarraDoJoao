"use client"

import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { CartItemType } from '@/types';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { addToCart, removeFromCart } = useCart();

  return (
    <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-slate-800/30">
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-slate-100 font-medium truncate">{item.product.name}</h4>
        <div className="text-slate-400 text-sm">
          {formatCurrency(item.product.price)} un.
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
          <button
            onClick={() => removeFromCart(item.product.id)}
            className="p-2 text-slate-300 hover:bg-slate-700 hover:text-white active:bg-slate-600 transition-colors"
          >
            {item.quantity === 1 ? <Trash2 size={18} className="text-red-400" /> : <Minus size={18} />}
          </button>
          <span className="w-8 text-center text-slate-100 font-medium">
            {item.quantity}
          </span>
          <button
            onClick={() => addToCart(item.product)}
            className="p-2 text-slate-300 hover:bg-slate-700 hover:text-white active:bg-slate-600 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        
        <div className="w-20 text-right text-slate-100 font-semibold">
          {formatCurrency(item.product.price * item.quantity)}
        </div>
      </div>
    </div>
  );
}
