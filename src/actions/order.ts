"use server"

import prisma from '@/lib/prisma';
import { PaymentMethod } from '@/types';

interface OrderPayload {
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  type: PaymentMethod;
  total: number;
  sellerId: string;
}

export async function createOrder(payload: OrderPayload) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar a Order e os OrderItems
      const order = await tx.order.create({
        data: {
          sellerId: payload.sellerId,
          total: payload.total,
          type: payload.type,
          status: 'COMPLETED', // Venda rápida já entra como concluída
          items: {
            create: payload.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          seller: true
        }
      });

      // 2. Formatar os dados para impressão (payload JSON)
      const printPayload = {
        orderId: order.id,
        timestamp: order.createdAt.toISOString(),
        seller: order.seller.name,
        type: order.type,
        total: order.total,
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          category: item.product.category
        }))
      };

      // 3. Inserir na fila de impressão
      await tx.printQueue.create({
        data: {
          orderId: order.id,
          payload: printPayload,
          status: 'PENDING'
        }
      });

      return order;
    });

    return { success: true, orderId: result.id };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return { success: false, error: 'Falha ao processar venda' };
  }
}
