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

// ── 1. ARREGLAR SETTINGS_DATA (announcement bar) ──────────────
console.log('🔧 Arreglando announcement bar...');
const settingsAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`);
const settingsData = JSON.parse(settingsAsset.asset.value);

// Encontrar el preset correcto
const presetKey = settingsData.current;
const preset = settingsData.presets?.[presetKey] || settingsData.current_preset || settingsData;

// Asegurarse que sections existe
if (preset && !preset.sections) preset.sections = {};

if (preset?.sections) {
  preset.sections['announcement-bar'] = {
    type: "announcement-bar",
    blocks: {
      "ann1": {
        type: "announcement",
        settings: {
          text: "🚚 Envío gratuito a toda España — Garantía de devolución",
          text_alignment: "center",
          link: ""
        }
      }
    },
    block_order: ["ann1"],
    settings: { color_scheme: "scheme-5", auto_rotate: false, change_slides_speed: 5 }
  };

  const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
    asset: { key: "config/settings_data.json", value: JSON.stringify(settingsData) }
  });
  console.log(r.errors ? `❌ ${JSON.stringify(r.errors)}` : '✅ Announcement bar actualizado');
}

// ── 2. EDITAR LOCALE es.default.json PARA TRADUCIR TEXTOS ─────
console.log('\n🌐 Traduciendo textos del tema al español...');

// Dawn usa es.default.json para traducciones en español
const esLocale = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/es.default.json`);
let localeData = {};
if (esLocale.asset?.value) {
  try { localeData = JSON.parse(esLocale.asset.value); } catch {}
}

// Actualizar textos clave que aparecen en portugués/inglés
const updates = {
  general: {
    ...(localeData.general || {}),
    password_page: { ...(localeData.general?.password_page || {}), login_form_heading: "Acceso a la tienda" }
  },
  sections: {
    ...(localeData.sections || {}),
    header: { menu: "Menú", ...(localeData.sections?.header || {}) },
    announcement_bar: { announcement: "🚚 Envío gratuito a toda España" }
  },
  cart: {
    ...(localeData.cart || {}),
    general: { ...(localeData.cart?.general || {}), empty: "Tu carrito está vacío", title: "Carrito" }
  }
};

const mergedLocale = { ...localeData, ...updates };
const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "locales/es.default.json", value: JSON.stringify(mergedLocale) }
});
console.log(r2.errors ? `❌ ${JSON.stringify(r2.errors)}` : '✅ Traducciones al español aplicadas');

// ── 3. CONFIGURAR ESPAÑOL COMO IDIOMA PRIMARIO ─────────────────
console.log('\n🌐 Configurando idioma principal...');

const langRes = await graphql(`{ shopLocales { locale primary published } }`);
console.log('Idiomas actuales:', langRes.data?.shopLocales?.map(l => `${l.locale}${l.primary?' (primario)':''}`).join(', '));

const hasSpanish = langRes.data?.shopLocales?.some(l => l.locale === 'es');
if (!hasSpanish) {
  const r3 = await graphql(`
    mutation { shopLocaleEnable(locale: "es") {
      shopLocale { locale published }
      userErrors { field message }
    } }
  `);
  const errs = r3.data?.shopLocaleEnable?.userErrors;
  console.log(errs?.length ? `❌ ${errs[0].message}` : '✅ Español habilitado');
}

const r4 = await graphql(`
  mutation {
    shopLocaleUpdate(locale: "es", shopLocale: { published: true }) {
      shopLocale { locale published }
      userErrors { field message }
    }
  }
`);
const errs4 = r4.data?.shopLocaleUpdate?.userErrors;
console.log(errs4?.length ? `⚠️  ${errs4[0].message}` : '✅ Español como idioma publicado');

console.log('\n🎉 Listo. Refrescá https://storeup.store');
console.log('\n───────────────────────────────────────────');
console.log('💬 SOBRE EL "Welcome to our store":');
console.log('   Este texto viene del locale PT (portugués) que Dawn');
console.log('   usa por defecto. Para eliminarlo completamente hay');
console.log('   que ir a: Admin → Online Store → Themes → Edit languages');
console.log('   y cambiar "Welcome to our store" a tu texto.');
console.log('   O puedo editar el archivo locales/pt.default.json directamente.');
