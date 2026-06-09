"use client"

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { createOrder, closeTable } from '@/actions/order';
import { WifiOff, CloudSync, CheckCircle2 } from 'lucide-react';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Definir estado inicial
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitorar quantidade de itens pendentes
    const updatePendingCount = async () => {
      try {
        const count = await db.offlineActions.where('status').equals('PENDING').count();
        setPendingCount(count);
      } catch (e) {
        console.error("Erro ao ler dexie:", e);
      }
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000); // Atualiza a cada 5s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const syncOfflineData = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const pendingActions = await db.offlineActions
        .where('status')
        .equals('PENDING')
        .sortBy('createdAt');

      if (pendingActions.length === 0) {
        setIsSyncing(false);
        return;
      }

      for (const action of pendingActions) {
        try {
          let res;
          if (action.actionType === 'CREATE_ORDER') {
            res = await createOrder(action.payload);
          } else if (action.actionType === 'CLOSE_TABLE') {
            res = await closeTable(action.payload.orderId, action.payload.paymentMethod);
          }

          if (res?.success) {
            // Sucesso! Deletar do banco local
            await db.offlineActions.delete(action.id!);
          } else {
            // Se falhou por erro de negócio (não rede), marcar como ERROR
            await db.offlineActions.update(action.id!, {
              status: 'ERROR',
              errorMessage: res?.error || 'Erro desconhecido',
              retries: action.retries + 1
            });
          }
        } catch (error) {
          // Falha de rede provável, apenas incrementar retries
          console.error("Erro de rede ao sincronizar action:", action.id, error);
          await db.offlineActions.update(action.id!, {
            retries: action.retries + 1
          });
          break; // Para o loop de sync se a rede cair
        }
      }
      
      // Atualizar contagem
      const count = await db.offlineActions.where('status').equals('PENDING').count();
      setPendingCount(count);
    } catch (e) {
      console.error("Erro fatal no processo de sincronização:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {/* Banner de Status Overlay Global */}
      {(!isOnline || pendingCount > 0) && (
        <div className={`fixed top-0 left-0 w-full z-50 py-1.5 px-4 flex items-center justify-center gap-3 text-sm font-bold text-white shadow-md transition-all ${!isOnline ? 'bg-red-500' : 'bg-blue-500'}`}>
          {!isOnline ? (
            <><WifiOff size={16} /> Offline - {pendingCount} pedidos na fila aguardando internet</>
          ) : isSyncing ? (
            <><CloudSync size={16} className="animate-spin" /> Sincronizando {pendingCount} pedidos com a nuvem...</>
          ) : pendingCount > 0 ? (
            <><CloudSync size={16} /> Internet recuperada. {pendingCount} pedidos pendentes.</>
          ) : (
            <><CheckCircle2 size={16} /> Sincronizado com sucesso!</>
          )}
        </div>
      )}
      {children}
    </>
  );
}
