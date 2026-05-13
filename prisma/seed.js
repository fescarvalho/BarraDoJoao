require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Criar Usuário (Garçom)
  const user = await prisma.user.upsert({
    where: { id: 'cl_mock_seller_id' },
    update: {},
    create: {
      id: 'cl_mock_seller_id',
      name: 'João',
      role: 'GARCOM',
      pin: '1234',
    },
  })

  console.log({ user })

  // Limpar produtos antigos para evitar duplicatas no seed
  await prisma.product.deleteMany({})

  // Criar Produtos
  const products = [
    { name: 'X-Salada', price: 1500, category: 'Lanches' },
    { name: 'X-Tudo', price: 2000, category: 'Lanches' },
    { name: 'Coca-Cola Lata', price: 600, category: 'Bebidas' },
    { name: 'Guaraná Lata', price: 500, category: 'Bebidas' },
    { name: 'Água', price: 300, category: 'Bebidas' },
    { name: 'Bolo no Pote', price: 800, category: 'Doces' },
    { name: 'Brigadeiro', price: 300, category: 'Doces' },
    { name: 'Fatia de Pizza', price: 1200, category: 'Pizzas' },
  ]

  for (const p of products) {
    await prisma.product.create({
      data: p,
    })
  }

  console.log('Seed finalizado com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
