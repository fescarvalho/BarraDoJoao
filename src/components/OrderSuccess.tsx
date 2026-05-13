"use client"

import { CheckCircle2 } from 'lucide-react';

export function OrderSuccess() {
  return (
    <div className="fixed inset-0 bg-green-500 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-150">
      <div className="animate-in zoom-in-50 duration-300 delay-150 flex flex-col items-center">
        <CheckCircle2 size={120} className="text-white mb-6 drop-shadow-xl" />
        <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-lg text-center px-4">
          VENDA<br/>CONCLUÍDA!
        </h2>
      </div>
    </div>
  );
}
