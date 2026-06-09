"use server"

import prisma from '@/lib/prisma';
import type { Role } from '@prisma/client';

export type UserDTO = {
  id: string;
  name: string;
  role: Role;
  pin: string;
};

export async function fetchAllUsers(): Promise<UserDTO[]> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        pin: true
      }
    });
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}
