import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

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

// Obtener el ID del método Express
const res = await graphql(`{
  deliveryProfiles(first: 1) {
    edges { node {
      id
      profileLocationGroups {
        locationGroupZones(first: 20) {
          edges { node {
            zone { name countries { code { countryCode } } }
            methodDefinitions(first: 10) {
              edges { node { id name active } }
            }
          } }
        }
      }
    } }
  }
}`);

const profile = res.data.deliveryProfiles.edges[0].node;
let expressId = null;

for (const lg of profile.profileLocationGroups) {
  for (const { node } of lg.locationGroupZones.edges) {
    const isSpain = node.zone.countries.some(c => c.code.countryCode === 'ES');
    if (isSpain) {
      console.log(`Zona España — métodos de envío:`);
      for (const { node: method } of node.methodDefinitions.edges) {
        console.log(`  - "${method.name}" (${method.id})`);
        if (method.name.toLowerCase().includes('express')) {
          expressId = method.id;
        }
      }
    }
  }
}

if (!expressId) {
  console.log('\n✅ No se encontró método Express — nada que eliminar.');
  process.exit(0);
}

console.log(`\n🔧 Eliminando método Express (${expressId})...`);

const r = await graphql(`
  mutation update($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id }
      userErrors { field message }
    }
  }
`, {
  id: profile.id,
  profile: { methodDefinitionsToDelete: [expressId] }
});

if (r.errors?.length) { console.error('❌', r.errors[0].message); process.exit(1); }
if (r.data?.deliveryProfileUpdate?.userErrors?.length) {
  console.error('❌', r.data.deliveryProfileUpdate.userErrors[0].message); process.exit(1);
}

console.log('✅ Envío Express eliminado.');
console.log('   España queda con: Envío Gratuito únicamente.');
