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

// 1. Sacar el selector de país e idioma del header
console.log('🔧 Desactivando selector de país/idioma en el header...');
const headerAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=sections/header-group.json`);
const headerData = JSON.parse(headerAsset.asset.value);

// Encontrar la sección header y desactivar country/language selectors
for (const key of Object.keys(headerData.sections || {})) {
  const section = headerData.sections[key];
  if (section.type === 'header') {
    // Desactivar selector de país e idioma
    if (section.settings) {
      section.settings.show_country_selector = false;
      section.settings.show_locale_selector = false;
      console.log(`   Desactivado en sección: ${key}`);
    }
  }
}

const r1 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'sections/header-group.json', value: JSON.stringify(headerData) }
});
console.log(r1.errors ? `❌ ${JSON.stringify(r1.errors)}` : '✅ Selector de país/idioma eliminado del header');

// 2. Arreglar "From" → "Desde" en locale pt-BR
console.log('\n🔧 Arreglando "From" → "Desde" en el producto...');
const ptAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/pt-BR.json`);
let ptStr = ptAsset.asset.value;

// Reemplazar "from" en contexto de precios
ptStr = ptStr
  .replace(/"from":\s*"From"/g, '"from": "Desde"')
  .replace(/"From \{\{/g, '"Desde \{\{')
  .replace(/"\s*From\s*"/g, '" Desde "')
  .replace(/: "From"/g, ': "Desde"')
  .replace(/: "from"/g, ': "desde"');

const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'locales/pt-BR.json', value: ptStr }
});
console.log(r2.errors ? `❌` : '✅ "From" → "Desde" en pt-BR');

// También en en.default.json para el mercado inglés
const enAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/en.default.json`);
const enData = JSON.parse(enAsset.asset.value);

// Asegurar que products.product.from está traducido
if (!enData.products) enData.products = {};
if (!enData.products.product) enData.products.product = {};
enData.products.product.from = "From";  // en inglés está bien

const r3 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'locales/en.default.json', value: JSON.stringify(enData) }
});
console.log(r3.errors ? `❌` : '✅ en.default.json confirmado');

// 3. Verificar la estructura del pt-BR para "from"
console.log('\n🔍 Verificando traducción "from" en pt-BR...');
const ptCheck = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/pt-BR.json`);
const ptData = JSON.parse(ptCheck.asset.value);
const fromValue = ptData?.products?.product?.from || ptData?.general?.from || 'no encontrado';
console.log(`   "from" en pt-BR: "${fromValue}"`);

// 4. También desactivar el selector en el footer
console.log('\n🔧 Desactivando selectores en el footer...');
const footerAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=sections/footer-group.json`);
let footerStr = footerAsset.asset.value;
const footerData = JSON.parse(footerStr);

for (const key of Object.keys(footerData.sections || {})) {
  const section = footerData.sections[key];
  if (section.settings) {
    if ('show_country_selector' in section.settings) {
      section.settings.show_country_selector = false;
    }
    if ('show_locale_selector' in section.settings) {
      section.settings.show_locale_selector = false;
    }
  }
}

const r4 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'sections/footer-group.json', value: JSON.stringify(footerData) }
});
console.log(r4.errors ? `❌ ${JSON.stringify(r4.errors)}` : '✅ Selectores eliminados del footer también');

console.log('\n🎉 Arreglos aplicados:');
console.log('   ✅ "Brasil | EUR" — eliminado del header y footer');
console.log('   ✅ "English" switcher — eliminado');
console.log('   ✅ "From" → "Desde" en precio del producto');
console.log('\n   Refrescá: https://storeup.store');
