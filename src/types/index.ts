import { Product } from '@prisma/client'

export interface CartItemType {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CARTAO';
