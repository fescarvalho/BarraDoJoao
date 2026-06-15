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

  // (Os produtos antigos já vendidos não podem ser apagados por causa do histórico de vendas)

  // Criar Produtos
  await prisma.product.createMany({
    data: [
      // PORÇÕES BATATA
      { name: 'BATATA 500GR - QUEIJO, BACON E CALABRESA', price: 5500, category: 'PORÇÕES BATATA' },
      { name: 'BATATA 250GR COM BACON - QUEIJO - CALABRESA', price: 3000, category: 'PORÇÕES BATATA' },
      { name: 'BATATA 500GR - SIMPLES', price: 4500, category: 'PORÇÕES BATATA' },
      { name: 'BATATA 250GR - SIMPLES', price: 2500, category: 'PORÇÕES BATATA' },
      
      // SALSICHÃO
      { name: 'SALSICHÃO', price: 1000, category: 'SALSICHÃO' },
      
      // PORÇÕES DE CARNE
      { name: 'PORÇÃO CARNE PICANHA 350GR', price: 6500, category: 'PORÇÕES DE CARNE' },
      { name: 'PORÇÃO PICANHA 350GR + BATATA 250GR', price: 8500, category: 'PORÇÕES DE CARNE' },
      { name: 'PORÇÃO CARNE DE SOL 350GR', price: 6500, category: 'PORÇÕES DE CARNE' },
      { name: 'PORÇÃO CARNE DE SOL 350GR + AIPIM FRITO', price: 8500, category: 'PORÇÕES DE CARNE' },
      
      // CHAPA MISTA
      { name: 'CHAPA MISTA COMPLETA', price: 15000, category: 'CHAPA MISTA' },
      
      // CHOPP IPA
      { name: 'CHOPP RED IPA 300 ML', price: 1500, category: 'CHOPP IPA' },
      { name: 'COMBO 3x CHOPP RED IPA 300 ML', price: 4000, category: 'CHOPP IPA' },
      { name: 'CHOPP RED IPA 500 ML', price: 2000, category: 'CHOPP IPA' },
      { name: 'COMBO 3x CHOPP RED IPA 500 ML', price: 5500, category: 'CHOPP IPA' },
      
      // CHOPP DE VINHO
      { name: 'CHOPP DE VINHO 300 ML', price: 1500, category: 'CHOPP DE VINHO' },
      { name: 'COMBO 3x CHOPP DE VINHO 300 ML', price: 4000, category: 'CHOPP DE VINHO' },
      { name: 'CHOPP DE VINHO 500 ML', price: 2000, category: 'CHOPP DE VINHO' },
      { name: 'COMBO 3x CHOPP DE VINHO 500 ML', price: 5000, category: 'CHOPP DE VINHO' },
      
      // CHOPP PILSEN
      { name: 'CHOPP PILSEN 500 ML', price: 1500, category: 'CHOPP PILSEN' },
      { name: 'COMBO 3x CHOPP PILSEN 500 ML', price: 4000, category: 'CHOPP PILSEN' },

      // BEATS
      { name: 'BEATS', price: 1500, category: 'BEATS' }
    ],
    skipDuplicates: true
  })

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
