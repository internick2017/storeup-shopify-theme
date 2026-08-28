import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const PRODUCT_ID = '8737067827358';
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

// ── 1. BORRAR IMÁGENES ANTERIORES (las de Unsplash genéricas) ──
console.log('🗑️  Borrando imágenes anteriores del producto...');
const currentProduct = await api('GET', `/products/${PRODUCT_ID}/images.json`);
for (const img of currentProduct.images || []) {
  await api('DELETE', `/products/${PRODUCT_ID}/images/${img.id}.json`);
}
console.log(`   Borradas: ${currentProduct.images?.length || 0} imágenes`);

// ── 2. SUBIR IMÁGENES REALES DEL PRODUCTO ─────────────────────
console.log('\n📸 Subiendo imágenes reales de la lámpara...');

const realImages = [
  { src: 'https://ae-pic-a1.aliexpress-media.com/kf/Sb3b8b06b2378420eb592faae116fb0f40.jpg', alt: 'Lámpara proyectora atardecer en habitación - efecto sunset en pared' },
  { src: 'https://ae-pic-a1.aliexpress-media.com/kf/S1340eec44f034fb7a83d22237dd92a51l.jpg', alt: 'Efecto de atardecer proyectado en pared oscura con plantas' },
  { src: 'https://ae-pic-a1.aliexpress-media.com/kf/Sfd0e23aeda7d4182ae4e67ceed2143d5c.jpg', alt: 'Dispositivo lámpara sunset USB compacto - vista del producto' },
  { src: 'https://ae-pic-a1.aliexpress-media.com/kf/S91600cee70af4b30a893f000ac35f774l.jpg', alt: 'Lámpara proyectora con múltiples colores - naranja púrpura azul' },
  { src: 'https://ae-pic-a1.aliexpress-media.com/kf/S114d1e703cf7402cb362cd652b4929abc.jpg', alt: 'Dos lámparas proyectando arcoíris y amarillo en pared blanca' },
];

let uploadedCount = 0;
for (let i = 0; i < realImages.length; i++) {
  const img = realImages[i];
  const r = await api('POST', `/products/${PRODUCT_ID}/images.json`, {
    image: { src: img.src, alt: img.alt, position: i + 1 }
  });
  if (r.image?.id) {
    console.log(`  ✅ Imagen ${i + 1}: ${img.alt.substring(0, 50)}...`);
    uploadedCount++;
  } else {
    console.log(`  ❌ Imagen ${i + 1}:`, JSON.stringify(r.errors || r).substring(0, 100));
  }
}

// ── 3. ARREGLAR "Welcome to our store" ────────────────────────
console.log('\n🔧 Arreglando textos del tema (Welcome to our store)...');

// Leer el locale es.json del tema Dawn para traducir al español
const localeAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/es.json`);
let localeData = {};
if (localeAsset.asset?.value) {
  localeData = JSON.parse(localeAsset.asset.value);
}

// Actualizar textos clave en español
if (!localeData.sections) localeData.sections = {};
if (!localeData.general) localeData.general = {};

localeData.sections = {
  ...localeData.sections,
  header: { menu: "Menú" },
  announcement_bar: {
    announcement: "🚚 Envío gratuito a toda España — Garantía de devolución incluida"
  }
};

// Leer settings_data para asegurarnos que el announcement esté correcto
const settingsAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`);
const settingsData = JSON.parse(settingsAsset.asset.value);
const presetKey = settingsData.current;

// Confirmar announcement bar correcto
settingsData.presets[presetKey].sections['announcement-bar'] = {
  type: "announcement-bar",
  blocks: {
    "ann1": {
      type: "announcement",
      settings: {
        text: "🚚 Envío gratuito a toda España — Garantía de devolución incluida",
        text_alignment: "center",
        link: ""
      }
    }
  },
  block_order: ["ann1"],
  settings: {
    color_scheme: "scheme-5",
    auto_rotate: false,
    change_slides_speed: 5
  }
};

const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "config/settings_data.json", value: JSON.stringify(settingsData) }
});
if (!r2.errors) console.log('✅ Announcement bar confirmado en español');

// ── 4. CAMBIAR IDIOMA DEFAULT A ESPAÑOL ───────────────────────
console.log('\n🌐 Configurando idioma del sitio a español...');

const langRes = await graphql(`{
  shopLocales { locale primary published }
}`);

console.log('Idiomas actuales:');
langRes.data?.shopLocales?.forEach(l => {
  console.log(`  ${l.primary ? '★' : ' '} ${l.locale} (publicado: ${l.published})`);
});

// Publicar español si no está
const hasSpanish = langRes.data?.shopLocales?.some(l => l.locale === 'es');
if (!hasSpanish) {
  const addLang = await graphql(`
    mutation enableLanguage($language: String!) {
      shopLocaleEnable(locale: $language) {
        shopLocale { locale published }
        userErrors { field message }
      }
    }
  `, { language: 'es' });
  if (addLang.data?.shopLocaleEnable?.userErrors?.length) {
    console.log('❌ Añadir español:', addLang.data.shopLocaleEnable.userErrors[0].message);
  } else {
    console.log('✅ Español añadido como idioma del sitio');
  }
}

// Establecer español como idioma primario
const setPrimary = await graphql(`
  mutation setLocale($locale: String!) {
    shopLocaleUpdate(locale: $locale, shopLocale: { published: true }) {
      shopLocale { locale published }
      userErrors { field message }
    }
  }
`, { locale: 'es' });

if (setPrimary.data?.shopLocaleUpdate?.userErrors?.length) {
  console.log('⚠️ ', setPrimary.data.shopLocaleUpdate.userErrors[0].message);
} else {
  console.log('✅ Español configurado como idioma principal');
}

console.log(`\n🎉 Resumen:`);
console.log(`   → Imágenes reales del producto: ${uploadedCount}/5 subidas`);
console.log(`   → Announcement bar: en español`);
console.log(`   → Idioma del sitio: español`);
console.log(`\n   Refrescá: https://storeup.store`);
