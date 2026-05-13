"use client"

import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import { CartItem } from './CartItem';
import { useState } from 'react';
import { CheckoutModal } from './CheckoutModal';

export function Cart() {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500 border-l border-slate-800 bg-slate-900/50">
        <ShoppingCart size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Carrinho vazio</p>
        <p className="text-sm mt-2 text-center">Toque nos produtos para adicionar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-l border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShoppingCart size={24} className="text-green-500" />
          Carrinho <span className="bg-green-500/20 text-green-400 text-sm py-0.5 px-2 rounded-full ml-2">{totalItems}</span>
        </h2>
        <button
          onClick={clearCart}
          className="p-2 text-red-400 hover:bg-red-400/10 active:bg-red-400/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Trash2 size={18} />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {cart.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-end mb-4">
          <span className="text-slate-400">Total</span>
          <span className="text-3xl font-black text-white">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 active:scale-[0.98] transition-all text-white font-bold text-xl py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/20"
        >
          <CreditCard size={24} />
          FINALIZAR
        </button>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}
