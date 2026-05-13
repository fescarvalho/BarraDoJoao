import prisma from '@/lib/prisma';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  // Busca todos os produtos, inclusive os inativos para gestao
  const products = await prisma.product.findMany({
    orderBy: { category: 'asc' }
  });

  return <AdminClient initialProducts={products} />;
}
