import prisma from './src/lib/prisma';

async function main() {
  const admin = await prisma.user.create({
    data: {
      name: 'João (Caixa)',
      role: 'ADMIN',
      pin: '1111',
    },
  });

  const garcom = await prisma.user.create({
    data: {
      name: 'Maria (Garçom)',
      role: 'GARCOM',
      pin: '2222',
    },
  });

  console.log('Usuários criados com sucesso:');
  console.log(admin);
  console.log(garcom);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
