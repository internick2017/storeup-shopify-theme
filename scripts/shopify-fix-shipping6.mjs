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

// 1. Obtener datos
const res = await graphql(`{
  deliveryProfiles(first: 1) {
    edges { node {
      id
      profileLocationGroups {
        locationGroup { id }
        locationGroupZones(first: 20) {
          edges { node { zone {
            id name
            countries { id name code { countryCode } }
          } } }
        }
      }
    } }
  }
}`);

const profile   = res.data.deliveryProfiles.edges[0].node;
const profileId = profile.id;
const lg        = profile.profileLocationGroups[0];
const lgId      = lg.locationGroup.id;

let brazilZoneId = null;
let intlZoneId   = null;
let intlCountriesWithoutSpain = [];

for (const { node: { zone } } of lg.locationGroupZones.edges) {
  if (zone.countries.some(c => c.code.countryCode === 'BR')) {
    brazilZoneId = zone.id;
    console.log(`Zona Brasil: ${zone.id}`);
  }
  if (zone.countries.some(c => c.code.countryCode === 'ES') && !zone.countries.some(c => c.code.countryCode === 'BR')) {
    intlZoneId = zone.id;
    // Lista de países SIN España
    intlCountriesWithoutSpain = zone.countries
      .filter(c => c.code.countryCode !== 'ES')
      .map(c => ({ code: c.code.countryCode, includeAllProvinces: true }));
    console.log(`Zona Internacional: ${zone.countries.length} países → quedarán ${intlCountriesWithoutSpain.length} (sin ES)`);
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

// PASO 1: Sacar España de Internacional + Eliminar Brasil (en una sola operación)
console.log('\n🔧 Paso 1: Removiendo España de Internacional y eliminando Brasil...');

const r1 = await graphql(mutation, {
  id: profileId,
  profile: {
    zonesToDelete: [brazilZoneId],
    locationGroupsToUpdate: [{
      id: lgId,
      zonesToUpdate: [{
        id: intlZoneId,
        name: "International",
        countries: intlCountriesWithoutSpain
      }]
    }]
  }
});

if (r1.errors?.length) { console.error('❌', r1.errors[0].message); process.exit(1); }
if (r1.data?.deliveryProfileUpdate?.userErrors?.length) {
  console.error('❌', r1.data.deliveryProfileUpdate.userErrors[0].message); process.exit(1);
}
console.log('✅ España removida de Internacional. Brasil eliminado.');

// PASO 2: Crear zona España
console.log('\n🔧 Paso 2: Creando zona España con envío gratis...');

const r2 = await graphql(mutation, {
  id: profileId,
  profile: {
    locationGroupsToUpdate: [{
      id: lgId,
      zonesToCreate: [{
        name: "España",
        countries: [{ code: "ES", includeAllProvinces: true }],
        methodDefinitionsToCreate: [
          { name: "Envío Gratuito", active: true, rateDefinition: { price: { amount: "0.00", currencyCode: "EUR" } } },
          { name: "Envío Express (3-5 días hábiles)", active: true, rateDefinition: { price: { amount: "4.99", currencyCode: "EUR" } } }
        ]
      }]
    }]
  }
});

if (r2.errors?.length) { console.error('❌', r2.errors[0].message); process.exit(1); }
if (r2.data?.deliveryProfileUpdate?.userErrors?.length) {
  console.error('❌', r2.data.deliveryProfileUpdate.userErrors[0].message); process.exit(1);
}

console.log('✅ Zona España creada: Envío Gratis + Express €4.99');
console.log('\n🎉 ¡Zonas actualizadas!');
console.log('   → España (Domestic): Envío Gratis | Express €4.99');
console.log('   → Internacional: resto del mundo');
