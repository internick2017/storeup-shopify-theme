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

// 1. Obtener IDs
console.log('🔍 Obteniendo IDs del perfil...\n');

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
if (res.errors) { console.error('❌', res.errors[0].message); process.exit(1); }

const profile     = res.data.deliveryProfiles.edges[0].node;
const profileId   = profile.id;
const lg          = profile.profileLocationGroups[0];
const lgId        = lg.locationGroup.id;

let brazilZoneId  = null;
let intlZoneId    = null;
let spainCountryId = null;

for (const { node: { zone } } of lg.locationGroupZones.edges) {
  if (zone.countries.some(c => c.code.countryCode === 'BR')) {
    brazilZoneId = zone.id;
    console.log(`  Zona Brasil: ${zone.id}`);
  }
  if (zone.countries.some(c => c.code.countryCode === 'ES') && !zone.countries.some(c => c.code.countryCode === 'BR')) {
    intlZoneId   = zone.id;
    spainCountryId = zone.countries.find(c => c.code.countryCode === 'ES').id;
    console.log(`  Zona Internacional (España dentro): ${zone.id}`);
  }
}

// 2. Eliminar zona Brasil y crear España (zonesToDelete va en el root de profile)
console.log('\n🔧 Actualizando zonas...');

const mutation = `
  mutation update($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id name }
      userErrors { field message }
    }
  }
`;

const vars = {
  id: profileId,
  profile: {
    zonesToDelete: [brazilZoneId],
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

const r = await graphql(mutation, vars);

if (r.errors?.length) {
  console.error('❌ GraphQL Error:', r.errors[0].message);
  process.exit(1);
}
if (r.data?.deliveryProfileUpdate?.userErrors?.length) {
  console.error('❌ UserError:', r.data.deliveryProfileUpdate.userErrors[0].message);
  process.exit(1);
}

console.log('✅ Zona España creada (Envío Gratis + Express €4.99)');
console.log('✅ Zona Brasil eliminada');
console.log('\n🎉 Zonas de envío actualizadas correctamente.');
console.log('   Verificá en: https://admin.shopify.com/store/yxx05u-wr/settings/shipping');
