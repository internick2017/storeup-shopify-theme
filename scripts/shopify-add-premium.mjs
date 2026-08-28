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

// Obtener perfil e IDs
const res = await graphql(`{
  deliveryProfiles(first: 1) {
    edges { node {
      id
      profileLocationGroups {
        locationGroup { id }
        locationGroupZones(first: 20) {
          edges { node {
            zone { id name countries { code { countryCode } } }
          } }
        }
      }
    } }
  }
}`);

const profile = res.data.deliveryProfiles.edges[0].node;
const lg      = profile.profileLocationGroups[0];
const lgId    = lg.locationGroup.id;
let spainZoneId = null;

for (const { node } of lg.locationGroupZones.edges) {
  if (node.zone.countries.some(c => c.code.countryCode === 'ES')) {
    spainZoneId = node.zone.id;
  }
}

console.log('🔧 Agregando envío Premium con Garantía de Devolución...');

const r = await graphql(`
  mutation update($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id }
      userErrors { field message }
    }
  }
`, {
  id: profile.id,
  profile: {
    locationGroupsToUpdate: [{
      id: lgId,
      zonesToUpdate: [{
        id: spainZoneId,
        name: "España",
        countries: [{ code: "ES", includeAllProvinces: true }],
        methodDefinitionsToCreate: [{
          name: "Premium — Garantía de devolución",
          active: true,
          rateDefinition: { price: { amount: "4.99", currencyCode: "EUR" } }
        }]
      }]
    }]
  }
});

if (r.errors?.length) { console.error('❌', r.errors[0].message); process.exit(1); }
if (r.data?.deliveryProfileUpdate?.userErrors?.length) {
  console.error('❌', r.data.deliveryProfileUpdate.userErrors[0].message); process.exit(1);
}

console.log('✅ Listo. España ahora tiene:');
console.log('   → Envío Gratuito (gratis)');
console.log('   → Premium — Garantía de devolución (€4.99)');
