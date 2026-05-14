"use client"

import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { PaymentMethod } from '@/types';
import { X, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { createOrder } from '@/actions/order';
import { OrderSuccess } from './OrderSuccess';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    startTransition(async () => {
      try {
        const result = await createOrder({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price
          })),
          type: 'DINHEIRO',
          total: totalPrice,
          // TODO: Pegar sellerId real do contexto de auth
          sellerId: 'cl_mock_seller_id' 
        });

        if (result.success) {
          setShowSuccess(true);
          clearCart();
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
          }, 2000);
        } else {
          alert(`Erro ao finalizar venda: ${result.error}`);
        }
      } catch (error) {
        alert('Erro ao finalizar venda. Verifique a conexão com o banco.');
        console.error(error);
      }
    });
  };


  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
        <div className="bg-slate-900 w-full sm:w-[480px] sm:rounded-3xl rounded-t-3xl border border-slate-800 shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300">
          
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-slate-100">Finalizar Venda</h3>
            <button 
              onClick={onClose}
              disabled={isPending}
              className="p-2 text-slate-400 hover:bg-slate-800 rounded-full active:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          <div className="text-center mb-8 bg-slate-950 rounded-2xl p-6 border border-slate-800">
            <p className="text-slate-400 mb-1">Total do Pedido</p>
            <p className="text-5xl font-black text-white tracking-tight">
              {formatCurrency(totalPrice)}
            </p>
          </div>

          <div className="mb-8 text-center">
            <p className="text-slate-400 text-lg">
              Deseja confirmar esta venda?
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xl py-5 rounded-2xl transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCheckout}
              disabled={isPending}
              className="flex-[2] bg-green-500 hover:bg-green-600 text-white active:scale-[0.98] transition-all font-bold text-xl py-5 rounded-2xl disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2 shadow-xl shadow-green-500/20"
            >
              {isPending ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </div>
      </div>
      
      {showSuccess && <OrderSuccess />}
    </>
  );
}

