import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const BASE = `https://${env.SHOPIFY_SHOP}/admin/api/2024-10`;
const HDR = { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN };

const r = await fetch(`${BASE}/themes/156532670622/assets.json?asset[key]=sections/footer-group.json`, { headers: HDR });
const j = await r.json();
if (!j.asset) { console.log('No existe footer-group.json:', JSON.stringify(j).slice(0, 200)); process.exit(0); }
const data = JSON.parse(j.asset.value);
console.log(JSON.stringify(data, null, 2));
