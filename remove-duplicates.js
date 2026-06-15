require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function fixDuplicates() {
  const allProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' }
  })
  
  const seen = new Set()
  const idsToDelete = []

  for (const p of allProducts) {
    if (seen.has(p.name)) {
      idsToDelete.push(p.id)
    } else {
      seen.add(p.name)
    }
  }

  if (idsToDelete.length > 0) {
    console.log(`Encontrados ${idsToDelete.length} produtos duplicados. A apagar...`)
    const result = await prisma.product.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    })
    console.log(`Apagados ${result.count} produtos duplicados.`)
  } else {
    console.log('Nenhum produto duplicado encontrado.')
  }
}

fixDuplicates()
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
