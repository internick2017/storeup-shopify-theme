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
      hostname: SHOP, path: '/admin/api/2024-10/graphql.json', method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

const res = await graphql(`{
  markets(first: 10) {
    edges { node {
      id name primary enabled
      regions(first: 50) { edges { node { ... on MarketRegionCountry { name code } } } }
      webPresence {
        id
        defaultLocale { locale name }
        alternateLocales { locale name }
        domain { host }
      }
    } }
  }
}`);

if (res.errors) { console.error('❌', JSON.stringify(res.errors, null, 2)); process.exit(1); }

for (const { node: m } of res.data.markets.edges) {
  console.log(`\n🌍 Mercado: ${m.name} ${m.primary ? '(PRIMARIO)' : ''} — ${m.enabled ? 'activo' : 'inactivo'}`);
  const regions = m.regions.edges.map(e => e.node.code).join(', ');
  console.log(`   Países: ${regions}`);
  if (m.webPresence) {
    console.log(`   Dominio: ${m.webPresence.domain?.host || '(default)'}`);
    console.log(`   Idioma default: ${m.webPresence.defaultLocale?.locale}`);
    const alts = m.webPresence.alternateLocales?.map(l => l.locale).join(', ') || '(ninguno)';
    console.log(`   Idiomas alternos: ${alts}`);
  } else {
    console.log(`   ⚠️ Sin webPresence`);
  }
}
