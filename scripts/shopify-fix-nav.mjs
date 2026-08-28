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
      hostname: SHOP,
      path: `/admin/api/2024-10${path}`,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) })
      },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// 1. Ver menús actuales
console.log('🔍 Menús actuales:\n');
const menus = await api('GET', '/menus.json');
for (const menu of menus.menus) {
  console.log(`  "${menu.title}" (handle: ${menu.handle})`);
  for (const item of menu.items) {
    console.log(`    - ${item.title} → ${item.url}`);
  }
}

// 2. Actualizar menú principal (main-menu) a español
const mainMenu = menus.menus.find(m => m.handle === 'main-menu');
if (mainMenu) {
  console.log('\n🔧 Traduciendo menú principal al español...');
  const r = await api('PUT', `/menus/${mainMenu.id}.json`, {
    menu: {
      id: mainMenu.id,
      title: "Menú principal",
      items: [
        { title: "Inicio", type: "frontpage_link", url: "/" },
        { title: "Catálogo", type: "catalog_link", url: "/collections/all" },
        { title: "Contacto", type: "page_link", url: "/pages/contact" }
      ]
    }
  });
  if (r.menu) console.log('✅ Menú principal actualizado');
  else console.log('❌', JSON.stringify(r));
}

// 3. Actualizar announcement bar y header en el layout
console.log('\n🔧 Actualizando announcement bar y header...');

// Leer el sections/announcement-bar.json si existe, o buscar en layout
const headerSection = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=sections/announcement-bar.liquid`);
console.log('Announcement bar asset encontrado:', !!headerSection.asset);

// Actualizar la sección announcement bar vía settings del tema
// Buscar en config/settings_data.json el announcement bar
const currentSettings = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`);
const settingsData = JSON.parse(currentSettings.asset.value);

// El announcement bar en Dawn está en sections dentro de la homepage o el layout
// Actualizar via template del index para incluir el announcement
console.log('\n🔧 Buscando sección announcement-bar en el layout...');
const layoutAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=layout/theme.liquid`);
const layoutContent = layoutAsset.asset?.value || '';
const hasAnnouncement = layoutContent.includes('announcement-bar');
console.log('Announcement bar en layout:', hasAnnouncement);

// 4. Actualizar header section settings
console.log('\n🔧 Actualizando sections del index con announcement en español...');

// Leer index.json actual
const indexAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`);
const indexData = JSON.parse(indexAsset.asset.value);

// Agregar announcement bar al index si no existe
// En Dawn el announcement bar es una sección global en el layout
// Lo actualizamos via el sections de settings_data

// Agregar announcement al settings global
if (!settingsData.current) settingsData.current = settingsData.presets ? Object.keys(settingsData.presets)[0] : 'Dawn';
const presetKey = settingsData.current;

if (!settingsData.presets[presetKey].sections) {
  settingsData.presets[presetKey].sections = {};
}

settingsData.presets[presetKey].sections['announcement-bar'] = {
  type: "announcement-bar",
  blocks: {
    "announcement-1": {
      type: "announcement",
      settings: {
        text: "🚚 Envío gratuito a toda España • Devolución garantizada",
        text_alignment: "center",
        link: ""
      }
    }
  },
  block_order: ["announcement-1"],
  settings: {
    color_scheme: "scheme-5",
    auto_rotate: false,
    change_slides_speed: 5
  }
};

const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "config/settings_data.json", value: JSON.stringify(settingsData) }
});
if (r2.errors) console.log('❌ settings_data:', r2.errors);
else console.log('✅ Announcement bar actualizado en español');

console.log('\n🎉 Navegación y textos actualizados:');
console.log('   → Menú: Inicio | Catálogo | Contacto');
console.log('   → Banner: "Envío gratuito a toda España"');
