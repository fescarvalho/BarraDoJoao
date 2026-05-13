"use server"

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function upsertProduct(formData: {
  id?: string;
  name: string;
  price: number;
  category: string;
}) {
  try {
    if (formData.id) {
      await prisma.product.update({
        where: { id: formData.id },
        data: {
          name: formData.name,
          price: formData.price,
          category: formData.category,
        }
      });
    } else {
      await prisma.product.create({
        data: {
          name: formData.name,
          price: formData.price,
          category: formData.category,
        }
      });
    }
    
    revalidatePath('/vendas');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    return { success: false, error: 'Falha ao salvar produto' };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Em vez de deletar fisicamente, vamos apenas desativar para manter histórico de vendas
    await prisma.product.update({
      where: { id },
      data: { active: false }
    });
    
    revalidatePath('/vendas');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    return { success: false, error: 'Falha ao remover produto' };
  }
}
