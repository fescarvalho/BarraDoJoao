import prisma from '@/lib/prisma';
import VendasClient from './VendasClient';

export default async function VendasPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { category: 'asc' }
  });

  return <VendasClient initialProducts={products} />;
}
