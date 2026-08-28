import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function graphqlRequest(query, variables) {
  return new Promise((resolve) => {
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
    req.on('error', (e) => resolve({ errors: [String(e)] }));
    req.write(data);
    req.end();
  });
}

const PRODUCT_GID = 'gid://shopify/Product/8737067827358';

const SEO = {
  es: {
    title: 'Lámpara Proyectora de Atardecer Golden Hour™ — Luz Sunset Aesthetic',
    description: 'Proyecta un atardecer real en tu cuarto. Lámpara sunset viral de TikTok desde 24,99 €. 16 colores o control por app. Envío gratis a España.',
  },
  en: {
    title: 'Golden Hour™ Sunset Projection Lamp — Aesthetic Sunset Light',
    description: 'Project a real sunset in your room. The viral TikTok sunset lamp from €24.99. 16 colors or app control. Free shipping.',
  },
  'pt-BR': {
    title: 'Luminária Projetora de Pôr do Sol Golden Hour™ — Luz Sunset Aesthetic',
    description: 'Projete um pôr do sol real no seu quarto. A luminária sunset viral do TikTok a partir de €24,99. 16 cores ou controle por app. Frete grátis.',
  },
};

// 1) Update primary-locale (es) SEO via productUpdate
console.log('1️⃣ Actualizando SEO del producto (es, idioma primario)...');
const upd = await graphqlRequest(`
  mutation($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id seo { title description } }
      userErrors { field message }
    }
  }`, { input: { id: PRODUCT_GID, seo: { title: SEO.es.title, description: SEO.es.description } } });

if (upd.errors) { console.error('❌ Top-level errors:', JSON.stringify(upd.errors)); process.exit(1); }
const ue = upd.data.productUpdate.userErrors;
if (ue.length) { console.error('❌ userErrors:', JSON.stringify(ue)); process.exit(1); }
console.log('✅ SEO es:', JSON.stringify(upd.data.productUpdate.product.seo));

// 2) Fetch translatable content (need digests for meta_title / meta_description)
console.log('\n2️⃣ Obteniendo digests de contenido traducible...');
const tr = await graphqlRequest(`
  query {
    translatableResource(resourceId: "${PRODUCT_GID}") {
      translatableContent { key value digest }
    }
  }`);
const contents = tr.data.translatableResource.translatableContent;
const metaTitle = contents.find(c => c.key === 'meta_title');
const metaDesc  = contents.find(c => c.key === 'meta_description');
console.log('   meta_title digest:', metaTitle ? metaTitle.digest : 'NO ENCONTRADO');
console.log('   meta_description digest:', metaDesc ? metaDesc.digest : 'NO ENCONTRADO');

// 3) Register EN + PT-BR translations of the SEO fields
for (const locale of ['en', 'pt-BR']) {
  console.log(`\n3️⃣ Registrando traducción SEO ${locale}...`);
  const translations = [];
  if (metaTitle) translations.push({ locale, key: 'meta_title', value: SEO[locale].title, translatableContentDigest: metaTitle.digest });
  if (metaDesc)  translations.push({ locale, key: 'meta_description', value: SEO[locale].description, translatableContentDigest: metaDesc.digest });
  if (!translations.length) { console.log('   (sin claves traducibles, salto)'); continue; }
  const reg = await graphqlRequest(`
    mutation($resourceId: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $resourceId, translations: $translations) {
        translations { locale key }
        userErrors { field message }
      }
    }`, { resourceId: PRODUCT_GID, translations });
  if (reg.errors) { console.error('   ❌ errors:', JSON.stringify(reg.errors)); continue; }
  const rue = reg.data.translationsRegister.userErrors;
  if (rue.length) console.error('   ❌ userErrors:', JSON.stringify(rue));
  else console.log('   ✅', reg.data.translationsRegister.translations.map(t => `${t.locale}:${t.key}`).join(', '));
}

console.log('\n🎉 SEO de producto listo en 3 idiomas.');
