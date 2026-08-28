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

const EN = { "Inicio": "Home", "Catálogo": "Catalog", "Catalogo": "Catalog" };
const PT = { "Inicio": "Início", "Catálogo": "Catálogo", "Catalogo": "Catálogo" };

console.log('🔍 Buscando recursos de menú/links traducibles...\n');

// Los items de menú son tipo LINK
for (const type of ['MENU', 'LINK']) {
  const res = await graphql(`{
    translatableResources(first: 50, resourceType: ${type}) {
      edges { node { resourceId translatableContent { key value digest } } }
    }
  }`);

  if (res.errors) { console.log(`⚠️  ${type}: ${res.errors[0].message}`); continue; }

  const resources = res.data.translatableResources.edges;
  console.log(`${type}: ${resources.length} recursos`);

  for (const { node } of resources) {
    const enTrans = [];
    const ptTrans = [];
    for (const c of node.translatableContent) {
      if (!c.value) continue;
      console.log(`   • ${c.key}: "${c.value}"`);
      if (EN[c.value]) enTrans.push({ locale: "en", key: c.key, value: EN[c.value], translatableContentDigest: c.digest });
      if (PT[c.value]) ptTrans.push({ locale: "pt-BR", key: c.key, value: PT[c.value], translatableContentDigest: c.digest });
    }

    if (enTrans.length) {
      const r = await graphql(`
        mutation r($resourceId: ID!, $translations: [TranslationInput!]!) {
          translationsRegister(resourceId: $resourceId, translations: $translations) {
            userErrors { message } translations { key }
          }
        }`, { resourceId: node.resourceId, translations: enTrans });
      const e = r.data?.translationsRegister?.userErrors;
      console.log(e?.length ? `   ❌ EN: ${e[0].message}` : `   ✅ ${enTrans.length} traducciones EN del menú`);
    }
  }
}

console.log('\n🎉 Menú procesado.');
