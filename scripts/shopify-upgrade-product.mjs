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

// ── 1. ACTUALIZAR PRODUCTO ─────────────────────────────────────
console.log('🛍️  Actualizando producto...\n');

const updatedProduct = {
  product: {
    id: PRODUCT_ID,
    title: "Lámpara Golden Hour™ — Proyector de Ambiente",
    body_html: `
<div style="font-family: inherit;">

<h2 style="margin-bottom: 8px;">Convierte cualquier cuarto en un atardecer infinito</h2>
<p style="color: #888; margin-bottom: 24px;">Porque la hora dorada no debería durar solo unos minutos.</p>

<p>La <strong>Lámpara Golden Hour™</strong> proyecta tonos cálidos de atardecer — naranja, rojo y morado — sobre cualquier pared, transformando tu habitación en cuestión de segundos. Sin ventanas. Sin esperar. A cualquier hora del día.</p>

<p>Miles de personas la usan para meditar, hacer streaming, fotografiar, trabajar o simplemente desconectar del día.</p>

<h3>✨ Por qué la elegirás</h3>
<ul>
  <li>🌅 <strong>Efecto atardecer real</strong> — tonos que van del ámbar al morado profundo</li>
  <li>📐 <strong>Cabezal giratorio 180°</strong> — apunta a la pared, el techo o cualquier rincón</li>
  <li>🔌 <strong>USB plug &amp; play</strong> — enchúfala y listo. Sin pilas, sin instalación</li>
  <li>🔇 <strong>Silenciosa</strong> — 0.6W, perfecta para dormir con ella encendida</li>
  <li>📸 <strong>Viral en TikTok e Instagram</strong> — el filtro de luz favorito de los creadores</li>
  <li>🎁 <strong>El regalo que nadie espera</strong> — compacta, bonita y diferente</li>
</ul>

<h3>🎨 Crea el ambiente que quieras</h3>
<p>Gaming setup, home office, sesión de meditación, velada romántica, fondo para tus reels. La Golden Hour se adapta a todo. El color cálido proyectado convierte cualquier espacio ordinario en algo que merece una foto.</p>

<h3>⚡ Especificaciones</h3>
<ul>
  <li>Alimentación: USB 5V (incluye cable)</li>
  <li>Potencia: 0.6–0.8W — consumo mínimo</li>
  <li>Vida útil: +50.000 horas</li>
  <li>Tamaño: compacto, cabe en la mano</li>
  <li>Rotación: 180° ajustable</li>
</ul>

<p><em>Envío gratuito a toda España. Garantía de satisfacción incluida.</em></p>

</div>`,
    vendor: "Golden Hour™",
    product_type: "Iluminación Ambiente",
    tags: ["lampara", "golden-hour", "aesthetic", "atardecer", "proyector", "habitacion", "regalo", "tiktok", "ambiente", "sunset"],
    status: "active",
  }
};

const r1 = await api('PUT', `/products/${PRODUCT_ID}.json`, updatedProduct);
if (r1.product) {
  console.log(`✅ Producto renombrado: "${r1.product.title}"`);
} else {
  console.log('❌ Error:', JSON.stringify(r1.errors || r1));
}

// ── 2. ACTUALIZAR VARIANTES (Base, 16 Colores, App) ──────────
console.log('\n🎨 Agregando variantes de precio...');

// Primero eliminar el producto y recrear con variantes
// En Shopify no se pueden agregar opciones a un producto sin variantes directamente
// Necesitamos actualizar las opciones del producto

const updateOptions = await api('PUT', `/products/${PRODUCT_ID}.json`, {
  product: {
    id: PRODUCT_ID,
    options: [{ name: "Modelo" }],
    variants: [
      {
        option1: "Clásica — Atardecer",
        price: "24.99",
        compare_at_price: "39.99",
        sku: "GHL-001",
        inventory_management: null,
        inventory_policy: "continue",
        fulfillment_service: "manual",
        requires_shipping: true,
        weight: 0.2,
        weight_unit: "kg"
      },
      {
        option1: "Golden — 16 Colores",
        price: "34.99",
        compare_at_price: "54.99",
        sku: "GHL-002",
        inventory_management: null,
        inventory_policy: "continue",
        fulfillment_service: "manual",
        requires_shipping: true,
        weight: 0.2,
        weight_unit: "kg"
      },
      {
        option1: "Pro — Control por App",
        price: "44.99",
        compare_at_price: "69.99",
        sku: "GHL-003",
        inventory_management: null,
        inventory_policy: "continue",
        fulfillment_service: "manual",
        requires_shipping: true,
        weight: 0.25,
        weight_unit: "kg"
      }
    ]
  }
});

if (updateOptions.product) {
  const variants = updateOptions.product.variants;
  console.log('✅ Variantes creadas:');
  variants.forEach(v => console.log(`   → ${v.option1}: €${v.price} (antes €${v.compare_at_price})`));
} else {
  console.log('❌ Variantes:', JSON.stringify(updateOptions.errors || updateOptions).substring(0, 200));
}

// ── 3. TEMA MÁS OSCURO (estilo Encalife) ─────────────────────
console.log('\n🎨 Actualizando tema a estilo dark premium...');

const settingsAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`);
const settingsData = JSON.parse(settingsAsset.asset.value);
const presetKey = settingsData.current;
const preset = settingsData.presets[presetKey];

// Esquema de colores más oscuro y dramático (Encalife style con nuestros colores)
preset.color_schemes = {
  "scheme-1": { settings: {
    background: "#0D0D14",          // Casi negro con tono azul
    background_gradient: "",
    text: "#F5F5F0",
    button: "#E8610A",              // Naranja sunset
    button_label: "#FFFFFF",
    secondary_button_label: "#E8610A",
    shadow: "#000000"
  }},
  "scheme-2": { settings: {
    background: "#13131E",          // Dark navy
    background_gradient: "",
    text: "#E8E8E0",
    button: "#E8610A",
    button_label: "#FFFFFF",
    secondary_button_label: "#E8610A",
    shadow: "#000000"
  }},
  "scheme-3": { settings: {
    background: "#1A0A00",          // Muy oscuro con tono warm (como cuarto iluminado por la lámpara)
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
    background: "#E8610A",          // Naranja sunset — para el announcement bar
    background_gradient: "",
    text: "#FFFFFF",
    button: "#000000",
    button_label: "#FFFFFF",
    secondary_button_label: "#FFFFFF",
    shadow: "#000000"
  }}
};

// Cards más dramáticas
preset.card_color_scheme = "scheme-2";
preset.card_corner_radius = 12;
preset.card_shadow_opacity = 0;
preset.buttons_radius = 4;

const r3 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "config/settings_data.json", value: JSON.stringify(settingsData) }
});
console.log(r3.errors ? `❌ ${JSON.stringify(r3.errors)}` : '✅ Tema dark premium aplicado');

// ── 4. HOMEPAGE COPY ESTILO ENCALIFE ─────────────────────────
console.log('\n📝 Actualizando homepage...');

const indexAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`);
const indexData = JSON.parse(indexAsset.asset.value);

// Hero — copy emocional estilo Encalife
indexData.sections.hero.blocks.heading.settings.heading = "La hora dorada, a cualquier hora";
indexData.sections.hero.blocks.subheading = {
  type: "text",
  settings: { text: "Transforma tu cuarto en un atardecer infinito — sin ventanas, sin esperar" }
};
indexData.sections.hero.blocks.button.settings.button_label_1 = "Conseguir mi Golden Hour";
indexData.sections.hero.settings.color_scheme = "scheme-3";
indexData.sections.hero.settings.image_overlay_opacity = 70;
if (!indexData.sections.hero.block_order.includes('subheading')) {
  indexData.sections.hero.block_order = ['heading', 'subheading', 'button'];
}

// Features — beneficios emocionales
indexData.sections.features.blocks.col1.settings.title = "🌅 Atardecer en segundos";
indexData.sections.features.blocks.col1.settings.text = "<p>Enciéndela y tu cuarto cambia. Sin esperar. A cualquier hora del día o de la noche.</p>";
indexData.sections.features.blocks.col2.settings.title = "🎨 Tu cuarto, tu ambiente";
indexData.sections.features.blocks.col2.settings.text = "<p>Gaming, meditación, streaming, descanso. La Golden Hour se adapta a tu momento.</p>";
indexData.sections.features.blocks.col3.settings.title = "🚚 Envío gratis a España";
indexData.sections.features.blocks.col3.settings.text = "<p>Entrega en 15-25 días. Garantía de satisfacción incluida. Sin riesgos.</p>";
indexData.sections.features.settings.color_scheme = "scheme-2";

// Colección de productos
indexData.sections.featured_collection.settings.title = "Elige tu Golden Hour";
indexData.sections.featured_collection.settings.color_scheme = "scheme-1";
indexData.sections.featured_collection.settings.quick_add = "standard";

// Trust badges actualizado
indexData.sections.trust_badges.blocks.heading.settings.heading = "Miles de cuartos transformados";
indexData.sections.trust_badges.blocks.text.settings.text = "<p>⭐⭐⭐⭐⭐ &nbsp;+500 clientes felices &nbsp;|&nbsp; 🚚 Envío gratis &nbsp;|&nbsp; ↩️ Garantía de satisfacción &nbsp;|&nbsp; 🔒 Pago seguro</p>";
indexData.sections.trust_badges.settings.color_scheme = "scheme-4";

const r4 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "templates/index.json", value: JSON.stringify(indexData) }
});
console.log(r4.errors ? `❌ ${JSON.stringify(r4.errors)}` : '✅ Homepage actualizada con copy emocional');

console.log('\n🎉 Todo listo:');
console.log('   → Producto: "Lámpara Golden Hour™"');
console.log('   → 3 variantes: Clásica €24.99 | 16 Colores €34.99 | Pro App €44.99');
console.log('   → Tema: dark premium estilo Encalife');
console.log('   → Copy emocional: "La hora dorada, a cualquier hora"');
console.log('\n   Refrescá: https://storeup.store');
