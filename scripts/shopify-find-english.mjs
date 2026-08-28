import https from 'https';
import { readFileSync, writeFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const THEME_ID = '156532670622';

function api(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: SHOP, path: `/admin/api/2024-10${path}`, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', ...(data && { 'Content-Length': Buffer.byteLength(data) }) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}

// Buscar "Welcome" y "Subscribe" en todos los archivos clave
const filesToCheck = [
  'config/settings_data.json',
  'locales/en.default.json',
  'locales/pt-BR.json',
  'locales/es.json',
  'sections/announcement-bar.liquid',
  'sections/email-signup-banner.liquid',
  'sections/footer.liquid',
];

console.log('🔍 Buscando textos en inglés en todos los archivos...\n');

for (const key of filesToCheck) {
  const r = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=${key}`);
  const content = r.asset?.value || '';

  const hasWelcome = content.includes('Welcome to our store');
  const hasSubscribe = content.includes('Subscribe to our emails') || content.includes('Subscribe to our');

  if (hasWelcome || hasSubscribe) {
    console.log(`📄 ${key}:`);
    if (hasWelcome) {
      const idx = content.indexOf('Welcome to our store');
      console.log(`   ⚠️  "Welcome to our store" en posición ${idx}`);
      console.log(`   Contexto: ...${content.substring(Math.max(0,idx-50), idx+60)}...`);
    }
    if (hasSubscribe) {
      const idx = content.indexOf('Subscribe to our');
      console.log(`   ⚠️  "Subscribe to our..." en posición ${idx}`);
      console.log(`   Contexto: ...${content.substring(Math.max(0,idx-50), idx+70)}...`);
    }
    console.log('');
    // Guardar archivo para revisar
    writeFileSync(`f:\\tmp\\${key.replace('/', '_')}`, content);
  } else {
    console.log(`✅ ${key} — sin textos en inglés`);
  }
}
