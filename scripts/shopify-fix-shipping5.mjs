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
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Obtener IDs
const query = `{
  deliveryProfiles(first: 1) {
    edges {
      node {
        id
        profileLocationGroups {
          locationGroup { id }
          locationGroupZones(first: 20) {
            edges {
              node {
                zone {
                  id name
                  countries { id name code { countryCode } }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

const res = await graphql(query);
const profile   = res.data.deliveryProfiles.edges[0].node;
const profileId = profile.id;
const lg        = profile.profileLocationGroups[0];
const lgId      = lg.locationGroup.id;

let brazilZoneId    = null;
let intlZoneId      = null;
let spainCountryIds = [];

for (const { node: { zone } } of lg.locationGroupZones.edges) {
  if (zone.countries.some(c => c.code.countryCode === 'BR')) {
    brazilZoneId = zone.id;
  }
  if (zone.countries.some(c => c.code.countryCode === 'ES')) {
    intlZoneId = zone.id;
    // Sacar España Y Canarias si están
    spainCountryIds = zone.countries
      .filter(c => c.code.countryCode === 'ES')
      .map(c => c.id);
    console.log(`España en zona "${zone.name}":`, spainCountryIds);
  }
}

const mutation = `
  mutation update($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id }
      userErrors { field message }
    }
  }
`;

// PASO 1: Sacar España de Internacional + Eliminar zona Brasil
console.log('\n🔧 Paso 1: Sacando España de zona Internacional y eliminando Brasil...');

const step1 = {
  id: profileId,
  profile: {
    zonesToDelete: [brazilZoneId],
    locationGroupsToUpdate: [
      {
        id: lgId,
        zonesToUpdate: [
          {
            id: intlZoneId,
            countriesToDelete: spainCountryIds
          }
        ]
      }
    ]
  }
};

const r1 = await graphql(mutation, step1);
if (r1.errors?.length) { console.error('❌', r1.errors[0].message); process.exit(1); }
if (r1.data?.deliveryProfileUpdate?.userErrors?.length) {
  console.error('❌', r1.data.deliveryProfileUpdate.userErrors[0].message);
  process.exit(1);
}
console.log('✅ España removida de Internacional. Brasil eliminado.');

// PASO 2: Crear zona España como Domestic
console.log('\n🔧 Paso 2: Creando zona España con envío gratis...');

const step2 = {
  id: profileId,
  profile: {
    locationGroupsToUpdate: [
      {
        id: lgId,
        zonesToCreate: [
          {
            name: "España",
            countries: [{ code: "ES", includeAllProvinces: true }],
            methodDefinitionsToCreate: [
              {
                name: "Envío Gratuito",
                active: true,
                rateDefinition: { price: { amount: "0.00", currencyCode: "EUR" } }
              },
              {
                name: "Envío Express (3-5 días hábiles)",
                active: true,
                rateDefinition: { price: { amount: "4.99", currencyCode: "EUR" } }
              }
            ]
          }
        ]
      }
    ]
  }
};

const r2 = await graphql(mutation, step2);
if (r2.errors?.length) { console.error('❌', r2.errors[0].message); process.exit(1); }
if (r2.data?.deliveryProfileUpdate?.userErrors?.length) {
  console.error('❌', r2.data.deliveryProfileUpdate.userErrors[0].message);
  process.exit(1);
}

console.log('✅ Zona España creada: Envío Gratis + Express €4.99');
console.log('\n🎉 ¡Listo! Zonas de envío actualizadas:');
console.log('   → España: Envío Gratis (principal)');
console.log('   → Internacional: resto del mundo');
console.log('\n   Verificá: https://admin.shopify.com/store/yxx05u-wr/settings/shipping');
