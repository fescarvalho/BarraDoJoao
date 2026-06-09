import prisma from './src/lib/prisma';

async function main() {
  const jobs = await prisma.printQueue.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log('PRINT QUEUE JOBS:', JSON.stringify(jobs, null, 2));
}

main().finally(() => prisma.$disconnect());
