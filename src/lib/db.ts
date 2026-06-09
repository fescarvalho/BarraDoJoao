import Dexie, { Table } from 'dexie';
import { PaymentMethod } from '@/types';
import { OrderType } from '@prisma/client';

export type OfflineActionType = 'CREATE_ORDER' | 'CLOSE_TABLE';

export interface OfflineAction {
  id?: number;
  actionType: OfflineActionType;
  payload: any; // O payload que seria enviado para a Server Action
  status: 'PENDING' | 'ERROR';
  createdAt: Date;
  errorMessage?: string;
  retries: number;
}

export interface CachedUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'GARCOM';
  pin: string;
}

export class PdvDexie extends Dexie {
  offlineActions!: Table<OfflineAction>;
  users_cache!: Table<CachedUser>;

  constructor() {
    super('joao-pdv-db');
    this.version(2).stores({
      offlineActions: '++id, actionType, status, createdAt',
      users_cache: 'id, pin, role'
    }).upgrade(tx => {
      // Força recriação da versão 2 limpando cache anterior caso houvesse
    });
  }
}

export const db = new PdvDexie();
