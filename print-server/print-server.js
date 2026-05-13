require('dotenv').config();
const { Pool } = require('pg');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
const printerInterface = process.env.PRINTER_INTERFACE || 'FestaPrinter';

console.log("--- CONFIGURAÇÃO OFFLINE (FIX FINAL) ---");

if (!databaseUrl) {
  console.error("ERRO: DATABASE_URL não encontrada.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

let printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: 'buffer',
  characterSet: process.env.PRINTER_CHARACTER_SET || 'PC858_EURO',
  removeSpecialCharacters: false,
  lineCharacter: "=",
});

function formatCurrency(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

async function sendToWindowsPrinter(buffer) {
  return new Promise((resolve) => {
    const tempFile = path.join(__dirname, 'temp_print.bin');
    fs.writeFileSync(tempFile, buffer);
    const command = `copy /b "${tempFile}" "\\\\localhost\\${printerInterface}"`;
    exec(command, (error, stdout, stderr) => {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (error) {
        console.error("ERRO DE IMPRESSÃO:", stderr);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function printOrder(payload) {
  try {
    printer.clear();
    printer.alignCenter();
    printer.bold(true);
    printer.println("BARRACA DO JOAO");
    printer.bold(false);
    printer.println("FestaPDV - Comanda de Venda");
    printer.drawLine();
    printer.alignLeft();
    printer.println(`Pedido: ${payload.orderId.substring(0, 8).toUpperCase()}`);
    printer.println(`Data: ${new Date(payload.timestamp).toLocaleString('pt-BR')}`);
    printer.println(`Vendedor: ${payload.seller || 'Caixa'}`);
    printer.drawLine();
    
    for (const item of payload.items) {
      const qtd = String(item.quantity).padEnd(4, ' ');
      const nome = item.name.substring(0, 20).padEnd(21, ' ');
      const total = formatCurrency(item.totalPrice).padStart(9, ' ');
      printer.println(`${qtd} ${nome} ${total}`);
    }
    
    printer.drawLine();
    printer.alignRight();
    printer.bold(true);
    printer.println(`TOTAL: ${formatCurrency(payload.total)}`);
    printer.bold(false);
    printer.cut();
    
    for (const item of payload.items) {
      for (let i = 0; i < item.quantity; i++) {
        printer.alignCenter();
        printer.bold(true);
        printer.println("FICHA DE CONSUMO");
        printer.bold(false);
        printer.drawLine();
        printer.setTextSize(1, 1);
        printer.println(item.name);
        printer.setTextNormal();
        printer.drawLine();
        printer.println(`Pedido: ${payload.orderId.substring(0, 8).toUpperCase()}`);
        printer.cut();
      }
    }

    return await sendToWindowsPrinter(printer.getBuffer());
  } catch (error) {
    console.error("Erro no processamento:", error);
    return false;
  }
}

async function markPrintJobDone(id, status) {
  // Coluna "updatedAt" exige aspas duplas por causa da letra maiuscula
  await pool.query('UPDATE print_queue SET status = $1, "updatedAt" = NOW() WHERE id = $2', [status, id]);
}

async function checkPendingJobs() {
  try {
    // Tabela print_queue e coluna "createdAt" com aspas
    const res = await pool.query('SELECT * FROM print_queue WHERE status = \'PENDING\' ORDER BY "createdAt" ASC');
    const data = res.rows;

    if (data && data.length > 0) {
      console.log(`[Offline] Processando ${data.length} pedidos...`);
      for (const job of data) {
        await markPrintJobDone(job.id, 'PRINTING');
        const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
        const success = await printOrder(payload);
        await markPrintJobDone(job.id, success ? 'DONE' : 'ERROR');
      }
    }
  } catch (error) {
    console.error("Erro na busca do banco:", error.message);
  }
}

console.log('✅ Impressora Offline Pronta!');
setInterval(checkPendingJobs, 1000);
