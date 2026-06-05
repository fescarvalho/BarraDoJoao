"use client"

import { useState, useTransition } from 'react';
import { formatCurrency } from '@/lib/utils';
import { closeTable } from '@/actions/order';
import { X, Loader2, Users, Receipt } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { useRouter } from 'next/navigation';

export default function MesasClient({ initialMesas }: { initialMesas: any[] }) {
  const [mesas, setMesas] = useState(initialMesas);
  const [selectedMesa, setSelectedMesa] = useState<any | null>(null);
  const [splitCount, setSplitCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DINHEIRO');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCloseTable = () => {
    if (!selectedMesa) return;

    startTransition(async () => {
      const res = await closeTable(selectedMesa.id, paymentMethod);
      if (res.success) {
        setMesas(prev => prev.filter(m => m.id !== selectedMesa.id));
        setSelectedMesa(null);
        router.refresh();
      } else {
        alert("Erro ao fechar mesa: " + res.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <h1 className="text-3xl font-black mb-8">Gestão de Mesas</h1>
      
      {mesas.length === 0 ? (
        <div className="text-center p-12 bg-slate-900 rounded-3xl border border-slate-800">
          <p className="text-slate-400 text-lg">Nenhuma mesa aberta no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mesas.map(mesa => (
            <button
              key={mesa.id}
              onClick={() => { setSelectedMesa(mesa); setSplitCount(1); }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500 hover:bg-slate-800 transition-all text-center group"
            >
              <div className="text-5xl font-black text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
                {mesa.tableNumber}
              </div>
              <div className="text-green-400 font-bold text-lg">
                {formatCurrency(mesa.total)}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedMesa && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black">Mesa {selectedMesa.tableNumber}</h2>
              <button 
                onClick={() => setSelectedMesa(null)}
                className="p-2 text-slate-400 hover:bg-slate-800 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Consumo</h3>
                {selectedMesa.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800/50">
                    <div>
                      <span className="font-bold text-slate-200">{item.quantity}x</span>{' '}
                      <span className="text-slate-300">{item.product.name}</span>
                    </div>
                    <div className="font-medium text-slate-400">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-6">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Total</span>
                  <span className="text-4xl font-black text-green-400 leading-none">
                    {formatCurrency(selectedMesa.total)}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-bold">
                      <Users size={16} /> Dividir por quantas pessoas?
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          onClick={() => setSplitCount(num)}
                          className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                            splitCount === num 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {splitCount > 1 && (
                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-blue-500/30">
                      <span className="text-blue-400 font-bold">Valor por pessoa:</span>
                      <span className="text-2xl font-black text-blue-400">
                        {formatCurrency(Math.ceil(selectedMesa.total / splitCount))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                  <Receipt size={16} /> Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['DINHEIRO', 'PIX', 'CARTAO'] as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 rounded-xl font-bold transition-colors text-sm ${
                        paymentMethod === method
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 shrink-0">
              <button
                onClick={handleCloseTable}
                disabled={isPending}
                className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white font-black text-xl py-5 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-green-500/20"
              >
                {isPending ? (
                  <><Loader2 className="animate-spin" /> Fechando...</>
                ) : (
                  'Confirmar Pagamento e Imprimir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
