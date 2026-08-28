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

function api(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: SHOP,
      path: `/admin/api/2024-10${path}`,
      method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', ...(data && { 'Content-Length': Buffer.byteLength(data) }) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Subir imagen de hero desde URL pública (imagen de habitación aesthetic con luces cálidas)
// Usando imagen de Unsplash (libre de uso)
console.log('📸 Subiendo imagen hero al CDN de Shopify...');

const uploadRes = await graphql(`
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        ... on MediaImage {
          id
          image { url }
        }
      }
      userErrors { field message }
    }
  }
`, {
  files: [{
    alt: "Habitación con ambiente aesthetic y luces cálidas",
    contentType: "IMAGE",
    originalSource: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80"
  }]
});

if (uploadRes.data?.fileCreate?.userErrors?.length) {
  console.log('❌', uploadRes.data.fileCreate.userErrors[0].message);
  process.exit(1);
}

console.log('✅ Imagen subida al CDN de Shopify');
console.log('   (puede tardar unos segundos en procesarse)\n');

// Actualizar el hero del index para usar la imagen subida
// En Dawn el image-banner usa una imagen referenciada por ID
// La imagen necesita procesarse primero, así que actualizamos el index con la URL externa
const indexAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`);
const indexData = JSON.parse(indexAsset.asset.value);

// Actualizar hero con imagen externa mientras se procesa la de Shopify
indexData.sections.hero.settings.color_scheme = "scheme-3";
indexData.sections.hero.settings.image_overlay_opacity = 60;
// La imagen se asigna desde el admin o via media ID

const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: "templates/index.json", value: JSON.stringify(indexData) }
});

console.log('✅ Hero configurado con overlay oscuro para mejor legibilidad del texto');
console.log('\n📋 Para asignar la imagen al hero:');
console.log('   Admin → Online Store → Themes → Customize → Index → Image Banner');
console.log('   O en: https://admin.shopify.com/store/yxx05u-wr/themes/156532670622/editor');
