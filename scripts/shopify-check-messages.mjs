import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function graphql(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
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

// Probar varias formas de acceder a mensajes/conversaciones
const tries = [
  { name: 'conversations', q: `{ conversations(first: 5) { edges { node { id } } } }` },
  { name: 'customers (recientes)', q: `{ customers(first: 5, sortKey: CREATED_AT, reverse: true) { edges { node { displayName email createdAt } } } }` },
  { name: 'orders (recientes)', q: `{ orders(first: 5, sortKey: CREATED_AT, reverse: true) { edges { node { name email createdAt totalPriceSet { shopMoney { amount currencyCode } } } } } }` },
];

for (const t of tries) {
  const r = await graphql(t.q);
  if (r.errors) {
    console.log(`❌ ${t.name}: ${r.errors[0].message}`);
  } else {
    const data = r.data;
    const key = Object.keys(data)[0];
    const edges = data[key]?.edges || [];
    console.log(`✅ ${t.name}: ${edges.length} resultados`);
    edges.forEach(e => console.log(`   ${JSON.stringify(e.node)}`));
  }
  console.log('');
}
