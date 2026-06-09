import prisma from './src/lib/prisma';

async function enableRealtime() {
  try {
    console.log('Habilitando Realtime para a tabela print_queue...');
    await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE print_queue;`);
    console.log('Realtime habilitado com sucesso!');
  } catch (error: any) {
    if (error.message.includes('is already in publication')) {
      console.log('A tabela já está no Realtime.');
    } else {
      console.error('Erro:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

enableRealtime();
