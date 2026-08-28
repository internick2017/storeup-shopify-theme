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
      hostname: SHOP,
      path: '/admin/api/2024-10/graphql.json',
      method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

// Ver mercados actuales
const res = await graphql(`{
  markets(first: 10) {
    edges { node {
      id name primary enabled
      regions { edges { node { ... on MarketRegionCountry { code name currency { isoCode } } } } }
    } }
  }
}`);

console.log('Mercados actuales:');
for (const { node: m } of res.data.markets.edges) {
  console.log(`  ${m.primary ? '★' : ' '} ${m.name} — ${m.enabled ? 'activo' : 'inactivo'}`);
  for (const { node: r } of m.regions.edges) {
    console.log(`      ${r.name} (${r.code}) — moneda: ${r.currency?.isoCode}`);
  }
}

// Encontrar mercado primario y actualizar a España/EUR
const primaryMarket = res.data.markets.edges.find(e => e.node.primary)?.node;
console.log(`\nMercado primario: ${primaryMarket?.name}`);

// Actualizar mercado primario a España
console.log('\n🔧 Actualizando mercado primario a España (EUR)...');

const update = await graphql(`
  mutation marketUpdate($id: ID!, $input: MarketUpdateInput!) {
    marketUpdate(id: $id, input: $input) {
      market { id name }
      userErrors { field message }
    }
  }
`, {
  id: primaryMarket.id,
  input: { name: "España", enabled: true }
});

if (update.data?.marketUpdate?.userErrors?.length) {
  console.log('UserErrors:', JSON.stringify(update.data.marketUpdate.userErrors));
} else {
  console.log('✅ Mercado primario actualizado a España');
}

// Agregar España como región si no está
const addRegion = await graphql(`
  mutation marketRegionsCreate($marketId: ID!, $regions: [MarketRegionCreateInput!]!) {
    marketRegionsCreate(marketId: $marketId, regions: $regions) {
      market { id name }
      userErrors { field message }
    }
  }
`, {
  marketId: primaryMarket.id,
  regions: [{ countryCode: "ES" }]
});

if (addRegion.data?.marketRegionsCreate?.userErrors?.length) {
  const errs = addRegion.data.marketRegionsCreate.userErrors;
  if (errs[0].message.includes('already')) {
    console.log('✅ España ya estaba como región del mercado primario');
  } else {
    console.log('⚠️ ', errs[0].message);
  }
} else {
  console.log('✅ España agregada al mercado primario');
}

console.log('\n⚠️  Para cambiar la moneda de BRL a EUR:');
console.log('   Shopify solo permite cambiar la moneda base desde:');
console.log('   Settings → General → Store currency');
console.log('   URL directa: https://admin.shopify.com/store/yxx05u-wr/settings/general');
console.log('   Buscá "Store currency" y cambiala a EUR (€ Euro)');
