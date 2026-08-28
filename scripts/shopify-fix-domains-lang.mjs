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

// Buscar TODOS los web presences
console.log('🔍 Buscando web presences...\n');
const wp = await graphql(`{
  markets(first: 20) {
    edges { node {
      id name primary
      webPresences(first: 5) {
        edges { node {
          id
          rootUrls { url locale }
          defaultLocale { locale }
          alternateLocales { locale }
          domain { host }
        } }
      }
    } }
  }
}`);

if (wp.errors) { console.error('❌', JSON.stringify(wp.errors, null, 2)); process.exit(1); }

const webPresences = [];
for (const { node: m } of wp.data.markets.edges) {
  console.log(`🌍 ${m.name} ${m.primary ? '(PRIMARIO)' : ''}`);
  for (const { node: w } of m.webPresences?.edges || []) {
    console.log(`   WebPresence ID: ${w.id}`);
    console.log(`   Dominio: ${w.domain?.host || '(subfolder)'}`);
    console.log(`   Default locale: ${w.defaultLocale?.locale}`);
    console.log(`   Alternos: ${w.alternateLocales?.map(l => l.locale).join(', ') || '(ninguno)'}`);
    console.log(`   Root URLs: ${w.rootUrls?.map(r => `${r.locale}→${r.url}`).join(' | ')}`);
    webPresences.push({ market: m.name, primary: m.primary, ...w });
  }
  if (!m.webPresences?.edges?.length) console.log(`   (sin web presence propio)`);
  console.log('');
}

// Para el web presence que tiene el dominio storeup.store (o el primario),
// agregar todos los idiomas como alternos
const target = webPresences.find(w => w.domain?.host?.includes('storeup')) || webPresences.find(w => w.primary) || webPresences[0];

if (!target) {
  console.log('⚠️  No se encontró web presence para actualizar.');
  process.exit(0);
}

console.log(`\n🎯 Web presence objetivo: ${target.market} (${target.domain?.host || 'subfolder'})`);
console.log(`   Agregando es, en, pt-BR como idiomas alternos...`);

const update = await graphql(`
  mutation webPresenceUpdate($id: ID!, $input: WebPresenceUpdateInput!) {
    webPresenceUpdate(webPresenceId: $id, webPresence: $input) {
      webPresence { id defaultLocale { locale } alternateLocales { locale } }
      userErrors { field message }
    }
  }
`, {
  id: target.id,
  input: { alternateLocales: ["en", "pt-BR"] }
});

if (update.errors) {
  console.log('❌ Error:', JSON.stringify(update.errors, null, 2));
} else if (update.data?.webPresenceUpdate?.userErrors?.length) {
  console.log('⚠️ ', JSON.stringify(update.data.webPresenceUpdate.userErrors, null, 2));
} else {
  const w = update.data.webPresenceUpdate.webPresence;
  console.log(`✅ Actualizado. Default: ${w.defaultLocale?.locale}, Alternos: ${w.alternateLocales?.map(l=>l.locale).join(', ')}`);
}
