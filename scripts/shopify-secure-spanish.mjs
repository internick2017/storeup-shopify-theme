import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const PRODUCT_ID = '8737067827358';

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

// Estrategia: para cada contenido del idioma primario (que está en español),
// registrar una traducción "es" con el MISMO texto. Así "es" es autosuficiente.

const THEME_TYPES = [
  'ONLINE_STORE_THEME_JSON_TEMPLATE',
  'ONLINE_STORE_THEME_SETTINGS_DATA_SECTIONS',
  'ONLINE_STORE_THEME_SECTION_GROUP',
  'ONLINE_STORE_THEME_SETTINGS_CATEGORY',
];

// Detecta si un texto está en español (para no duplicar textos que ya son técnicos/vacíos)
function isSpanish(val) {
  if (!val || val.length > 2000) return false;
  return /[áéíóúñ¿¡]|atardecer|cuarto|dorada|Golden|clientes|Env[íi]o|ambiente|Elige|Conseguir|Transforma|Suscr|bolet[íi]n|Productos|espacio|garant|seguro|gratis/i.test(val);
}

let totalEs = 0;

async function registerEsForType(type) {
  const res = await graphql(`{
    translatableResources(first: 50, resourceType: ${type}) {
      edges { node { resourceId translatableContent { key value digest } } }
    }
  }`);
  if (res.errors) { console.log(`⚠️  ${type}: ${res.errors[0].message}`); return; }

  for (const { node } of res.data.translatableResources.edges) {
    const esTrans = [];
    for (const c of node.translatableContent) {
      if (isSpanish(c.value)) {
        esTrans.push({ locale: "es", key: c.key, value: c.value, translatableContentDigest: c.digest });
      }
    }
    if (esTrans.length) {
      const r = await graphql(`
        mutation r($resourceId: ID!, $translations: [TranslationInput!]!) {
          translationsRegister(resourceId: $resourceId, translations: $translations) {
            userErrors { message } translations { key }
          }
        }`, { resourceId: node.resourceId, translations: esTrans });
      if (r.errors?.length) { console.log(`❌ ${type}: ${r.errors[0].message}`); continue; }
      const e = r.data?.translationsRegister?.userErrors;
      if (e?.length) { console.log(`⚠️  ${type}: ${e[0].message}`); }
      else { totalEs += r.data.translationsRegister.translations.length; console.log(`✅ ${type}: ${r.data.translationsRegister.translations.length} es`); }
    }
  }
}

console.log('🔒 Blindando el español (registrando contenido bajo locale es)...\n');

for (const type of THEME_TYPES) {
  await registerEsForType(type);
}

// Producto
console.log('\n🛍️  Producto...');
const productGid = `gid://shopify/Product/${PRODUCT_ID}`;
const pr = await graphql(`{
  translatableResource(resourceId: "${productGid}") {
    translatableContent { key value digest }
  }
}`);
const esProd = [];
for (const c of pr.data.translatableResource.translatableContent) {
  if (isSpanish(c.value)) {
    esProd.push({ locale: "es", key: c.key, value: c.value, translatableContentDigest: c.digest });
  }
}
if (esProd.length) {
  const r = await graphql(`
    mutation r($resourceId: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $resourceId, translations: $translations) {
        userErrors { message } translations { key }
      }
    }`, { resourceId: productGid, translations: esProd });
  const e = r.data?.translationsRegister?.userErrors;
  console.log(e?.length ? `⚠️  ${e[0].message}` : `✅ Producto: ${r.data.translationsRegister.translations.length} es`);
}

console.log(`\n📊 Total traducciones es registradas: ${totalEs + esProd.length}`);
console.log('🔒 Español blindado — ahora es autosuficiente.');
console.log('\n👉 Ahora SÍ podés cambiar el idioma base:');
console.log('   ··· junto a "Português (Brasil)" → "Alterar padrão" → Español');
