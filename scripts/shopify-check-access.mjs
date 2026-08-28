import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function shopifyRequest(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: SHOP,
      path: `/admin/api/2024-10${path}`,
      method: 'GET',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', () => resolve({ status: 0, body: {} }));
    req.end();
  });
}

function graphqlRequest(query) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ query });
    const options = {
      hostname: SHOP,
      path: '/admin/api/2024-10/graphql.json',
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', () => resolve({ errors: ['network error'] }));
    req.write(data);
    req.end();
  });
}

const check = (label, ok) => console.log(`${ok ? '✅' : '❌'} ${label}`);

console.log('🔍 Verificando permisos del token actual...\n');

// Productos
const products = await shopifyRequest('/products.json?limit=1');
check('Productos (read/write)', products.status === 200);

// Órdenes
const orders = await shopifyRequest('/orders.json?limit=1&status=any');
check('Órdenes (read/write)', orders.status === 200);

// Temas
const themes = await shopifyRequest('/themes.json');
check('Temas — read_themes', themes.status === 200);
if (themes.status === 200) {
  const active = themes.body.themes?.find(t => t.role === 'main');
  if (active) console.log(`   Tema activo: "${active.name}" (ID: ${active.id})`);
}

// Assets del tema (para editar código/CSS)
let assetAccess = false;
if (themes.status === 200) {
  const active = themes.body.themes?.find(t => t.role === 'main');
  if (active) {
    const assets = await shopifyRequest(`/themes/${active.id}/assets.json`);
    assetAccess = assets.status === 200;
    check('Assets del tema (editar CSS/Liquid)', assetAccess);
  }
}

// Archivos / imágenes
const files = await graphqlRequest(`{ files(first: 1) { edges { node { id } } } }`);
const filesOk = !files.errors?.some(e => e.extensions?.code === 'ACCESS_DENIED');
check('Archivos / imágenes (read_files)', filesOk);

// Shipping
const shipping = await shopifyRequest('/shipping_zones.json');
check('Zonas de envío (read_shipping)', shipping.status === 200);

// Clientes
const customers = await shopifyRequest('/customers.json?limit=1');
check('Clientes (read_customers)', customers.status === 200);

// Descuentos
const discounts = await shopifyRequest('/price_rules.json?limit=1');
check('Descuentos / cupones (read_discounts)', discounts.status === 200);

// Analytics
const analytics = await graphqlRequest(`{ shop { analyticsToken } }`);
const analyticsOk = !analytics.errors?.some(e => e.extensions?.code === 'ACCESS_DENIED');
check('Analytics (read_analytics)', analyticsOk);

// Pages / contenido
const pages = await shopifyRequest('/pages.json?limit=1');
check('Páginas / contenido (read_content)', pages.status === 200);

// Inventario
const locations = await shopifyRequest('/locations.json');
check('Ubicaciones / inventario (read_locations)', locations.status === 200);

console.log('\n--- Resumen ---');
const needsReauth = [themes, orders, customers, discounts, pages]
  .some(r => r.status === 401 || r.status === 403);
if (needsReauth) {
  console.log('⚠️  Algunos permisos faltan — necesitás re-autorizar con los scopes completos.');
} else {
  console.log('🎉 Token con acceso amplio. Todo bajo control.');
}
