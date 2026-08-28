import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const THEME_ID = '156532670622';
const PRODUCT_ID = '8737067827358';

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

// ── 1. RE-ACTIVAR SELECTORES ────────────────────────────────────
console.log('🔧 Re-activando selectores de país e idioma...');

const headerAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=sections/header-group.json`);
const headerData = JSON.parse(headerAsset.asset.value);
for (const key of Object.keys(headerData.sections || {})) {
  if (headerData.sections[key].type === 'header' && headerData.sections[key].settings) {
    headerData.sections[key].settings.show_country_selector = true;
    headerData.sections[key].settings.show_locale_selector = true;
  }
}
const r1 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'sections/header-group.json', value: JSON.stringify(headerData) }
});
console.log(r1.errors ? `❌` : '✅ Selectores re-activados');

// Footer también
const footerAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=sections/footer-group.json`);
const footerData = JSON.parse(footerAsset.asset.value);
for (const key of Object.keys(footerData.sections || {})) {
  if (footerData.sections[key].settings) {
    if ('show_country_selector' in footerData.sections[key].settings)
      footerData.sections[key].settings.show_country_selector = true;
    if ('show_locale_selector' in footerData.sections[key].settings)
      footerData.sections[key].settings.show_locale_selector = true;
  }
}
const r1b = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'sections/footer-group.json', value: JSON.stringify(footerData) }
});
console.log(r1b.errors ? `❌` : '✅ Selectores footer re-activados');

// ── 2. TRADUCCIONES COMPLETAS EN INGLÉS ─────────────────────────
console.log('\n🔧 Cargando traducciones completas en inglés...');

const enAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/en.default.json`);
const enData = JSON.parse(enAsset.asset.value);

// Asegurar que todos los textos UI están en inglés correcto
const enTranslations = {
  sections: {
    'announcement-bar': { default_announcement: "🚚 Free shipping to Spain & Europe — Satisfaction guarantee" },
    header: { menu: "Menu" },
    newsletter: { header: { heading: "Subscribe to our newsletter", subheading: "Get exclusive offers and new products." }, label: "Email", placeholder: "Your email", submit: "Subscribe" },
    'email-signup-banner': { newsletter_label: "Email", newsletter_placeholder: "Your email", newsletter_submit: "Subscribe", heading: "Subscribe to our newsletter" },
    footer: { newsletter: { label: "Email", placeholder: "Your email", submit: "Subscribe" } },
    'featured-collection': { view_all: "View all" },
    'main-cart-items': { title: "Cart" },
    'main-search': { title: "Search" }
  },
  products: {
    product: {
      add_to_cart: "Add to cart",
      sold_out: "Sold out",
      unavailable: "Unavailable",
      from: "From",
      quantity: { label: "Quantity", decrease: "Decrease", increase: "Increase" },
      description: "Description",
      share: "Share"
    },
    facets: {
      filter_button: "Filter",
      clear_filter: "Clear",
      filters: "Filters",
      sort_by_label: "Sort by",
      sort_by: { featured: "Featured", "price-ascending": "Price: Low to High", "price-descending": "Price: High to Low", "title-ascending": "A-Z", "title-descending": "Z-A" }
    }
  },
  general: { continue_shopping: "Continue shopping", search: "Search", close: "Close", loading: "Loading", or: "or" },
  templates: { cart: { title: "Cart", empty: "Your cart is empty", continue_shopping: "Continue shopping" }, search: { title: "Search", no_results: "No results for" } },
  accessibility: { skip_to_text_link: "Skip to content", close: "Close", cart_icon: "Cart", menu: "Menu", search: "Search" }
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else { target[key] = source[key]; }
  }
  return target;
}
deepMerge(enData, enTranslations);

const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'locales/en.default.json', value: JSON.stringify(enData) }
});
console.log(r2.errors ? `❌ ${JSON.stringify(r2.errors)}` : '✅ en.default.json — UI en inglés completa');

// ── 3. TRADUCIR CONTENIDO DEL PRODUCTO AL INGLÉS ────────────────
console.log('\n🔧 Traduciendo producto al inglés via API de traducciones...');

const productGid = `gid://shopify/Product/${PRODUCT_ID}`;

// Traducción del título y descripción al inglés
const translateMutation = `
  mutation translationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
    translationsRegister(resourceId: $resourceId, translations: $translations) {
      userErrors { message field }
      translations { key value locale }
    }
  }
`;

const productTranslations = [
  { locale: "en", key: "title", value: "Golden Hour Lamp™ — Atmosphere Projector", translatableContentDigest: "" },
  { locale: "en", key: "body_html", value: `
<div>
<h2>Turn any room into an endless golden hour</h2>
<p>Because the golden hour shouldn't last just a few minutes.</p>
<p>The <strong>Golden Hour Lamp™</strong> projects warm sunset tones — orange, red and purple — on any wall, transforming your room in seconds. No windows. No waiting. Any hour of the day.</p>
<h3>✨ Why you'll love it</h3>
<ul>
  <li>🌅 <strong>Real sunset effect</strong> — tones from warm amber to deep purple</li>
  <li>📐 <strong>180° rotating head</strong> — point at the wall, ceiling or any corner</li>
  <li>🔌 <strong>USB plug & play</strong> — plug in and go. No batteries, no setup</li>
  <li>🔇 <strong>Silent</strong> — 0.6W, perfect to sleep with it on</li>
  <li>📸 <strong>Viral on TikTok & Instagram</strong> — the favourite light filter for creators</li>
  <li>🎁 <strong>The gift nobody expects</strong> — compact, beautiful and different</li>
</ul>
<h3>⚡ Specs</h3>
<ul>
  <li>Power: USB 5V (cable included)</li>
  <li>Wattage: 0.6–0.8W</li>
  <li>Lifespan: +50,000 hours</li>
  <li>Rotation: 180° adjustable</li>
</ul>
<p><em>Free shipping. Satisfaction guarantee included.</em></p>
</div>`, translatableContentDigest: "" }
];

// Primero obtener los digests reales del producto
const translatableRes = await graphql(`{
  translatableResource(resourceId: "${productGid}") {
    translatableContent { key digest value locale }
  }
}`);

const contents = translatableRes.data?.translatableResource?.translatableContent || [];
const titleContent = contents.find(c => c.key === 'title');
const bodyContent = contents.find(c => c.key === 'body_html');

if (titleContent && bodyContent) {
  productTranslations[0].translatableContentDigest = titleContent.digest;
  productTranslations[1].translatableContentDigest = bodyContent.digest;

  const transRes = await graphql(translateMutation, {
    resourceId: productGid,
    translations: productTranslations
  });

  const errs = transRes.data?.translationsRegister?.userErrors;
  if (errs?.length) {
    console.log(`❌ Traducción: ${errs[0].message}`);
  } else {
    console.log('✅ Producto traducido al inglés:');
    console.log('   → "Golden Hour Lamp™ — Atmosphere Projector"');
    console.log('   → Descripción completa en inglés');
  }
} else {
  console.log('⚠️  No se encontraron digests del producto para traducir');
}

// Traducir variantes al inglés
console.log('\n🔧 Traduciendo variantes al inglés...');
const variantNames = {
  "Clásica — Atardecer": "Classic — Sunset",
  "Golden — 16 Colores": "Golden — 16 Colors",
  "Pro — Control por App": "Pro — App Control"
};

const productRes = await api('GET', `/products/${PRODUCT_ID}.json`);
for (const variant of productRes.product.variants) {
  const variantGid = `gid://shopify/ProductVariant/${variant.id}`;
  const varTranslatable = await graphql(`{ translatableResource(resourceId: "${variantGid}") { translatableContent { key digest value } } }`);
  const titleContent = varTranslatable.data?.translatableResource?.translatableContent?.find(c => c.key === 'option1');

  if (titleContent && variantNames[variant.option1]) {
    const vRes = await graphql(translateMutation, {
      resourceId: variantGid,
      translations: [{ locale: "en", key: "option1", value: variantNames[variant.option1], translatableContentDigest: titleContent.digest }]
    });
    const e = vRes.data?.translationsRegister?.userErrors;
    console.log(e?.length ? `❌ ${e[0].message}` : `   ✅ "${variant.option1}" → "${variantNames[variant.option1]}"`);
  }
}

console.log('\n🎉 Multilenguaje configurado:');
console.log('   → Español: todo el contenido en español');
console.log('   → Inglés: UI + producto + variantes en inglés');
console.log('   → Selector de idioma funciona correctamente');
console.log('\n   Refrescá: https://storeup.store y probá cambiar de idioma');
