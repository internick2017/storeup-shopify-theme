import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('f:\\tmp\\shopify.env', 'utf8').split('\n').filter(Boolean).map(l => l.split('=')));
const r = await fetch(`https://${env.SHOPIFY_SHOP}/admin/api/2024-10/products.json?fields=id,handle,title&limit=50`, {
  headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN },
});
const { products } = await r.json();
console.log(products.length, 'products');
for (const p of products) {
  const res = await fetch(`https://storeup.store/pt/products/${p.handle}`, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`${p.id} ${p.handle} -> ${res.status} ${res.headers.get('location') || ''}`);
}
