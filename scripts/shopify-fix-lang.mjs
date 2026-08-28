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

// 1. Leer pt-BR.json y editar "Welcome to our store"
console.log('🔧 Editando locale pt-BR.json...');
const ptBR = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/pt-BR.json`);
const ptData = JSON.parse(ptBR.asset.value);

// Buscar y reemplazar "Welcome to our store" en todo el objeto
const ptStr = JSON.stringify(ptData)
  .replace(/Bem-vindo à nossa loja/g, '🚚 Envío gratuito a toda España')
  .replace(/Welcome to our store/g, '🚚 Envío gratuito a toda España')
  .replace(/Seja bem-vindo à nossa loja/g, '🚚 Envío gratuito a toda España');

const r1 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'locales/pt-BR.json', value: ptStr }
});
console.log(r1.errors ? `❌ ${JSON.stringify(r1.errors)}` : '✅ pt-BR.json: "Welcome" reemplazado');

// 2. Editar es.json para tener buenos textos en español
console.log('\n🔧 Actualizando locale es.json...');
const esAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/es.json`);
const esData = JSON.parse(esAsset.asset.value);

// Asegurarse que los textos clave están en español
if (!esData.sections) esData.sections = {};
esData.sections.announcement_bar = {
  ...(esData.sections.announcement_bar || {}),
  default_announcement: "🚚 Envío gratuito a toda España"
};

const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'locales/es.json', value: JSON.stringify(esData) }
});
console.log(r2.errors ? `❌ ${JSON.stringify(r2.errors)}` : '✅ es.json actualizado');

// 3. Habilitar español en la tienda
console.log('\n🌐 Habilitando español como idioma de la tienda...');
const r3 = await graphql(`
  mutation {
    shopLocaleEnable(locale: "es") {
      shopLocale { locale published }
      userErrors { field message }
    }
  }
`);
const e3 = r3.data?.shopLocaleEnable?.userErrors;
if (e3?.length) {
  console.log(e3[0].message.includes('already') ? '✅ Español ya estaba habilitado' : `❌ ${e3[0].message}`);
} else {
  console.log('✅ Español habilitado en la tienda');
}

// 4. Publicar español
const r4 = await graphql(`
  mutation {
    shopLocaleUpdate(locale: "es", shopLocale: { published: true }) {
      shopLocale { locale published }
      userErrors { field message }
    }
  }
`);
const e4 = r4.data?.shopLocaleUpdate?.userErrors;
console.log(e4?.length ? `❌ ${e4[0].message}` : '✅ Español publicado');

console.log('\n⚠️  Para cambiar el idioma PRINCIPAL de pt-BR a español:');
console.log('   Admin → Settings → Languages → Change default language → Español');
console.log('   URL: https://admin.shopify.com/store/yxx05u-wr/settings/languages');
console.log('\n🎉 Refrescá https://storeup.store');
