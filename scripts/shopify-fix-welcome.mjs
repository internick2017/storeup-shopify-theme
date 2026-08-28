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

// 1. Ver qué idiomas hay en la tienda
console.log('🌐 Idiomas de la tienda:');
const langs = await graphql(`{ shopLocales { locale primary published } }`);
langs.data?.shopLocales?.forEach(l => {
  console.log(`  ${l.primary ? '★' : ' '} ${l.locale} publicado: ${l.published}`);
});

// 2. Ver archivos de locale disponibles en el tema
console.log('\n📂 Archivos de locale en el tema:');
const allAssets = await api('GET', `/themes/${THEME_ID}/assets.json`);
const localeFiles = allAssets.assets.filter(a => a.key.startsWith('locales/'));
localeFiles.forEach(f => console.log(`  ${f.key}`));

// 3. Editar el locale PT (portugués) para cambiar "Welcome to our store"
const ptLocaleFile = localeFiles.find(f => f.key.includes('pt') && f.key.includes('default'));
const ptKey = ptLocaleFile?.key || 'locales/pt.default.json';
console.log(`\n🔧 Editando ${ptKey}...`);

const ptAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=${ptKey}`);
let ptData = {};
if (ptAsset.asset?.value) {
  try { ptData = JSON.parse(ptAsset.asset.value); } catch { ptData = {}; }
}

// Cambiar "Welcome to our store" en el locale PT
if (!ptData.sections) ptData.sections = {};
if (!ptData.sections.announcement_bar) ptData.sections.announcement_bar = {};
ptData.sections.announcement_bar.default_announcement = "🚚 Envío gratuito a toda España";

const r1 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: ptKey, value: JSON.stringify(ptData) }
});
console.log(r1.errors ? `❌ ${JSON.stringify(r1.errors)}` : `✅ ${ptKey} actualizado`);

// 4. Editar locale EN también por si acaso
const enKey = 'locales/en.default.json';
const enAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=${enKey}`);
let enData = {};
if (enAsset.asset?.value) {
  try { enData = JSON.parse(enAsset.asset.value); } catch { enData = {}; }
}
if (!enData.sections) enData.sections = {};
if (!enData.sections.announcement_bar) enData.sections.announcement_bar = {};
enData.sections.announcement_bar.default_announcement = "🚚 Envío gratuito a toda España";

const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: enKey, value: JSON.stringify(enData) }
});
console.log(r2.errors ? `❌ ${JSON.stringify(r2.errors)}` : `✅ ${enKey} actualizado`);

// 5. Habilitar y publicar español
console.log('\n🌐 Configurando idioma español...');
const hasES = langs.data?.shopLocales?.some(l => l.locale === 'es');
if (!hasES) {
  const r3 = await graphql(`mutation { shopLocaleEnable(locale: "es") { shopLocale { locale } userErrors { message } } }`);
  const e = r3.data?.shopLocaleEnable?.userErrors;
  console.log(e?.length ? `❌ ${e[0].message}` : '✅ Español habilitado');
}
const r4 = await graphql(`mutation { shopLocaleUpdate(locale: "es", shopLocale: { published: true }) { shopLocale { locale published } userErrors { message } } }`);
const e4 = r4.data?.shopLocaleUpdate?.userErrors;
console.log(e4?.length ? `⚠️  ${e4[0].message}` : '✅ Español publicado en la tienda');

console.log('\n🎉 Listo. Refrescá https://storeup.store');
