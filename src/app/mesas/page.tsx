import prisma from '@/lib/prisma';
import MesasClient from './MesasClient';

export const dynamic = 'force-dynamic';

export default async function MesasPage() {
  const mesas = await prisma.order.findMany({
    where: { 
      type: 'MESA',
      status: 'ABERTA'
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      tableNumber: 'asc'
    }
  });

  return <MesasClient initialMesas={mesas} />;
}
