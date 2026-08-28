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

function graphql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const options = {
      hostname: SHOP,
      path: '/admin/api/2024-10/graphql.json',
      method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

// 1. Ver menús via GraphQL
console.log('🔍 Buscando menús...');
const menusRes = await graphql(`{
  menus(first: 10) {
    edges { node { id title handle items { id title url type } } }
  }
}`);

if (menusRes.errors) { console.error('❌', menusRes.errors[0].message); }
else {
  for (const { node: menu } of menusRes.data.menus.edges) {
    console.log(`  "${menu.title}" (${menu.handle})`);
    for (const item of menu.items) console.log(`    - ${item.title} → ${item.url}`);
  }
}

// 2. Actualizar menú principal via GraphQL
const mainMenu = menusRes.data?.menus?.edges?.find(e => e.node.handle === 'main-menu')?.node;
if (mainMenu) {
  console.log('\n🔧 Traduciendo menú al español...');
  const updateMenu = await graphql(`
    mutation menuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
      menuUpdate(id: $id, title: $title, items: $items) {
        menu { id title }
        userErrors { field message }
      }
    }
  `, {
    id: mainMenu.id,
    title: "Menú principal",
    items: mainMenu.items.map(item => {
      const titleMap = { 'início': 'Inicio', 'início': 'Inicio', 'catálogo': 'Catálogo', 'catalog': 'Catálogo', 'contato': 'Contacto', 'contact': 'Contacto' };
      const newTitle = titleMap[item.title.toLowerCase()] || item.title;
      return { id: item.id, title: newTitle, url: item.url, type: item.type };
    })
  });
  if (updateMenu.data?.menuUpdate?.userErrors?.length) {
    console.log('⚠️ ', updateMenu.data.menuUpdate.userErrors[0].message);
  } else {
    console.log('✅ Menú actualizado');
  }
}

// 3. Actualizar announcement bar y agregar imagen hero
console.log('\n🔧 Actualizando settings del tema...');
const currentSettings = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`);
const settingsData = JSON.parse(currentSettings.asset.value);
const presetKey = settingsData.current;

// Announcement bar en español con colores de la marca
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

const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "config/settings_data.json", value: JSON.stringify(settingsData) }
});
if (r.errors) console.log('❌', r.errors);
else console.log('✅ Announcement bar actualizado');

// 4. Actualizar index para quitar imagen genérica del hero (usar color puro)
console.log('\n🔧 Actualizando hero para usar fondo de color en vez de imagen genérica...');
const indexAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`);
const indexData = JSON.parse(indexAsset.asset.value);

// Cambiar hero a slideshow sin imagen (solo color del scheme-3)
indexData.sections.hero.settings.color_scheme = "scheme-3";
indexData.sections.hero.settings.image_height = "large";
indexData.sections.hero.settings.show_text_box = true;
indexData.sections.hero.settings.desktop_content_position = "middle-center";

const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "templates/index.json", value: JSON.stringify(indexData) }
});
if (r2.errors) console.log('❌', r2.errors);
else console.log('✅ Hero actualizado');

console.log('\n🎉 Cambios aplicados. Refrescá https://storeup.store');
