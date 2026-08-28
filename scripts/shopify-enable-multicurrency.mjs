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

// Obtener mercados
const markets = await graphql(`{ markets(first: 10) { edges { node { id name primary } } } }`);
console.log('Mercados:', markets.data.markets.edges.map(e => e.node.name).join(', '));

// Intentar activar moneda local en cada mercado no primario
for (const { node: m } of markets.data.markets.edges) {
  if (m.primary) continue;
  console.log(`\n🔧 Activando moneda local para "${m.name}"...`);
  const r = await graphql(`
    mutation enableLocal($marketId: ID!) {
      marketCurrencySettingsUpdate(marketId: $marketId, input: { localCurrencies: true }) {
        market { id name currencySettings { localCurrencies } }
        userErrors { field message }
      }
    }
  `, { marketId: m.id });

  if (r.errors?.length) {
    console.log(`   ❌ ${r.errors[0].message}`);
  } else {
    const e = r.data?.marketCurrencySettingsUpdate?.userErrors;
    if (e?.length) console.log(`   ⚠️  ${e[0].message}`);
    else console.log(`   ✅ Moneda local activada para ${m.name}`);
  }
}

// Verificar monedas de presentación finales
const shop = await graphql(`{ shop { currencyCode enabledPresentmentCurrencies } }`);
console.log(`\n💱 Monedas activas finales: ${shop.data.shop.enabledPresentmentCurrencies?.join(', ')}`);
