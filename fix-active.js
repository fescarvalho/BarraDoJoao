require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function fixActive() {
  const result = await prisma.product.updateMany({
    where: {
      name: 'CHAPA MISTA COMPLETA'
    },
    data: {
      active: true
    }
  })
  console.log(`Updated ${result.count} products to active: true`)
}

fixActive()
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
