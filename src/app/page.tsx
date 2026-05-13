"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Validar PIN no backend
    if (pin === '1234') { // Mock simples para continuar o fluxo
      router.push('/vendas');
    } else {
      alert('PIN incorreto!');
      setPin('');
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        // Auto-login ao chegar em 4 digitos
        if (newPin === '1234') {
          console.log("PIN correto, redirecionando...");
          router.push('/vendas');
        } else {
          alert('PIN incorreto!');
          setPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
            <Store size={40} className="text-green-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-100 tracking-tight">Barraca do João</h1>
          <p className="text-slate-400 mt-2">Sistema Rápido de Vendas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className={`w-4 h-4 rounded-full transition-colors ${
                  i < pin.length ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-95 transition-all text-2xl font-semibold text-slate-200"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700 active:bg-slate-600 active:scale-95 transition-all text-xl font-semibold text-slate-400 flex items-center justify-center"
            >
              Apagar
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-95 transition-all text-2xl font-semibold text-slate-200"
            >
              0
            </button>
            <button
              onClick={handleLogin}
              disabled={pin.length !== 4}
              className="h-16 rounded-2xl bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-slate-800 disabled:text-slate-600 active:scale-95 transition-all text-white flex items-center justify-center"
            >
              <KeyRound size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
