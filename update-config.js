const fs = require('fs');
const os = require('os');
const path = require('path');

function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = ['localhost', '127.0.0.1'];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

const configPath = path.join(__dirname, 'next.config.ts');
let content = fs.readFileSync(configPath, 'utf8');

const ips = getLocalIPs();
console.log('Detectados IPs Locais:', ips);

const ipsString = ips.map(ip => `'${ip}'`).join(', ');

// Substitui a linha do allowedDevOrigins dinamicamente
const regex = /allowedDevOrigins: \[[\s\S]*?\],/;
const newContent = content.replace(regex, `allowedDevOrigins: [${ipsString}],`);

fs.writeFileSync(configPath, newContent);
console.log('Configuracao de seguranca atualizada com sucesso!');
