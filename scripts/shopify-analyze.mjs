import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const THEME_ID = '156532670622';

function api(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOP, path: `/admin/api/2024-10${path}`, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.end();
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

console.log('═══════════════════════════════════════════════');
console.log('  ANÁLISIS COMPLETO DE STORE UP');
console.log('═══════════════════════════════════════════════\n');

// 1. IDIOMAS
console.log('📍 1. IDIOMAS DE LA TIENDA');
const locales = await graphql(`{ shopLocales { locale name primary published } }`);
locales.data?.shopLocales?.forEach(l => {
  console.log(`   ${l.primary ? '★ PRIMARIO' : '  secundario'}: ${l.name} (${l.locale}) — publicado: ${l.published}`);
});

// 2. MERCADOS
console.log('\n📍 2. MERCADOS');
const markets = await graphql(`{
  markets(first: 10) {
    edges { node {
      id name primary enabled
      regions(first: 50) { edges { node { ... on MarketRegionCountry { name code } } } }
    } }
  }
}`);
markets.data?.markets?.edges?.forEach(({ node: m }) => {
  const regions = m.regions.edges.map(e => e.node.code).join(', ');
  console.log(`   ${m.primary ? '★' : ' '} ${m.name} — ${m.enabled ? 'activo' : 'inactivo'} — países: ${regions || '(ninguno/resto)'}`);
});

// 3. ARCHIVOS LOCALE EN EL TEMA
console.log('\n📍 3. ARCHIVOS LOCALE EN EL TEMA');
const allAssets = await api('GET', `/themes/${THEME_ID}/assets.json`);
const localeFiles = allAssets.assets.filter(a => a.key.startsWith('locales/') && !a.key.includes('schema'));
localeFiles.forEach(f => {
  const isDefault = f.key.includes('.default');
  console.log(`   ${isDefault ? '★ DEFAULT' : '         '} ${f.key}`);
});

// 4. CONTENIDO ESTÁTICO TRADUCIBLE DEL TEMA (templates/index.json)
console.log('\n📍 4. CONTENIDO ESTÁTICO TRADUCIBLE (hero, features, etc.)');
const themeGid = `gid://shopify/OnlineStoreTheme/${THEME_ID}`;
const translatable = await graphql(`{
  translatableResources(first: 20, resourceType: ONLINE_STORE_THEME_JSON_TEMPLATE) {
    edges { node {
      resourceId
      translatableContent { key value digest locale }
    } }
  }
}`);

if (translatable.errors) {
  console.log('   ❌ Error:', translatable.errors[0].message);
} else {
  const resources = translatable.data?.translatableResources?.edges || [];
  console.log(`   Recursos JSON template encontrados: ${resources.length}`);
  for (const { node } of resources) {
    const indexContent = node.translatableContent.filter(c =>
      c.value && (c.value.includes('hora dorada') || c.value.includes('Golden') || c.value.includes('atardecer') || c.value.includes('Atardecer') || c.value.includes('cuartos') || c.value.includes('ambiente'))
    );
    if (indexContent.length) {
      console.log(`\n   Recurso: ${node.resourceId.split('/').pop()}`);
      indexContent.slice(0, 8).forEach(c => {
        console.log(`     • [${c.key.substring(0, 40)}...]`);
        console.log(`       "${c.value.substring(0, 60)}${c.value.length > 60 ? '...' : ''}"`);
      });
    }
  }
}

// 5. PRODUCTO - traducciones registradas
console.log('\n📍 5. PRODUCTO — TRADUCCIONES REGISTRADAS');
const productGid = `gid://shopify/Product/8737067827358`;
const prodTrans = await graphql(`{
  translatableResource(resourceId: "${productGid}") {
    translatableContent { key locale }
    translations(locale: "en") { key value }
  }
}`);
if (prodTrans.data?.translatableResource) {
  const enTrans = prodTrans.data.translatableResource.translations || [];
  console.log(`   Traducciones EN registradas: ${enTrans.length}`);
  enTrans.forEach(t => console.log(`     • ${t.key}: "${(t.value||'').substring(0, 50)}..."`));
}

console.log('\n═══════════════════════════════════════════════');
console.log('  FIN DEL ANÁLISIS');
console.log('═══════════════════════════════════════════════');
