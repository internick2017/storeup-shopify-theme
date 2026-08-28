import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const PRODUCT_ID = '8737067827358';

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

// Orden deseado por nombre de archivo (limpias primero, texto inglés atrás)
const ORDER = [
  'S1340eec44f034fb7a83d22237dd92a51l',   // 1 - glow limpio (PRINCIPAL)
  'S114d1e703cf7402cb362cd652b4929abc',   // 2 - dos lámparas colores (limpia)
  'Sfd0e23aeda7d4182ae4e67ceed2143d5c',   // 3 - infográfico specs
  'Sb3b8b06b2378420eb592faae116fb0f40',   // 4 - SUNSET composite (texto)
  'S91600cee70af4b30a893f000ac35f774l',   // 5 - colores swatches
];

const imgs = await api('GET', `/products/${PRODUCT_ID}/images.json`);
console.log('🖼️  Reordenando imágenes del producto...\n');

for (let i = 0; i < ORDER.length; i++) {
  const name = ORDER[i];
  const img = imgs.images.find(im => im.src.includes(name));
  if (!img) { console.log(`   ⚠️  No encontrada: ${name}`); continue; }
  const r = await api('PUT', `/products/${PRODUCT_ID}/images/${img.id}.json`, {
    image: { id: img.id, position: i + 1 }
  });
  if (r.image) console.log(`   ✅ pos ${i + 1}: ${name.substring(0, 20)}...`);
  else console.log(`   ❌ ${name}: ${JSON.stringify(r.errors)}`);
}

// Verificar
const after = await api('GET', `/products/${PRODUCT_ID}/images.json`);
console.log('\n📋 Orden final:');
after.images.sort((a,b)=>a.position-b.position).forEach(im => {
  console.log(`   pos ${im.position}: ${im.src.split('/').pop().split('?')[0]}`);
});
console.log('\n🎉 Imagen principal ahora: efecto sol limpio (sin texto inglés)');
