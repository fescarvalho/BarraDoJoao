"use server"

import prisma from '@/lib/prisma';
import { PaymentMethod } from '@/types';
import { OrderType } from '@prisma/client';

interface OrderPayload {
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  type: OrderType;
  paymentMethod?: PaymentMethod;
  tableNumber?: number;
  total: number;
  sellerId: string;
}

export async function createOrder(payload: OrderPayload) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Se for MESA, tenta encontrar uma mesa aberta para acumular
      if (payload.type === 'MESA' && payload.tableNumber) {
        const existingOrder = await tx.order.findFirst({
          where: {
            type: 'MESA',
            tableNumber: payload.tableNumber,
            status: 'ABERTA'
          },
          include: {
            items: true
          }
        });

        if (existingOrder) {
          // Atualiza a mesa existente: soma o total e insere os novos itens
          const updatedOrder = await tx.order.update({
            where: { id: existingOrder.id },
            data: {
              total: existingOrder.total + payload.total,
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
                include: { product: true }
              },
              seller: true
            }
          });
          return updatedOrder;
        }
      }

      // 1. Criar a Order e os OrderItems (AVULSO ou MESA nova)
      const orderStatus = payload.type === 'AVULSO' ? 'FECHADA' : 'ABERTA';

      const order = await tx.order.create({
        data: {
          sellerId: payload.sellerId,
          total: payload.total,
          type: payload.type,
          paymentMethod: payload.paymentMethod,
          tableNumber: payload.tableNumber,
          status: orderStatus,
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

      // 2. Tentar enfileirar para impressão, mas APENAS se for AVULSO (já fechada)
      if (order.type === 'AVULSO' && order.status === 'FECHADA') {
        try {
          const printPayload = {
            orderId: order.id,
            timestamp: order.createdAt.toISOString(),
            seller: order.seller?.name || 'Caixa',
            paymentMethod: order.paymentMethod,
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
      }

      return order;
    });

    return { success: true, orderId: result.id };
  } catch (error) {
    console.error('Erro ao processar pedido:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Falha ao processar pedido' 
    };
  }
}

export async function closeTable(orderId: string, paymentMethod: PaymentMethod) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'FECHADA',
          paymentMethod: paymentMethod,
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

      // Enfileirar para impressão
      try {
        const printPayload = {
          orderId: order.id,
          timestamp: new Date().toISOString(),
          seller: order.seller?.name || 'Caixa',
          paymentMethod: order.paymentMethod,
          type: order.type,
          tableNumber: order.tableNumber,
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
        console.error('Erro ao enfileirar fechamento de mesa:', printError);
      }

      return order;
    });

    return { success: true, orderId: result.id };
  } catch (error) {
    console.error('Erro ao fechar mesa:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Falha ao fechar mesa' 
    };
  }
}
