require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

  try {
    console.log("Tentando habilitar Realtime...");
    await pool.query(`ALTER PUBLICATION supabase_realtime ADD TABLE print_queue;`);
    console.log("✅ Realtime habilitado com sucesso!");
  } catch (error) {
    console.log("Aviso/Erro:", error.message);
  } finally {
    await pool.end();
  }
}

main();
