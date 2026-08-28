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

// Leer settings_data actual
const settingsAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`);
const settingsData = JSON.parse(settingsAsset.asset.value);

// El objeto de settings está en settingsData.current directamente
const preset = settingsData.current;

console.log('🎨 Aplicando tema dark premium (estilo Encalife)...');

// Paleta oscura dramática con nuestro naranja sunset
preset.color_schemes = {
  "scheme-1": { settings: {
    background: "#0D0D14",
    background_gradient: "",
    text: "#F5F5F0",
    button: "#E8610A",
    button_label: "#FFFFFF",
    secondary_button_label: "#E8610A",
    shadow: "#000000"
  }},
  "scheme-2": { settings: {
    background: "#13131E",
    background_gradient: "",
    text: "#E8E8E0",
    button: "#E8610A",
    button_label: "#FFFFFF",
    secondary_button_label: "#E8610A",
    shadow: "#000000"
  }},
  "scheme-3": { settings: {
    background: "#1A0A00",
    background_gradient: "linear-gradient(135deg, #1A0A00 0%, #2D1500 50%, #1A1A2E 100%)",
    text: "#FFFFFF",
    button: "#E8610A",
    button_label: "#FFFFFF",
    secondary_button_label: "#FFB380",
    shadow: "#000000"
  }},
  "scheme-4": { settings: {
    background: "#000000",
    background_gradient: "",
    text: "#FFFFFF",
    button: "#E8610A",
    button_label: "#FFFFFF",
    secondary_button_label: "#FFFFFF",
    shadow: "#000000"
  }},
  "scheme-5": { settings: {
    background: "#E8610A",
    background_gradient: "",
    text: "#FFFFFF",
    button: "#000000",
    button_label: "#FFFFFF",
    secondary_button_label: "#FFFFFF",
    shadow: "#000000"
  }}
};

// Ajustes de estilo
preset.card_color_scheme = "scheme-2";
preset.card_corner_radius = 12;
preset.card_shadow_opacity = 0;
preset.buttons_radius = 4;
preset.animations_hover_elements = "image";

const r1 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "config/settings_data.json", value: JSON.stringify(settingsData) }
});
console.log(r1.errors ? `❌ ${JSON.stringify(r1.errors)}` : '✅ Tema dark premium aplicado');

// Homepage
console.log('\n📝 Actualizando homepage...');
const indexAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`);
const indexData = JSON.parse(indexAsset.asset.value);

// Hero
indexData.sections.hero.blocks.heading.settings.heading = "La hora dorada, a cualquier hora";
if (!indexData.sections.hero.blocks.subheading) {
  indexData.sections.hero.blocks.subheading = { type: "text", settings: { text: "" } };
}
indexData.sections.hero.blocks.subheading.settings.text = "Transforma tu cuarto en un atardecer infinito — sin ventanas, sin esperar";
indexData.sections.hero.blocks.button.settings.button_label_1 = "Conseguir mi Golden Hour";
indexData.sections.hero.settings.color_scheme = "scheme-3";
indexData.sections.hero.settings.image_overlay_opacity = 70;
if (!indexData.sections.hero.block_order.includes('subheading')) {
  indexData.sections.hero.block_order = ['heading', 'subheading', 'button'];
}

// Features
indexData.sections.features.blocks.col1.settings.title = "🌅 Atardecer en segundos";
indexData.sections.features.blocks.col1.settings.text = "<p>Enciéndela y tu cuarto cambia. Sin esperar. A cualquier hora del día o de la noche.</p>";
indexData.sections.features.blocks.col2.settings.title = "🎨 Tu cuarto, tu ambiente";
indexData.sections.features.blocks.col2.settings.text = "<p>Gaming, meditación, streaming, descanso. La Golden Hour se adapta a tu momento.</p>";
indexData.sections.features.blocks.col3.settings.title = "🚚 Envío gratis a España";
indexData.sections.features.blocks.col3.settings.text = "<p>Entrega en 15-25 días. Garantía de satisfacción incluida. Sin riesgos.</p>";
indexData.sections.features.settings.color_scheme = "scheme-2";

// Colección
indexData.sections.featured_collection.settings.title = "Elige tu Golden Hour";
indexData.sections.featured_collection.settings.color_scheme = "scheme-1";
indexData.sections.featured_collection.settings.quick_add = "standard";

// Trust
indexData.sections.trust_badges.blocks.heading.settings.heading = "Miles de cuartos transformados";
indexData.sections.trust_badges.blocks.text.settings.text = "<p>⭐⭐⭐⭐⭐ +500 clientes &nbsp;|&nbsp; 🚚 Envío gratis &nbsp;|&nbsp; ↩️ Garantía &nbsp;|&nbsp; 🔒 Pago seguro</p>";
indexData.sections.trust_badges.settings.color_scheme = "scheme-4";

const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "templates/index.json", value: JSON.stringify(indexData) }
});
console.log(r2.errors ? `❌ ${JSON.stringify(r2.errors)}` : '✅ Homepage actualizada con copy emocional');

console.log('\n🎉 Resumen completo de la tienda:');
console.log('   🛍️  Producto: "Lámpara Golden Hour™ — Proyector de Ambiente"');
console.log('   💰 Variantes: Clásica €24.99 | 16 Colores €34.99 | Pro App €44.99');
console.log('   🎨 Tema: dark premium (negro + naranja sunset)');
console.log('   📝 Copy: "La hora dorada, a cualquier hora"');
console.log('   🌍 Idiomas: Español (España) + Inglés (UK/USA)');
console.log('   🚚 Envíos: Gratis España + Internacional');
console.log('\n   → https://storeup.store');
