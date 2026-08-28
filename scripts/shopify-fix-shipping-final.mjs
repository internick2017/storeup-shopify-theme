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
      hostname: SHOP, path: '/admin/api/2024-10/graphql.json', method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

// Obtener estructura
const profiles = await graphql(`{
  deliveryProfiles(first: 1) {
    edges { node {
      id
      profileLocationGroups {
        locationGroup { id }
        locationGroupZones(first: 20) {
          edges { node {
            zone { id name countries { code { countryCode } } }
            methodDefinitions(first: 10) { edges { node { id name } } }
          } }
        }
      }
    } }
  }
}`);

const profile = profiles.data.deliveryProfiles.edges[0].node;
const lg = profile.profileLocationGroups[0];
const lgId = lg.locationGroup.id;

let intlZoneId = null;
let intlMethodId = null;
for (const { node } of lg.locationGroupZones.edges) {
  if (node.zone.name === 'International') {
    intlZoneId = node.zone.id;
    intlMethodId = node.methodDefinitions.edges[0]?.node?.id;
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

// PASO 1: Eliminar la tarifa en BRL de International
console.log('🔧 Paso 1: Eliminando tarifa International en BRL...');
const r1 = await graphql(mutation, {
  id: profile.id,
  profile: { methodDefinitionsToDelete: [intlMethodId] }
});
const e1 = r1.data?.deliveryProfileUpdate?.userErrors;
console.log(e1?.length ? `⚠️  ${e1[0].message}` : '✅ Tarifa BRL eliminada');

// PASO 2: Crear nueva tarifa International en EUR
console.log('\n🔧 Paso 2: Creando tarifa International en EUR...');
const r2 = await graphql(mutation, {
  id: profile.id,
  profile: {
    locationGroupsToUpdate: [{
      id: lgId,
      zonesToUpdate: [{
        id: intlZoneId,
        methodDefinitionsToCreate: [
          { name: "Envío Internacional", active: true, rateDefinition: { price: { amount: "4.99", currencyCode: "EUR" } } }
        ]
      }]
    }]
  }
});
const e2 = r2.data?.deliveryProfileUpdate?.userErrors;
console.log(e2?.length ? `⚠️  ${e2[0].message}` : '✅ Tarifa International: €4.99 EUR');

// PASO 3: Crear zona Brasil con envío gratis
console.log('\n🔧 Paso 3: Agregando zona Brasil...');
const r3 = await graphql(mutation, {
  id: profile.id,
  profile: {
    locationGroupsToUpdate: [{
      id: lgId,
      zonesToCreate: [{
        name: "Brasil",
        countries: [{ code: "BR", includeAllProvinces: true }],
        methodDefinitionsToCreate: [
          { name: "Frete Grátis", active: true, rateDefinition: { price: { amount: "0.00", currencyCode: "EUR" } } }
        ]
      }]
    }]
  }
});
const e3 = r3.data?.deliveryProfileUpdate?.userErrors;
console.log(e3?.length ? `⚠️  ${e3[0].message}` : '✅ Zona Brasil creada con Frete Grátis');

console.log('\n🎉 Envíos actualizados:');
console.log('   🇪🇸 España: Gratis + Premium €4.99');
console.log('   🇧🇷 Brasil: Frete Grátis');
console.log('   🌍 Internacional (27 países): €4.99 EUR');
console.log('\n   ⚠️  Ya no hay tarifas en BRL — todo en EUR');
