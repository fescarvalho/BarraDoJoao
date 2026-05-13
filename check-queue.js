require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT id, status, "createdAt" FROM print_queue');
    console.log(`Encontrados ${res.rows.length} itens na fila de impressao:`);
    res.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Status: ${row.status}, Criado em: ${row.createdAt}`);
    });
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await pool.end();
  }
}

main();
