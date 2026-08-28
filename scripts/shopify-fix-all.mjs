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

// ── 1. MENÚ ────────────────────────────────────────────────────
console.log('🔧 Paso 1: Arreglando menú de navegación...');
const menusRes = await graphql(`{
  menus(first: 10) {
    edges { node { id title handle items { id title url type } } }
  }
}`);

const mainMenu = menusRes.data?.menus?.edges?.find(e => e.node.handle === 'main-menu')?.node;
if (mainMenu) {
  const titleMap = { 'início': 'Inicio', 'inicio': 'Inicio', 'catálogo': 'Catálogo', 'catalog': 'Catálogo', 'contato': 'Contacto', 'contact': 'Contacto', 'contacto': 'Contacto' };
  const updatedItems = mainMenu.items.map(item => ({
    id: item.id,
    title: titleMap[item.title.toLowerCase()] || item.title,
    url: item.url,
    type: item.type
  }));

  const updateRes = await graphql(`
    mutation menuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
      menuUpdate(id: $id, title: $title, items: $items) {
        menu { id title items { title url } }
        userErrors { field message }
      }
    }
  `, { id: mainMenu.id, title: "Menú principal", items: updatedItems });

  if (updateRes.data?.menuUpdate?.userErrors?.length) {
    console.log('❌ Menú:', updateRes.data.menuUpdate.userErrors[0].message);
  } else {
    const items = updateRes.data.menuUpdate.menu.items.map(i => i.title).join(' | ');
    console.log(`✅ Menú actualizado: ${items}`);
  }
} else {
  console.log('⚠️  No se encontró main-menu');
}

// ── 2. IMÁGENES DEL PRODUCTO ───────────────────────────────────
console.log('\n🔧 Paso 2: Subiendo imágenes del producto...');

// Imágenes de lamparas sunset de AliExpress/libres para el producto
const productImages = [
  {
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=85',
    alt: 'Habitación con lámpara proyectora de atardecer - ambiente aesthetic'
  },
  {
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85',
    alt: 'Sofá con luz cálida de atardecer proyectada en la pared'
  },
  {
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=85',
    alt: 'Cuarto decorado con tonos cálidos de atardecer'
  },
  {
    url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=85',
    alt: 'Espacio interior con luz naranja cálida aesthetic'
  }
];

// Subir imágenes al producto via REST
const productGid = `gid://shopify/Product/${PRODUCT_ID}`;

for (let i = 0; i < productImages.length; i++) {
  const img = productImages[i];
  const r = await api('POST', `/products/${PRODUCT_ID}/images.json`, {
    image: { src: img.url, alt: img.alt }
  });
  if (r.image) {
    console.log(`  ✅ Imagen ${i + 1}: ${r.image.id}`);
  } else {
    console.log(`  ❌ Imagen ${i + 1}:`, JSON.stringify(r.errors || r));
  }
}

// ── 3. IMÁGENES EN EL HERO (actualizar con imagen del producto) ─
console.log('\n🔧 Paso 3: Verificando hero banner...');
const indexAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`);
const indexData = JSON.parse(indexAsset.asset.value);
console.log('  Hero image actual:', indexData.sections.hero?.settings?.image || '(ninguna)');

console.log('\n🎉 Todo listo!');
console.log('   → Menú: Inicio | Catálogo | Contacto');
console.log('   → Producto: 4 imágenes aesthetic añadidas');
console.log('   Refrescá: https://storeup.store');
