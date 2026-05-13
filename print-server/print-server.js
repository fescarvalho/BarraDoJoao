require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const printerInterface = process.env.PRINTER_INTERFACE || 'FestaPrinter';

console.log("--- CONFIGURAÇÃO ---");
console.log("URL:", supabaseUrl);
console.log("Interface Impressora:", printerInterface);
console.log("--------------------");

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes("SUA_SERVICE_ROLE_KEY")) {
  console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados corretamente no print-server/.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        console.error("ERRO DE IMPRESSÃO (Certifique-se que a impressora está compartilhada):", stderr);
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
    printer.println(`Vendedor: ${payload.seller}`);
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

    const success = await sendToWindowsPrinter(printer.getBuffer());
    if (success) console.log(`Sucesso ao imprimir pedido ${payload.orderId}`);
    return success;
  } catch (error) {
    console.error("Erro no processamento da impressão:", error);
    return false;
  }
}

async function markPrintJobDone(id, status) {
  await supabase.from('print_queue').update({ status, updatedAt: new Date().toISOString() }).eq('id', id);
}

const channel = supabase.channel('print-jobs')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'print_queue' }, async (payload) => {
    console.log('--- NOVO PEDIDO RECEBIDO ---');
    await markPrintJobDone(payload.new.id, 'PRINTING');
    const success = await printOrder(payload.new.payload);
    await markPrintJobDone(payload.new.id, success ? 'DONE' : 'ERROR');
  })
  .subscribe((status, error) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Conectado ao Supabase! Aguardando novas vendas...');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Erro na conexão Realtime:', error);
    } else {
      console.log('Status da Conexão:', status);
    }
  });

// Keep process alive
setInterval(() => {}, 1000 * 60 * 60);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
