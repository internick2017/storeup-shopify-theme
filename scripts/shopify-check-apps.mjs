import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function graphql(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const options = {
      hostname: SHOP, path: '/admin/api/2025-01/graphql.json', method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

// Apps instaladas
console.log('📱 APPS INSTALADAS:\n');
const r = await graphql(`{
  appInstallations(first: 30) {
    edges { node {
      app { title developerName }
      accessScopes { handle }
    } }
  }
}`);

if (r.errors) { console.log('⚠️ ', r.errors[0].message); process.exit(0); }

const apps = r.data.appInstallations.edges;
let judgeme = false, dsers = false;
for (const { node } of apps) {
  const t = node.app.title;
  console.log(`   • ${t} (${node.app.developerName || ''})`);
  if (/judge/i.test(t)) judgeme = true;
  if (/dser/i.test(t)) dsers = true;
}

console.log('\n═══════════════════════════');
console.log(`   Judge.me (reseñas): ${judgeme ? '✅ instalada' : '❌ no detectada'}`);
console.log(`   DSers (fulfillment): ${dsers ? '✅ instalada' : '❌ no detectada'}`);

// Metafields de judge.me (para confirmar widget)
console.log('\n🔍 Metafields de reseñas:');
const mf = await graphql(`{
  product(id: "gid://shopify/Product/8737067827358") {
    metafields(first: 10, namespace: "judgeme") {
      edges { node { key value } }
    }
  }
}`);
const metas = mf.data?.product?.metafields?.edges || [];
if (metas.length) metas.forEach(m => console.log(`   ${m.node.key}: ${m.node.value?.substring(0,40)}`));
else console.log('   (sin reseñas todavía — normal, recién instalada)');
