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

// Mapa español → inglés (announcement, footer, etc.)
const EN = {
  "🚚 Envío gratuito a toda España — Garantía de devolución": "🚚 Free shipping — Money-back guarantee",
  "🚚 Envío gratuito a toda España": "🚚 Free shipping worldwide",
  "🚚 Envío gratuito a toda España — Garantía de devolución incluida": "🚚 Free shipping — Money-back guarantee included",
  "Suscríbete a nuestro boletín": "Subscribe to our newsletter",
  "Transforma tu espacio": "Transform your space",
  "<p>Productos únicos para hacer de tu habitación un lugar especial. Envío gratis a toda España.</p>": "<p>Unique products to make your room a special place. Free shipping.</p>",
  "Recibe novedades y ofertas exclusivas.": "Get news and exclusive offers.",
  "Recibe ofertas exclusivas y novedades.": "Get exclusive offers and news.",
};

const TYPES = [
  'ONLINE_STORE_THEME_SETTINGS_DATA_SECTIONS',
  'ONLINE_STORE_THEME_SECTION_GROUP',
  'ONLINE_STORE_THEME_SETTINGS_CATEGORY',
];

let totalReg = 0;
const unmapped = [];

for (const type of TYPES) {
  const res = await graphql(`{
    translatableResources(first: 50, resourceType: ${type}) {
      edges { node { resourceId translatableContent { key value digest } } }
    }
  }`);

  if (res.errors) { console.log(`⚠️  ${type}: ${res.errors[0].message}`); continue; }

  for (const { node } of res.data.translatableResources.edges) {
    const toTranslate = [];
    for (const c of node.translatableContent) {
      if (!c.value) continue;
      if (EN[c.value]) {
        toTranslate.push({ locale: "en", key: c.key, value: EN[c.value], translatableContentDigest: c.digest });
      } else if (/[áéíóúñ¿¡]|Envío|España|boletín|Suscr|habitación|atardecer|dorada/i.test(c.value) && c.value.length < 250) {
        unmapped.push({ type, key: c.key, value: c.value });
      }
    }

    if (toTranslate.length) {
      const reg = await graphql(`
        mutation r($resourceId: ID!, $translations: [TranslationInput!]!) {
          translationsRegister(resourceId: $resourceId, translations: $translations) {
            userErrors { message field }
            translations { key }
          }
        }
      `, { resourceId: node.resourceId, translations: toTranslate });

      if (reg.errors?.length) { console.log(`❌ ${type}: ${reg.errors[0].message}`); continue; }
      const errs = reg.data?.translationsRegister?.userErrors;
      if (errs?.length) { console.log(`⚠️  ${type}: ${errs[0].message}`); }
      else {
        const n = reg.data.translationsRegister.translations.length;
        totalReg += n;
        console.log(`✅ ${type}: ${n} traducciones EN`);
      }
    }
  }
}

console.log(`\n📊 Total: ${totalReg} traducciones registradas`);
if (unmapped.length) {
  console.log('\n⚠️  Sin traducir:');
  unmapped.forEach(u => console.log(`   [${u.type}] "${u.value.substring(0,70)}"`));
}
