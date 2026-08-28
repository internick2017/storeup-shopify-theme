import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function shopifyRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: SHOP,
      path: `/admin/api/2024-10${path}`,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
      },
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// 1. Ver zonas actuales
console.log('📦 Verificando zonas de envío actuales...\n');
const zones = await shopifyRequest('GET', '/shipping_zones.json');

if (zones.shipping_zones?.length) {
  console.log('Zonas encontradas:');
  zones.shipping_zones.forEach(z => {
    const countries = z.countries.map(c => `${c.name} (${c.code})`).join(', ');
    console.log(`  - ${z.name}: ${countries || 'sin países'}`);
  });
} else {
  console.log('No se encontraron zonas de envío configuradas.');
}

console.log('\n⚠️  Las zonas de envío en Shopify se gestionan desde Perfiles de Envío.');
console.log('   La API de zonas es de solo lectura para stores con planes básicos.');
console.log('\n📋 Para cambiar Brasil → España, hacelo manualmente en:');
console.log('   https://admin.shopify.com/store/yxx05u-wr/settings/shipping');
console.log('\n   Pasos:');
console.log('   1. Clic en el perfil "General"');
console.log('   2. Buscá la zona con Brasil');
console.log('   3. Editá → quitá Brasil → agregá España (y opcionalmente toda Europa)');
console.log('   4. Configurá envío gratis para España');
