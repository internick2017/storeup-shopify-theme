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

const NEW_ES = "🎁 -10% en tu 1ª compra con BIENVENIDO10 · 🚚 Envío gratis";
const NEW_EN = "🎁 10% off your first order with BIENVENIDO10 · 🚚 Free shipping";
const NEW_PT = "🎁 10% OFF na 1ª compra com BIENVENIDO10 · 🚚 Frete grátis";

// 1. Actualizar header-group.json
console.log('🔧 Actualizando announcement en header-group.json...');
const hg = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=sections/header-group.json`);
let hgStr = hg.asset.value;

const olds = [
  "🚚 Envío gratuito a toda España — Garantía de devolución incluida",
  "🚚 Envío gratuito a toda España — Garantía de devolución",
  "🚚 Envío gratuito a toda España"
];
let changed = false;
for (const old of olds) {
  if (hgStr.includes(old)) { hgStr = hgStr.split(old).join(NEW_ES); changed = true; }
}
if (changed) {
  const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
    asset: { key: 'sections/header-group.json', value: hgStr }
  });
  console.log(r.errors ? `❌ ${JSON.stringify(r.errors)}` : '✅ header-group.json actualizado');
} else {
  console.log('ℹ️  No estaba en header-group, buscando texto actual...');
  const m = hgStr.match(/"text":\s*"([^"]*(?:Env|gratis|gratuito|shipping)[^"]*)"/i);
  if (m) console.log('   Texto announcement actual:', m[1]);
}

// 2. Registrar traducciones EN + PT
console.log('\n🔧 Registrando traducciones EN + PT...');
const reg = `mutation r($resourceId: ID!, $translations: [TranslationInput!]!) { translationsRegister(resourceId: $resourceId, translations: $translations) { userErrors { message } translations { key } } }`;
const res = await graphql(`{ translatableResources(first: 50, resourceType: ONLINE_STORE_THEME_SECTION_GROUP) { edges { node { resourceId translatableContent { key value digest } } } } }`);
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
    console.log(e?.length ? `⚠️  ${e[0].message}` : `✅ ${trans.length} traducciones (en+pt)`);
  }
}
console.log('\n🎉 Announcement con descuento en 3 idiomas.');
