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

// Buscar en TODOS los assets del tema
console.log('🔍 Escaneando TODOS los archivos del tema...\n');
const allAssets = await api('GET', `/themes/${THEME_ID}/assets.json`);

const suspects = [];
for (const asset of allAssets.assets) {
  // Solo archivos de texto relevantes
  if (!asset.key.match(/\.(json|liquid|js|css)$/)) continue;
  if (asset.key.includes('locales/') && !asset.key.includes('en') && !asset.key.includes('pt') && !asset.key.includes('es')) continue;

  const r = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=${asset.key}`);
  const content = r.asset?.value || '';

  const hasWelcome = content.toLowerCase().includes('welcome to our') || content.toLowerCase().includes('welcome to the');
  const hasSubscribe = content.toLowerCase().includes('subscribe to our email');

  if (hasWelcome || hasSubscribe) {
    suspects.push({ key: asset.key, hasWelcome, hasSubscribe, content });
    console.log(`🚨 ENCONTRADO en: ${asset.key}`);
    if (hasWelcome) {
      const idx = content.toLowerCase().indexOf('welcome to our');
      console.log(`   "Welcome": ...${content.substring(Math.max(0,idx-30), idx+60)}...`);
    }
    if (hasSubscribe) {
      const idx = content.toLowerCase().indexOf('subscribe to our email');
      console.log(`   "Subscribe": ...${content.substring(Math.max(0,idx-30), idx+70)}...`);
    }
    console.log('');
  }
}

if (suspects.length === 0) {
  console.log('✅ No se encontró "Welcome to our store" ni "Subscribe to our emails" en ningún archivo del tema.');
  console.log('\n💡 El texto viene del idioma del SISTEMA de Shopify (no del tema).');
  console.log('   Solución: cambiar el idioma por defecto a Español en Settings → Languages');
  console.log('   Clic en ··· junto a "Espanhol" → "Definir como padrão"');
} else {
  console.log(`\n📁 Archivos con textos en inglés: ${suspects.length}`);
  // Arreglar automáticamente
  for (const s of suspects) {
    let fixed = s.content
      .replace(/Welcome to our store/gi, '🚚 Envío gratuito a toda España')
      .replace(/Welcome to the store/gi, '🚚 Envío gratuito a toda España')
      .replace(/Subscribe to our emails/gi, 'Suscríbete a nuestro boletín')
      .replace(/Subscribe to our email/gi, 'Suscríbete a nuestro boletín');

    const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
      asset: { key: s.key, value: fixed }
    });
    console.log(r.errors ? `❌ ${s.key}: ${JSON.stringify(r.errors)}` : `✅ Arreglado: ${s.key}`);
  }
}
