require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tabelas encontradas no banco:");
    res.rows.forEach(row => console.log("- " + row.table_name));
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await pool.end();
  }
}

main();
