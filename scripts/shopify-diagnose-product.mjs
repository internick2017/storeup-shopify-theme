import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const PRODUCT_ID = '8737067827358';

function api(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOP, path: `/admin/api/2024-10${path}`, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.end();
  });
}

// Variantes e inventario
console.log('📦 VARIANTES:');
const p = await api('GET', `/products/${PRODUCT_ID}.json`);
for (const v of p.product.variants) {
  console.log(`\n   ${v.title} (id ${v.id})`);
  console.log(`      precio: €${v.price} | inventory_management: ${v.inventory_management} | policy: ${v.inventory_policy}`);
  console.log(`      inventory_quantity: ${v.inventory_quantity} | inventory_item_id: ${v.inventory_item_id}`);
}

// Imágenes
console.log('\n\n🖼️  IMÁGENES (orden actual):');
const imgs = await api('GET', `/products/${PRODUCT_ID}/images.json`);
for (const img of imgs.images) {
  console.log(`   pos ${img.position}: ${img.src.split('/').pop().split('?')[0]} — "${img.alt?.substring(0,40)}"`);
}
