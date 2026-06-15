import prisma from '@/lib/prisma';
import VendasClient from './VendasClient';

export const dynamic = 'force-dynamic';

export default async function VendasPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { category: 'asc' }
  });

  return <VendasClient initialProducts={products} />;
}
