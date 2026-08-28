import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const THEME_ID = '156532670622';

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

// Mapa de traducción español → inglés (por valor exacto del source)
const EN = {
  "La hora dorada, a cualquier hora": "Golden hour, any hour",
  "Transforma tu cuarto en un atardecer infinito — sin ventanas, sin esperar": "Turn your room into an endless sunset — no windows, no waiting",
  "Conseguir mi Golden Hour": "Get my Golden Hour",
  "🌅 Atardecer en segundos": "🌅 Sunset in seconds",
  "<p>Enciéndela y tu cuarto cambia. Sin esperar. A cualquier hora del día o de la noche.</p>": "<p>Turn it on and your room transforms. No waiting. Any time, day or night.</p>",
  "🎨 Tu cuarto, tu ambiente": "🎨 Your room, your vibe",
  "<p>Gaming, meditación, streaming, descanso. La Golden Hour se adapta a tu momento.</p>": "<p>Gaming, meditation, streaming, relaxing. The Golden Hour adapts to your moment.</p>",
  "🚚 Envío gratis a España": "🚚 Free shipping",
  "<p>Entrega en 15-25 días. Garantía de satisfacción incluida. Sin riesgos.</p>": "<p>Delivery in 15-25 days. Satisfaction guarantee included. No risks.</p>",
  "Elige tu Golden Hour": "Choose your Golden Hour",
  "Miles de cuartos transformados": "Thousands of rooms transformed",
  "<p>⭐⭐⭐⭐⭐ +500 clientes &nbsp;|&nbsp; 🚚 Envío gratis &nbsp;|&nbsp; ↩️ Garantía &nbsp;|&nbsp; 🔒 Pago seguro</p>": "<p>⭐⭐⭐⭐⭐ +500 customers &nbsp;|&nbsp; 🚚 Free shipping &nbsp;|&nbsp; ↩️ Guarantee &nbsp;|&nbsp; 🔒 Secure payment</p>",
  "Productos seleccionados para transformar tu espacio": "Curated products to transform your space",
  "<p>Productos seleccionados para transformar tu espacio</p>": "<p>Curated products to transform your space</p>",
  // Variantes de texto previas que puedan quedar
  "Transforma tu habitación al instante ✨": "Transform your room instantly ✨",
  "Ver producto": "Shop now",
};

console.log('🔍 Obteniendo todo el contenido traducible del tema...\n');

// Obtener TODOS los recursos de tipo JSON_TEMPLATE
const res = await graphql(`{
  translatableResources(first: 50, resourceType: ONLINE_STORE_THEME_JSON_TEMPLATE) {
    edges { node {
      resourceId
      translatableContent { key value digest }
    } }
  }
}`);

if (res.errors) { console.error('❌', res.errors[0].message); process.exit(1); }

const resources = res.data.translatableResources.edges;
let registered = 0;
let unmapped = [];

for (const { node } of resources) {
  const toTranslate = [];

  for (const content of node.translatableContent) {
    const val = content.value;
    if (!val) continue;
    if (EN[val]) {
      toTranslate.push({
        locale: "en",
        key: content.key,
        value: EN[val],
        translatableContentDigest: content.digest
      });
    } else if (/[áéíóúñ¿¡]|atardecer|cuarto|Golden|clientes|Envío|hora/i.test(val) && val.length < 200) {
      // Texto en español sin traducción mapeada
      unmapped.push({ resource: node.resourceId.split('/').pop().split('?')[0], key: content.key, value: val });
    }
  }

  if (toTranslate.length) {
    const reg = await graphql(`
      mutation translationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
        translationsRegister(resourceId: $resourceId, translations: $translations) {
          userErrors { message field }
          translations { key locale }
        }
      }
    `, { resourceId: node.resourceId, translations: toTranslate });

    if (reg.errors?.length) {
      console.log(`❌ GraphQL error: ${reg.errors[0].message}`);
      console.log(`   Resource: ${node.resourceId}`);
      console.log(`   Keys: ${toTranslate.map(t => t.key).join(', ').substring(0,150)}`);
      continue;
    }
    const errs = reg.data?.translationsRegister?.userErrors;
    if (errs?.length) {
      console.log(`⚠️  ${node.resourceId.split('/').pop().split('?')[0]}: ${errs[0].message} (${errs[0].field})`);
    } else {
      const count = reg.data.translationsRegister.translations.length;
      registered += count;
      console.log(`✅ ${node.resourceId.split('/').pop().split('?')[0]}: ${count} traducciones EN registradas`);
    }
  }
}

console.log(`\n📊 Total traducciones inglesas registradas: ${registered}`);

if (unmapped.length) {
  console.log(`\n⚠️  Textos en español SIN traducir (agregar al mapa):`);
  unmapped.forEach(u => console.log(`   [${u.key.substring(0,30)}] "${u.value.substring(0,60)}"`));
}

console.log('\n🎉 Listo. Probá cambiar a inglés en https://storeup.store');
