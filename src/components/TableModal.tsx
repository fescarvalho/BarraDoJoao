"use client"

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { createOrder } from '@/actions/order';
import { OrderSuccess } from './OrderSuccess';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TableModal({ isOpen, onClose }: TableModalProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [tableNumber, setTableNumber] = useState('');

  if (!isOpen) return null;

  const handleSuccess = () => {
    setShowSuccess(true);
    clearCart();
    setTimeout(() => {
      setShowSuccess(false);
      setTableNumber('');
      onClose();
    }, 2000);
  };

  const handleLaunchTable = () => {
    if (cart.length === 0 || !tableNumber || !user) return;

    startTransition(async () => {
      const payload = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price
        })),
        type: 'MESA' as const,
        tableNumber: parseInt(tableNumber),
        total: totalPrice,
        sellerId: user.id 
      };

      try {
        if (!navigator.onLine) {
          throw new Error('OFFLINE_FALLBACK');
        }

        const result = await createOrder(payload);

        if (result.success) {
          handleSuccess();
        } else {
          alert(`Erro ao lançar na mesa: ${result.error}`);
        }
      } catch (error: any) {
        if (error.message === 'OFFLINE_FALLBACK' || error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          const { db } = await import('@/lib/db');
          await db.offlineActions.add({
            actionType: 'CREATE_ORDER',
            payload,
            status: 'PENDING',
            createdAt: new Date(),
            retries: 0
          });
          handleSuccess();
        } else {
          alert('Erro ao lançar na mesa. Verifique a conexão com o banco.');
          console.error(error);
        }
      }
    });
  };
  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
        <div className="bg-slate-900 w-full sm:w-[480px] sm:rounded-3xl rounded-t-3xl border border-slate-800 shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300">
          
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-slate-100">Lançar na Mesa</h3>
            <button 
              onClick={onClose}
              disabled={isPending}
              className="p-2 text-slate-400 hover:bg-slate-800 rounded-full active:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-8">
            <label className="block text-slate-400 mb-2 text-lg">Número da Mesa</label>
            <input 
              type="number" 
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-3xl font-black text-white text-center focus:outline-none focus:border-green-500 transition-colors"
              placeholder="Ex: 12"
              autoFocus
            />
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
              onClick={handleLaunchTable}
              disabled={isPending || !tableNumber}
              className="flex-[2] bg-blue-500 hover:bg-blue-600 text-white active:scale-[0.98] transition-all font-bold text-xl py-5 rounded-2xl disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2 shadow-xl shadow-blue-500/20"
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
