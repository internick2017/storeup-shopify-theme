import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

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

const markets = await graphql(`{
  markets(first: 20) {
    edges { node {
      id name primary enabled handle
      regions(first: 250) { edges { node { ... on MarketRegionCountry { name code } } } }
    } }
  }
}`);

console.log('🌍 TODOS LOS MERCADOS Y SUS PAÍSES:\n');
let spainFound = null;
for (const { node: m } of markets.data.markets.edges) {
  const countries = m.regions.edges.map(e => e.node.code);
  console.log(`${m.primary ? '★ PRIMARIO' : '          '} "${m.name}" (handle: ${m.handle}) — ${m.enabled ? 'activo' : 'INACTIVO'}`);
  console.log(`   Países (${countries.length}): ${countries.join(', ')}`);

  // ¿Es un catch-all? (rest of world)
  if (countries.length > 50) console.log(`   ℹ️  Este parece ser el mercado "resto del mundo" (catch-all)`);
  if (countries.includes('ES')) { spainFound = m.name; console.log(`   🇪🇸 ¡ESPAÑA ESTÁ AQUÍ!`); }
  console.log('');
}

console.log('═══════════════════════════════');
if (spainFound) {
  console.log(`✅ España está en el mercado: "${spainFound}"`);
} else {
  console.log(`❌ España NO está en ningún mercado explícito.`);
  console.log(`   → Probablemente cae en el mercado "resto del mundo" (catch-all/primario).`);
}
