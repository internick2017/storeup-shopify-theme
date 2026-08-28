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

// 1. IDIOMA
console.log('📍 IDIOMAS:');
const locales = await graphql(`{ shopLocales { locale name primary published } }`);
locales.data.shopLocales.forEach(l => {
  console.log(`   ${l.primary ? '★ PRIMARIO' : '  secundario'}: ${l.name} (${l.locale})`);
});

// 2. MONEDA
console.log('\n📍 MONEDA DE LA TIENDA:');
const shop = await graphql(`{ shop { currencyCode currencyFormats { moneyFormat } } }`);
console.log(`   ${shop.data.shop.currencyCode}`);

// 3. ZONAS DE ENVÍO
console.log('\n📍 ZONAS DE ENVÍO:');
const profiles = await graphql(`{
  deliveryProfiles(first: 1) {
    edges { node {
      id
      profileLocationGroups {
        locationGroup { id }
        locationGroupZones(first: 20) {
          edges { node {
            zone { id name countries { code { countryCode } } }
            methodDefinitions(first: 10) {
              edges { node {
                id name active
                rateProvider {
                  ... on DeliveryRateDefinition { price { amount currencyCode } }
                }
              } }
            }
          } }
        }
      }
    } }
  }
}`);

const profile = profiles.data.deliveryProfiles.edges[0].node;
let brazilFound = false;
for (const lg of profile.profileLocationGroups) {
  for (const { node } of lg.locationGroupZones.edges) {
    const countries = node.zone.countries.map(c => c.code.countryCode);
    if (countries.includes('BR')) brazilFound = true;
    console.log(`\n   🌍 Zona "${node.zone.name}" (${countries.length} países): ${countries.slice(0,8).join(', ')}${countries.length > 8 ? '...' : ''}`);
    for (const { node: m } of node.methodDefinitions.edges) {
      const price = m.rateProvider?.price;
      const priceStr = price ? `${price.amount} ${price.currencyCode}` : 'calculado';
      const warn = price?.currencyCode === 'BRL' ? ' ⚠️ EN BRL!' : '';
      console.log(`      • ${m.name}: ${priceStr}${warn}`);
    }
  }
}

console.log(`\n📍 ¿BRASIL EN ALGUNA ZONA? ${brazilFound ? '✅ Sí' : '❌ NO — falta agregarlo'}`);
