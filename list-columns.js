require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'print_queue'
    `);
    console.log("Colunas da tabela print_queue:");
    res.rows.forEach(row => console.log("- " + row.column_name));
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await pool.end();
  }
}

main();
