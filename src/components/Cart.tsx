"use client"

import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import { CartItem } from './CartItem';
import { useState } from 'react';
import { CheckoutModal } from './CheckoutModal';

export function Cart({ isMobile }: { isMobile?: boolean }) {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500 border-l border-slate-800 bg-slate-900/50">
        <ShoppingCart size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Carrinho vazio</p>
        <p className="text-sm mt-2 text-center">Toque nos produtos para adicionar</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {/* Lista expansivel (opcional) */}
        {isExpanded && (
          <div className="max-h-[60vh] overflow-y-auto mb-2 space-y-2">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-slate-100 font-bold">Itens no Carrinho</h3>
              <button onClick={clearCart} className="text-red-400 text-xs">Limpar tudo</button>
            </div>
            {cart.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col" onClick={() => setIsExpanded(!isExpanded)}>
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total</span>
            <span className="text-2xl font-black text-green-400 leading-none">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="flex-1 h-14 bg-green-500 hover:bg-green-600 active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-black text-white text-lg transition-all shadow-lg shadow-green-500/20"
          >
            {isExpanded ? 'CONFIRMAR' : `FINALIZAR (${totalItems})`}
          </button>
        </div>

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-green-500" />
          <h2 className="text-xl font-bold text-slate-100">Carrinho</h2>
          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg text-sm font-bold">
            {totalItems}
          </span>
        </div>
        <button
          onClick={clearCart}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
          title="Limpar carrinho"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <ShoppingCart size={48} className="opacity-20" />
            <p>Carrinho vazio</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))
        )}
      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <div className="flex justify-between items-end">
          <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total do Pedido</span>
          <span className="text-4xl font-black text-green-400 leading-none">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        <button
          onClick={() => setIsCheckoutOpen(true)}
          disabled={cart.length === 0}
          className="w-full h-20 bg-green-500 hover:bg-green-600 active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 rounded-3xl font-black text-2xl text-white transition-all shadow-xl shadow-green-500/20"
        >
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
