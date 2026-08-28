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

// Ver mercados y sus monedas
console.log('💱 MERCADOS Y MONEDAS:\n');
const markets = await graphql(`{
  markets(first: 10) {
    edges { node {
      id name primary enabled handle
      currencySettings { baseCurrency { currencyCode } localCurrencies }
      regions(first: 50) { edges { node { ... on MarketRegionCountry { name code } } } }
    } }
  }
}`);

if (markets.errors) {
  console.log('⚠️  currencySettings no disponible, probando alterno...');
  const m2 = await graphql(`{ markets(first:10){ edges { node { id name primary enabled regions(first:50){edges{node{... on MarketRegionCountry{name code}}}} } } } }`);
  for (const { node: m } of m2.data.markets.edges) {
    const r = m.regions.edges.map(e => e.node.code).join(', ');
    console.log(`   ${m.primary ? '★' : ' '} ${m.name}: ${r}`);
  }
} else {
  for (const { node: m } of markets.data.markets.edges) {
    const r = m.regions.edges.map(e => e.node.code).join(', ');
    const base = m.currencySettings?.baseCurrency?.currencyCode;
    const locals = m.currencySettings?.localCurrencies;
    console.log(`   ${m.primary ? '★' : ' '} ${m.name}`);
    console.log(`      Países: ${r}`);
    console.log(`      Moneda base: ${base} | Monedas locales activas: ${locals}`);
  }
}

// Ver si Shopify Payments permite multi-currency
console.log('\n💳 SHOPIFY PAYMENTS / MULTI-MONEDA:');
const shop = await graphql(`{
  shop {
    currencyCode
    enabledPresentmentCurrencies
    paymentSettings { supportedDigitalWallets }
  }
}`);
console.log(`   Moneda tienda: ${shop.data?.shop?.currencyCode}`);
console.log(`   Monedas de presentación activas: ${shop.data?.shop?.enabledPresentmentCurrencies?.join(', ')}`);
