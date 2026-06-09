require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
require('dotenv').config(); // Carrega também o local se existir
const { createClient } = require('@supabase/supabase-js');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const printerInterface = process.env.PRINTER_INTERFACE || 'FestaPrinter';

console.log("--- CONFIGURAÇÃO CLOUD-FIRST (REALTIME) ---");

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_KEY não encontrados.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function sendToWindowsPrinter(buffer, targetPrinter) {
  return new Promise((resolve) => {
    const tempFile = path.join(__dirname, 'temp_print.bin');
    fs.writeFileSync(tempFile, buffer);
    const command = `copy /b "${tempFile}" "\\\\localhost\\${targetPrinter}"`;
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
    printer.println("Barraca do João - Comanda de Venda");
    printer.drawLine();
    printer.alignLeft();
    printer.println(`Pedido: ${payload.orderId.substring(0, 8).toUpperCase()}`);
    printer.println(`Data: ${new Date(payload.timestamp).toLocaleString('pt-BR')}`);
    printer.println(`Vendedor: ${payload.seller || 'Caixa'}`);
    if (payload.tableNumber) {
      printer.println(`Mesa: ${payload.tableNumber}`);
    }
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
        if (payload.tableNumber) {
          printer.println(`Mesa: ${payload.tableNumber}`);
        }
        printer.cut();
      }
    }

    // Salva uma cópia em texto para testes
    const txtContent = printer.getText();
    fs.writeFileSync(path.join(__dirname, '../CUPOM_ULTIMA_VENDA.txt'), txtContent);

    // Lógica de Roteamento Inteligente
    const defaultPrinter = process.env.PRINTER_INTERFACE || 'FestaPrinter';
    let targetPrinter = defaultPrinter;
    
    if (payload.seller && payload.seller.toLowerCase().includes('caixa')) {
      targetPrinter = process.env.PRINTER_CAIXA || defaultPrinter;
      console.log(`[Roteamento] Venda do Caixa. Destino: ${targetPrinter}`);
    } else {
      targetPrinter = process.env.PRINTER_GARCOM || defaultPrinter;
      console.log(`[Roteamento] Venda de Garçom. Destino: ${targetPrinter}`);
    }

    return await sendToWindowsPrinter(printer.getBuffer(), targetPrinter);
  } catch (error) {
    console.error("Erro no processamento:", error);
    return false;
  }
}

async function markPrintJobDone(id, status) {
  const { error } = await supabase
    .from('print_queue')
    .update({ status: status })
    .eq('id', id);

  if (error) {
    console.error(`Erro ao atualizar status do job ${id}:`, error.message);
  }
}

async function processJob(job) {
  try {
    await markPrintJobDone(job.id, 'PRINTING');
    const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
    const success = await printOrder(payload);
    await markPrintJobDone(job.id, success ? 'DONE' : 'ERROR');
    if (!success) console.warn(`[Aviso] Pedido ${job.id} marcado como ERRO (provavelmente sem impressora)`);
  } catch (jobError) {
    console.error(`Erro ao processar job ${job.id}:`, jobError.message);
    try {
      await markPrintJobDone(job.id, 'ERROR');
    } catch (e) {
      console.error("Falha Crítica: Não conseguiu marcar como ERRO no banco.");
    }
  }
}

async function startRealtimeListener() {
  console.log('Verificando pendências antigas...');
  const { data, error } = await supabase
    .from('print_queue')
    .select('*')
    .eq('status', 'PENDING')
    .order('createdAt', { ascending: true });

  if (!error && data && data.length > 0) {
    console.log(`Encontrados ${data.length} pedidos pendentes antigos.`);
    for (const job of data) {
      await processJob(job);
    }
  }

  console.log('✅ Impressora Cloud Pronta! Aguardando novos pedidos...');
  
  supabase
    .channel('print_queue_changes')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'print_queue',
      filter: "status=eq.PENDING" 
    }, (payload) => {
      console.log('Novo pedido recebido via Realtime!', payload.new.id);
      processJob(payload.new);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Conectado ao Realtime!');
      } else {
        console.log('Status Realtime:', status);
      }
    });
}

startRealtimeListener();
