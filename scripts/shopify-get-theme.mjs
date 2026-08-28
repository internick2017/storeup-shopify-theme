import https from 'https';
import { readFileSync, writeFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const THEME_ID = '156532670622'; // Dawn

function shopifyGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOP,
      path: `/admin/api/2024-10${path}`,
      method: 'GET',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.end();
  });
}

// Leer settings_data.json
const asset = await shopifyGet(`/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`);
writeFileSync('f:\\tmp\\settings_data.json', JSON.stringify(JSON.parse(asset.asset.value), null, 2));
console.log('✅ settings_data.json guardado en f:\\tmp\\settings_data.json');

// Leer index template
const index = await shopifyGet(`/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`);
writeFileSync('f:\\tmp\\index_template.json', JSON.stringify(JSON.parse(index.asset.value), null, 2));
console.log('✅ templates/index.json guardado en f:\\tmp\\index_template.json');
