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

const PT = {
  "🚚 Envío gratuito a toda España — Garantía de devolución incluida": "🚚 Frete grátis — Garantia de devolução incluída",
  "🚚 Envío gratuito a toda España": "🚚 Frete grátis para todo o Brasil",
  "Suscríbete a nuestro boletín": "Assine nossa newsletter",
};
// También faltaba inglés para estos dos
const EN = {
  "🚚 Envío gratuito a toda España — Garantía de devolución incluida": "🚚 Free shipping — Money-back guarantee included",
  "Suscríbete a nuestro boletín": "Subscribe to our newsletter",
};

const types = ['ONLINE_STORE_THEME_SETTINGS_DATA_SECTIONS', 'ONLINE_STORE_THEME_SECTION_GROUP', 'ONLINE_STORE_THEME_JSON_TEMPLATE'];
const reg = `mutation r($resourceId: ID!, $translations: [TranslationInput!]!) { translationsRegister(resourceId: $resourceId, translations: $translations) { userErrors { message } translations { key } } }`;

for (const type of types) {
  const res = await graphql(`{ translatableResources(first: 50, resourceType: ${type}) { edges { node { resourceId translatableContent { key value digest } } } } }`);
  for (const { node } of res.data.translatableResources.edges) {
    const trans = [];
    for (const c of node.translatableContent) {
      if (PT[c.value]) trans.push({ locale: "pt-BR", key: c.key, value: PT[c.value], translatableContentDigest: c.digest });
      if (EN[c.value]) trans.push({ locale: "en", key: c.key, value: EN[c.value], translatableContentDigest: c.digest });
    }
    if (trans.length) {
      const r = await graphql(reg, { resourceId: node.resourceId, translations: trans });
      const e = r.data?.translationsRegister?.userErrors;
      console.log(e?.length ? `⚠️  ${type}: ${e[0].message}` : `✅ ${type}: ${trans.length} traducciones (pt+en)`);
    }
  }
}
console.log('\n🎉 Patch completado.');
