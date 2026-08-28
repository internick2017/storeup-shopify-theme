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

// 1. Obtener perfil con locationGroup IDs
console.log('🔍 Obteniendo estructura del perfil de envío...\n');

const profilesQuery = `{
  deliveryProfiles(first: 3) {
    edges {
      node {
        id
        name
        default
        profileLocationGroups {
          locationGroup { id }
          locationGroupZones(first: 20) {
            edges {
              node {
                zone {
                  id
                  name
                  countries {
                    id
                    name
                    code { countryCode }
                  }
                }
                methodDefinitions(first: 5) {
                  edges {
                    node { id name active }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

const res = await graphql(profilesQuery);

if (res.errors) {
  console.error('❌ Error:', JSON.stringify(res.errors, null, 2));
  process.exit(1);
}

const profile = res.data.deliveryProfiles.edges.find(e => e.node.default)?.node;
if (!profile) { console.error('❌ No se encontró perfil default'); process.exit(1); }

console.log(`Perfil: "${profile.name}"`);

let profileId = profile.id;
let locationGroupId = null;
let brazilZoneId = null;
let internationalZoneId = null;
let internationalSpainCountryId = null;

for (const lg of profile.profileLocationGroups) {
  locationGroupId = lg.locationGroup.id;
  for (const { node: { zone } } of lg.locationGroupZones.edges) {
    const hasBrazil = zone.countries.some(c => c.code.countryCode === 'BR');
    const hasSpain  = zone.countries.some(c => c.code.countryCode === 'ES');

    if (hasBrazil) {
      brazilZoneId = zone.id;
      console.log(`  Zona Domestic (Brasil): ${zone.id}`);
    }
    if (hasSpain && !hasBrazil) {
      internationalZoneId = zone.id;
      internationalSpainCountryId = zone.countries.find(c => c.code.countryCode === 'ES')?.id;
      console.log(`  Zona Internacional (tiene España): ${zone.id}`);
    }
  }
}

if (!brazilZoneId) {
  console.log('\n✅ Brasil no encontrado — nada que cambiar.');
  process.exit(0);
}

// 2. Eliminar zona Brasil y crear zona España
console.log('\n🔧 Paso 1: Eliminar zona Brasil y crear zona España...');

const mutation1 = `
  mutation updateProfile($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id name }
      userErrors { field message }
    }
  }
`;

const vars1 = {
  id: profileId,
  profile: {
    locationGroupsToUpdate: [
      {
        id: locationGroupId,
        zonesToDelete: [brazilZoneId],
        zonesToCreate: [
          {
            name: "España",
            countries: [{ code: "ES", includeAllProvinces: true }],
            methodDefinitionsToCreate: [
              {
                name: "Envío Gratuito",
                active: true,
                rateDefinition: {
                  price: { amount: "0.00", currencyCode: "EUR" }
                }
              },
              {
                name: "Envío Premium (3-5 días)",
                active: true,
                rateDefinition: {
                  price: { amount: "4.99", currencyCode: "EUR" }
                }
              }
            ]
          }
        ]
      }
    ]
  }
};

const res1 = await graphql(mutation1, vars1);

if (res1.errors?.length) {
  console.error('❌ Error GraphQL:', JSON.stringify(res1.errors, null, 2));
  process.exit(1);
}
if (res1.data?.deliveryProfileUpdate?.userErrors?.length) {
  console.error('❌ UserErrors:', JSON.stringify(res1.data.deliveryProfileUpdate.userErrors, null, 2));
  process.exit(1);
}
console.log('✅ Zona España creada con envío gratis');

// 3. Sacar España de la zona Internacional
if (internationalZoneId && internationalSpainCountryId) {
  console.log('\n🔧 Paso 2: Sacando España de la zona Internacional...');

  const mutation2 = `
    mutation updateProfile($id: ID!, $profile: DeliveryProfileInput!) {
      deliveryProfileUpdate(id: $id, profile: $profile) {
        profile { id }
        userErrors { field message }
      }
    }
  `;

  const vars2 = {
    id: profileId,
    profile: {
      locationGroupsToUpdate: [
        {
          id: locationGroupId,
          zonesToUpdate: [
            {
              id: internationalZoneId,
              countriesToDelete: [internationalSpainCountryId]
            }
          ]
        }
      ]
    }
  };

  const res2 = await graphql(mutation2, vars2);

  if (res2.data?.deliveryProfileUpdate?.userErrors?.length) {
    console.log('⚠️  No se pudo sacar España de Internacional (puede ignorarse):',
      res2.data.deliveryProfileUpdate.userErrors[0].message);
  } else {
    console.log('✅ España removida de zona Internacional');
  }
}

console.log('\n🎉 Zonas de envío actualizadas:');
console.log('   Domestic (España): Envío Gratis + Envío Premium €4.99');
console.log('   Internacional: resto del mundo');
