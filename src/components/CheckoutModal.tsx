"use client"

import { useCart } from '@/contexts/CartContext';
import { formatCurrency, cn } from '@/lib/utils';
import { PaymentMethod } from '@/types';
import { X, Banknote, CreditCard, SmartphoneNfc, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { createOrder } from '@/actions/order';
import { OrderSuccess } from './OrderSuccess';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (!selectedMethod || cart.length === 0) return;

    startTransition(async () => {
      try {
        const result = await createOrder({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price
          })),
          type: selectedMethod,
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
            setSelectedMethod(null);
          }, 2000);
        } else {
          alert('Erro ao finalizar venda.');
        }
      } catch (error) {
        alert('Erro ao finalizar venda.');
        console.error(error);
      }
    });
  };

  const paymentMethods = [
    { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/50' },
    { id: 'PIX', label: 'PIX', icon: SmartphoneNfc, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/50' },
    { id: 'CARTAO', label: 'Cartão', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/50' },
  ] as const;

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
        <div className="bg-slate-900 w-full sm:w-[480px] sm:rounded-3xl rounded-t-3xl border border-slate-800 shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300">
          
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-slate-100">Pagamento</h3>
            <button 
              onClick={onClose}
              disabled={isPending}
              className="p-2 text-slate-400 hover:bg-slate-800 rounded-full active:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          <div className="text-center mb-8 bg-slate-950 rounded-2xl p-6 border border-slate-800">
            <p className="text-slate-400 mb-1">Total a cobrar</p>
            <p className="text-5xl font-black text-white tracking-tight">
              {formatCurrency(totalPrice)}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                  disabled={isPending}
                  className={cn(
                    "w-full flex items-center p-4 rounded-2xl border-2 transition-all disabled:opacity-50",
                    isSelected 
                      ? `${method.border} ${method.bg}`
                      : "border-slate-800 hover:border-slate-700 bg-slate-800/30"
                  )}
                >
                  <div className={cn("p-3 rounded-xl mr-4", isSelected ? method.bg : "bg-slate-800")}>
                    <Icon size={24} className={isSelected ? method.color : "text-slate-400"} />
                  </div>
                  <span className={cn(
                    "text-xl font-semibold",
                    isSelected ? "text-slate-100" : "text-slate-300"
                  )}>
                    {method.label}
                  </span>
                  
                  {isSelected && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-slate-100 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  )}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleCheckout}
            disabled={!selectedMethod || isPending}
            className="w-full bg-slate-100 hover:bg-white text-slate-950 active:scale-[0.98] transition-all font-bold text-xl py-5 rounded-2xl disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2 shadow-xl shadow-slate-100/10"
          >
            {isPending ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Recebimento'
            )}
          </button>
        </div>
      </div>
      
      {showSuccess && <OrderSuccess />}
    </>
  );
}
