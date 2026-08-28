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

// 1. Obtener perfiles de entrega
console.log('🔍 Obteniendo perfil de envío...\n');

const profilesQuery = `{
  deliveryProfiles(first: 5) {
    edges {
      node {
        id
        name
        default
        profileLocationGroups {
          locationGroupZones(first: 10) {
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
              }
            }
          }
        }
      }
    }
  }
}`;

const profilesRes = await graphql(profilesQuery);

if (profilesRes.errors) {
  console.error('❌ Error GraphQL:', JSON.stringify(profilesRes.errors, null, 2));
  process.exit(1);
}

const profiles = profilesRes.data.deliveryProfiles.edges;
console.log(`Perfiles encontrados: ${profiles.length}\n`);

let defaultProfileId = null;
let brazilZoneId = null;
let brazilCountryId = null;
let spainInInternationalId = null;

for (const { node: profile } of profiles) {
  console.log(`Perfil: "${profile.name}" (default: ${profile.default})`);
  if (profile.default) defaultProfileId = profile.id;

  for (const { node: { zone } } of profile.profileLocationGroups.flatMap(lg => lg.locationGroupZones.edges)) {
    const countries = zone.countries.map(c => `${c.name}(${c.code.countryCode})`).join(', ');
    console.log(`  Zona: "${zone.name}" → ${countries}`);

    // Detectar zona con Brasil
    const brazil = zone.countries.find(c => c.code.countryCode === 'BR');
    if (brazil) {
      brazilZoneId = zone.id;
      brazilCountryId = brazil.id;
      console.log(`  ⚠️  Esta zona tiene Brasil → la cambiaremos a España`);
    }

    // Detectar España en zona Internacional
    const spain = zone.countries.find(c => c.code.countryCode === 'ES');
    if (spain && zone.name !== 'Domestic') {
      spainInInternationalId = spain.id;
      console.log(`  ℹ️  España está en esta zona (la sacaremos de acá)`);
    }
  }
}

if (!brazilZoneId) {
  console.log('\n✅ No se encontró Brasil en ninguna zona. Nada que cambiar.');
  process.exit(0);
}

// 2. Actualizar la zona Domestic: quitar Brasil, poner España
console.log('\n🔧 Actualizando zona Domestic: Brasil → España...');

const updateMutation = `
  mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id name }
      userErrors { field message }
    }
  }
`;

const updateVars = {
  id: defaultProfileId,
  profile: {
    zonesToDelete: [brazilZoneId],
    zones: [
      {
        name: "España",
        countries: [{ code: "ES", includeAllProvinces: true }],
        methodDefinitionsToCreate: [
          {
            name: "Envío Gratis",
            active: true,
            rateDefinition: {
              price: { amount: "0.00", currencyCode: "EUR" }
            }
          }
        ]
      }
    ]
  }
};

const updateRes = await graphql(updateMutation, updateVars);

if (updateRes.errors) {
  console.error('❌ Error:', JSON.stringify(updateRes.errors, null, 2));
} else if (updateRes.data?.deliveryProfileUpdate?.userErrors?.length) {
  console.error('❌ UserErrors:', JSON.stringify(updateRes.data.deliveryProfileUpdate.userErrors, null, 2));
} else {
  console.log('✅ Zona actualizada: España con envío gratis como Domestic');
}
