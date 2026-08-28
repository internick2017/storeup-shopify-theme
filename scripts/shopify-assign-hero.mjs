import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const THEME_ID = '156532670622';

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

// 1. Buscar la imagen subida
console.log('🔍 Buscando imagen subida...\n');
const filesRes = await graphql(`{
  files(first: 5, sortKey: CREATED_AT, reverse: true) {
    edges { node {
      ... on MediaImage {
        id
        alt
        createdAt
        image { url width height }
      }
    } }
  }
}`);

if (filesRes.errors) { console.error('❌', filesRes.errors[0].message); process.exit(1); }

const files = filesRes.data.files.edges.filter(e => e.node.id);
console.log('Últimas imágenes en el CDN:');
files.forEach(({ node: f }) => {
  console.log(`  ID: ${f.id}`);
  console.log(`  URL: ${f.image?.url}`);
  console.log(`  Alt: ${f.alt}`);
  console.log('');
});

// Buscar la imagen de habitación que subimos
const heroImage = files.find(({ node: f }) =>
  f.alt?.includes('habitaci') || f.image?.url?.includes('unsplash') || f.image?.url?.includes('1616594')
)?.node;

if (!heroImage) {
  console.log('⚠️  No encontré la imagen específica, usando la más reciente...');
}

const targetImage = heroImage || files[0]?.node;
if (!targetImage) { console.error('❌ No hay imágenes disponibles'); process.exit(1); }

console.log(`✅ Imagen encontrada: ${targetImage.id}`);
console.log(`   URL: ${targetImage.image?.url}\n`);

// 2. Asignar al hero del index
// En Dawn, el image-banner referencia la imagen por su GID de Shopify
const indexAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`);
const indexData = JSON.parse(indexAsset.asset.value);

// Extraer filename y usar formato shopify://shop_images/
const cdnUrl = targetImage.image?.url || '';
const parts = cdnUrl.split('/files/');
const filename = parts[parts.length - 1]?.split('?')[0];
const shopifyImageUrl = `shopify://shop_images/${filename}`;
console.log(`   Formato Shopify: ${shopifyImageUrl}`);
indexData.sections.hero.settings.image = shopifyImageUrl;

const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "templates/index.json", value: JSON.stringify(indexData) }
});

if (r.errors) {
  console.error('❌ Error asignando imagen:', JSON.stringify(r.errors));
} else {
  console.log('✅ Imagen asignada al hero banner');
  console.log('\n   Refrescá https://storeup.store para ver el resultado');
}
