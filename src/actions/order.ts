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
          status: 'COMPLETED',
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

      // 2. Tentar enfileirar para impressão, mas não travar o pedido se falhar
      try {
        const printPayload = {
          orderId: order.id,
          timestamp: order.createdAt.toISOString(),
          seller: order.seller?.name || 'Caixa',
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

        await tx.printQueue.create({
          data: {
            orderId: order.id,
            payload: printPayload,
            status: 'PENDING'
          }
        });
      } catch (printError) {
        console.error('Erro ao enfileirar para impressão (ignorado):', printError);
      }

      return order;
    });

    return { success: true, orderId: result.id };
  } catch (error) {
    console.error('Erro ao criar pedido (CRÍTICO):', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Falha ao processar venda' 
    };
  }
}

