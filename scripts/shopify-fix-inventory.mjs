import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const PRODUCT_ID = '8737067827358';

function graphql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const options = {
      hostname: SHOP, path: '/admin/api/2025-01/graphql.json', method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

const productGid = `gid://shopify/Product/${PRODUCT_ID}`;

// Estado real
console.log('🔍 Estado real (GraphQL):');
const q = await graphql(`{
  product(id: "${productGid}") {
    status
    variants(first: 10) {
      edges { node {
        id title availableForSale
        inventoryPolicy
        inventoryQuantity
        inventoryItem { id tracked }
      } }
    }
  }
}`);

console.log(`   Producto status: ${q.data.product.status}`);
const variants = q.data.product.variants.edges;
for (const { node: v } of variants) {
  console.log(`   ${v.title}: forSale=${v.availableForSale} policy=${v.inventoryPolicy} tracked=${v.inventoryItem.tracked} qty=${v.inventoryQuantity}`);
}

// FIX: poner tracked=false en cada inventory item → siempre disponible (dropshipping)
console.log('\n🔧 Desactivando rastreo de inventario (tracked=false) en todas las variantes...');
for (const { node: v } of variants) {
  const r = await graphql(`
    mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem { id tracked }
        userErrors { field message }
      }
    }
  `, { id: v.inventoryItem.id, input: { tracked: false } });
  const e = r.data?.inventoryItemUpdate?.userErrors;
  console.log(e?.length ? `   ❌ ${v.title}: ${e[0].message}` : `   ✅ ${v.title}: tracked=false (siempre disponible)`);
}

// Verificar
console.log('\n🔍 Verificación final:');
const q2 = await graphql(`{
  product(id: "${productGid}") {
    variants(first: 10) { edges { node { title availableForSale inventoryItem { tracked } } } }
  }
}`);
for (const { node: v } of q2.data.product.variants.edges) {
  console.log(`   ${v.title}: forSale=${v.availableForSale} tracked=${v.inventoryItem.tracked}`);
}
