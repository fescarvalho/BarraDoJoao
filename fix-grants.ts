import prisma from './src/lib/prisma';

async function fixGrants() {
  try {
    console.log('Aplicando Grants para service_role...');
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;`);
    
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO anon;`);
    await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;`);

    console.log('Grants aplicados com sucesso!');
  } catch (error: any) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixGrants();
