"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, CachedUser } from '@/lib/db';
import { fetchAllUsers } from '@/actions/user';

interface AuthContextData {
  user: CachedUser | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  syncUsers: () => Promise<void>;
  isSyncingAuth: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CachedUser | null>(null);
  const [isSyncingAuth, setIsSyncingAuth] = useState(false);

  useEffect(() => {
    // Restaurar sessão
    const savedUser = localStorage.getItem('@JoaoPDV:user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Tentar sincronizar usuários se estiver online
    if (navigator.onLine) {
      syncUsers();
    }
  }, []);

  const syncUsers = async () => {
    setIsSyncingAuth(true);
    try {
      const serverUsers = await fetchAllUsers();
      if (serverUsers && serverUsers.length > 0) {
        // Limpar cache antigo e inserir novos
        await db.users_cache.clear();
        await db.users_cache.bulkAdd(serverUsers);
        console.log(`[Auth] Sincronizados ${serverUsers.length} usuários.`);
      }
    } catch (error) {
      console.error('[Auth] Erro ao sincronizar usuários:', error);
    } finally {
      setIsSyncingAuth(false);
    }
  };

  const login = async (pin: string): Promise<boolean> => {
    try {
      const foundUser = await db.users_cache.where('pin').equals(pin).first();
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('@JoaoPDV:user', JSON.stringify(foundUser));
        return true;
      }
      return false;
    } catch (e) {
      console.error('[Auth] Erro no login:', e);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@JoaoPDV:user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, syncUsers, isSyncingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
