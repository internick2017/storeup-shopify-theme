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

// Verificar el catch-all: ¿el mercado primario cubre "resto del mundo"?
console.log('🔍 Verificando comportamiento catch-all del mercado primario...\n');
const check = await graphql(`{
  markets(first: 10) {
    edges { node {
      id name primary
      catalog { ... on MarketCatalog { id } }
    } }
  }
}`);
if (check.errors) console.log('(catalog no disponible:', check.errors[0].message, ')\n');

// Intentar crear mercado España (API 2025-01)
console.log('🔧 Intentando crear mercado "España" con ES...');
const create = await graphql(`
  mutation createMarket($input: MarketCreateInput!) {
    marketCreate(input: $input) {
      market { id name handle }
      userErrors { field message }
    }
  }
`, {
  input: {
    name: "España",
    handle: "es",
    enabled: true,
    regionsToAdd: ["ES"]
  }
});

if (create.errors?.length) {
  console.log(`❌ ${create.errors[0].message}`);
  // Probar estructura alterna (regions en vez de regionsToAdd)
  console.log('\n🔧 Probando estructura alterna...');
  const c2 = await graphql(`
    mutation createMarket($input: MarketCreateInput!) {
      marketCreate(input: $input) {
        market { id name }
        userErrors { field message }
      }
    }
  `, { input: { name: "España", regions: [{ countryCode: "ES" }] } });
  if (c2.errors?.length) console.log(`❌ alterna: ${c2.errors[0].message}`);
  else if (c2.data?.marketCreate?.userErrors?.length) console.log(`⚠️  ${c2.data.marketCreate.userErrors[0].message}`);
  else console.log(`✅ Mercado España creado: ${c2.data.marketCreate.market.name}`);
} else if (create.data?.marketCreate?.userErrors?.length) {
  console.log(`⚠️  ${create.data.marketCreate.userErrors[0].message}`);
} else {
  console.log(`✅ Mercado España creado: ${create.data.marketCreate.market.name}`);
}
