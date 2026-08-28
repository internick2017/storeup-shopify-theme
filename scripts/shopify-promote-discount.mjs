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

const NEW_ES = "🎁 -10% en tu 1ª compra con el código BIENVENIDO10 · 🚚 Envío gratis";
const NEW_EN = "🎁 10% off your first order with code BIENVENIDO10 · 🚚 Free shipping";
const NEW_PT = "🎁 10% OFF na 1ª compra com o código BIENVENIDO10 · 🚚 Frete grátis";

// 1. Actualizar el texto base (español) en settings_data.json
console.log('🔧 Actualizando announcement bar (español base)...');
const settingsAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`);
let settingsStr = settingsAsset.asset.value;

// Reemplazar el texto del announcement actual
const oldTexts = [
  "🚚 Envío gratuito a toda España — Garantía de devolución",
  "🚚 Envío gratuito a toda España — Garantía de devolución incluida",
  "🚚 Envío gratuito a toda España"
];
let replaced = false;
for (const old of oldTexts) {
  if (settingsStr.includes(old)) {
    settingsStr = settingsStr.split(old).join(NEW_ES);
    replaced = true;
  }
}
if (replaced) {
  const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
    asset: { key: 'config/settings_data.json', value: settingsStr }
  });
  console.log(r.errors ? `❌ ${JSON.stringify(r.errors)}` : '✅ Texto base actualizado');
} else {
  console.log('ℹ️  No se encontró el texto viejo en settings_data (puede estar en section group)');
}

// 2. Re-registrar traducciones EN + PT con los nuevos digests
console.log('\n🔧 Re-registrando traducciones EN + PT del announcement...');
const types = ['ONLINE_STORE_THEME_SETTINGS_DATA_SECTIONS', 'ONLINE_STORE_THEME_SECTION_GROUP'];
const reg = `mutation r($resourceId: ID!, $translations: [TranslationInput!]!) { translationsRegister(resourceId: $resourceId, translations: $translations) { userErrors { message } translations { key } } }`;

for (const type of types) {
  const res = await graphql(`{ translatableResources(first: 50, resourceType: ${type}) { edges { node { resourceId translatableContent { key value digest } } } } }`);
  for (const { node } of res.data.translatableResources.edges) {
    const trans = [];
    for (const c of node.translatableContent) {
      if (c.value === NEW_ES) {
        trans.push({ locale: "en", key: c.key, value: NEW_EN, translatableContentDigest: c.digest });
        trans.push({ locale: "pt-BR", key: c.key, value: NEW_PT, translatableContentDigest: c.digest });
      }
    }
    if (trans.length) {
      const r = await graphql(reg, { resourceId: node.resourceId, translations: trans });
      const e = r.data?.translationsRegister?.userErrors;
      console.log(e?.length ? `⚠️  ${type}: ${e[0].message}` : `✅ ${type}: ${trans.length} traducciones (en+pt)`);
    }
  }
}

console.log('\n🎉 Descuento promocionado en los 3 idiomas:');
console.log(`   ES: ${NEW_ES}`);
console.log(`   EN: ${NEW_EN}`);
console.log(`   PT: ${NEW_PT}`);
