import { readFileSync, writeFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);

const THEME_ID = 156532670622;
const ASSET_KEY = 'locales/pt-BR.json';
const BASE = `https://${env.SHOPIFY_SHOP}/admin/api/2024-10`;
const HEADERS = { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN };

const FIXES = {
  'general.close': 'Fechar',
  'accessibility.close': 'Fechar',
  'accessibility.cart_icon': 'Carrinho',
  'products.product.add_to_cart': 'Adicionar ao carrinho',
  'products.product.quantity.label': 'Quantidade',
  'products.product.quantity.increase': 'Aumentar quantidade',
  'products.product.quantity.decrease': 'Diminuir quantidade',
  'products.product.sold_out': 'Esgotado',
  'templates.search.title': 'Busca',
  'templates.cart.title': 'Carrinho',
  'templates.cart.empty': 'Seu carrinho está vazio',
  'sections.newsletter.header.heading': 'Assine nossa newsletter',
};

// 1. GET current asset
const getRes = await fetch(`${BASE}/themes/${THEME_ID}/assets.json?asset[key]=${encodeURIComponent(ASSET_KEY)}`, { headers: HEADERS });
const getJson = await getRes.json();
if (!getJson.asset) {
  console.error('FALLO GET asset:', JSON.stringify(getJson).slice(0, 300));
  process.exit(1);
}

// 2. Backup original
writeFileSync('f:\\tmp\\pt-BR.json.bak', getJson.asset.value, 'utf8');
console.log(`Backup guardado: f:\\tmp\\pt-BR.json.bak (${getJson.asset.value.length} bytes)`);

// 3. Patch the 12 keys
const parsed = JSON.parse(getJson.asset.value);

function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  const old = cur[last];
  cur[last] = value;
  return old;
}

for (const [path, value] of Object.entries(FIXES)) {
  const old = setPath(parsed, path, value);
  console.log(`  ${path}: ${JSON.stringify(old)} -> ${JSON.stringify(value)}`);
}

// 4. PUT it back
const putRes = await fetch(`${BASE}/themes/${THEME_ID}/assets.json`, {
  method: 'PUT',
  headers: { ...HEADERS, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    asset: { key: ASSET_KEY, value: JSON.stringify(parsed, null, 2) },
  }),
});
console.log(`\nPUT status: ${putRes.status}`);
const putJson = await putRes.json();
if (putRes.status !== 200) {
  console.error('FALLO PUT:', JSON.stringify(putJson).slice(0, 500));
  process.exit(1);
}
console.log(`OK — asset actualizado: ${putJson.asset.key}, updated_at=${putJson.asset.updated_at}`);

// 5. Re-GET and verify the 12 keys
const verRes = await fetch(`${BASE}/themes/${THEME_ID}/assets.json?asset[key]=${encodeURIComponent(ASSET_KEY)}`, { headers: HEADERS });
const verParsed = JSON.parse((await verRes.json()).asset.value);
let ok = 0, bad = 0;
for (const [path, value] of Object.entries(FIXES)) {
  const got = path.split('.').reduce((o, k) => (o == null ? o : o[k]), verParsed);
  if (got === value) ok++;
  else { bad++; console.error(`  MISMATCH ${path}: ${JSON.stringify(got)}`); }
}
console.log(`\nVerificación: ${ok}/12 OK, ${bad} mal`);
process.exit(bad ? 1 : 0);
