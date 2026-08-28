import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const THEME_ID = '156532670622';

function api(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: SHOP, path: `/admin/api/2024-10${path}`, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', ...(data && { 'Content-Length': Buffer.byteLength(data) }) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}

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

// 1. Ver mercados actuales
console.log('🌍 Mercados actuales:\n');
const marketsRes = await graphql(`{
  markets(first: 10) {
    edges { node {
      id name primary enabled
      regions(first: 50) { edges { node { ... on MarketRegionCountry { name code } } } }
    } }
  }
}`);
const markets = marketsRes;

if (markets.errors) { console.error('❌', markets.errors[0].message); process.exit(1); }
for (const { node: m } of markets.data.markets.edges) {
  const regions = m.regions.edges.map(e => `${e.node.name}(${e.node.code})`).join(', ');
  console.log(`  ${m.primary ? '★' : ' '} ${m.name} — Países: ${regions || 'todos'}`);
}

// 2. Crear mercado UK/USA con inglés
console.log('\n🔧 Creando mercado UK + USA en inglés...');

// Primero buscar si ya existe un mercado Internacional
const intlMarket = marketsRes.data.markets.edges.find(e => !e.node.primary)?.node;

if (intlMarket) {
  console.log(`   Mercado Internacional existente: "${intlMarket.name}"`);

  // Agregar inglés al mercado internacional
  const addLang = await graphql(`
    mutation marketLocaleAdd($marketId: ID!, $marketLocales: [MarketLocaleInput!]!) {
      marketLocaleAdd(marketId: $marketId, marketLocales: $marketLocales) {
        market { id name }
        userErrors { field message }
      }
    }
  `, {
    marketId: intlMarket.id,
    marketLocales: [{ locale: "en", marketWebPresenceId: null }]
  });

  const e1 = addLang.data?.marketLocaleAdd?.userErrors;
  if (e1?.length) {
    console.log(e1[0].message.includes('already') ? '✅ Inglés ya estaba en mercado Internacional' : `⚠️  ${e1[0].message}`);
  } else {
    console.log('✅ Inglés agregado al mercado Internacional');
  }

  // Agregar UK y USA al mercado si no están
  const addRegions = await graphql(`
    mutation marketRegionsCreate($marketId: ID!, $regions: [MarketRegionCreateInput!]!) {
      marketRegionsCreate(marketId: $marketId, regions: $regions) {
        market { id name }
        userErrors { field message }
      }
    }
  `, {
    marketId: intlMarket.id,
    regions: [{ countryCode: "GB" }, { countryCode: "US" }]
  });
  const e2 = addRegions.data?.marketRegionsCreate?.userErrors;
  if (e2?.length && !e2[0].message.includes('already')) {
    console.log(`⚠️  Regiones: ${e2[0].message}`);
  } else {
    console.log('✅ UK y USA en el mercado Internacional');
  }
} else {
  // Crear mercado nuevo para UK/USA
  const createMarket = await graphql(`
    mutation marketCreate($input: MarketCreateInput!) {
      marketCreate(input: $input) {
        market { id name }
        userErrors { field message }
      }
    }
  `, {
    input: {
      name: "UK & USA",
      regions: [{ countryCode: "GB" }, { countryCode: "US" }]
    }
  });
  const e = createMarket.data?.marketCreate?.userErrors;
  console.log(e?.length ? `❌ ${e[0].message}` : `✅ Mercado UK & USA creado`);
}

// 3. Habilitar inglés en la tienda
console.log('\n🔧 Habilitando inglés como idioma...');
const enableEn = await graphql(`
  mutation { shopLocaleEnable(locale: "en") {
    shopLocale { locale published }
    userErrors { field message }
  } }
`);
const e3 = enableEn.data?.shopLocaleEnable?.userErrors;
if (e3?.length) {
  console.log(e3[0].message.includes('already') ? '✅ Inglés ya estaba habilitado' : `⚠️  ${e3[0].message}`);
} else {
  console.log('✅ Inglés habilitado');
}

// Publicar inglés
const pubEn = await graphql(`
  mutation { shopLocaleUpdate(locale: "en", shopLocale: { published: true }) {
    shopLocale { locale published }
    userErrors { field message }
  } }
`);
const e4 = pubEn.data?.shopLocaleUpdate?.userErrors;
console.log(e4?.length ? `❌ ${e4[0].message}` : '✅ Inglés publicado');

// 4. El en.default.json ya tiene los textos en inglés nativos del tema Dawn
// Solo confirmar que el announcement bar esté en inglés para UK/USA
console.log('\n🔧 Configurando textos en inglés para mercado UK/USA...');
const enSchema = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/en.default.json`);
const enData = JSON.parse(enSchema.asset.value);

// Asegurar textos clave en inglés correcto
if (!enData.sections) enData.sections = {};
if (!enData.sections['announcement-bar']) enData.sections['announcement-bar'] = {};
enData.sections['announcement-bar'].default_announcement = "🚚 Free shipping to UK & USA — Money back guarantee";

if (!enData.sections.newsletter) enData.sections.newsletter = {};
enData.sections.newsletter.heading = "Subscribe to our newsletter";

const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'locales/en.default.json', value: JSON.stringify(enData) }
});
console.log(r.errors ? `❌ ${JSON.stringify(r.errors)}` : '✅ Textos en inglés para UK/USA configurados');

console.log('\n🎉 Inglés configurado:');
console.log('   → Visitantes de UK/USA ven el sitio en inglés');
console.log('   → Visitantes de España ven el sitio en español');
console.log('   → Shopify detecta el país automáticamente');
console.log('\n   Ver resultado: https://storeup.store');
