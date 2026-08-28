import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);

const GQL = `https://${env.SHOPIFY_SHOP}/admin/api/2024-10/graphql.json`;
const HEADERS = {
  'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN,
  'Content-Type': 'application/json',
};

async function gql(query, variables) {
  const r = await fetch(GQL, { method: 'POST', headers: HEADERS, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) {
    console.error('GraphQL top-level errors:', JSON.stringify(j.errors, null, 2));
    process.exit(1);
  }
  return j.data;
}

// Value translations: spanish -> { en, pt-BR }
const VALUE_MAP = {
  'Clásica — Atardecer': { en: 'Classic — Sunset', 'pt-BR': 'Clássica — Pôr do Sol' },
  'Golden — 16 Colores': { en: 'Golden — 16 Colors', 'pt-BR': 'Golden — 16 Cores' },
  'Pro — Control por App': { en: 'Pro — App Control', 'pt-BR': 'Pro — Controle por App' },
};

// Option name translations
const NAME_MAP = {
  'Versión': { en: 'Version', 'pt-BR': 'Versão' },
  'Version': { en: 'Version', 'pt-BR': 'Versão' },
  'Modelo': { en: 'Model', 'pt-BR': 'Modelo' },
  'Título': { en: 'Title', 'pt-BR': 'Título' },
};

const TRANSLATABLE_QUERY = `
  query translatable($resourceType: TranslatableResourceType!) {
    translatableResources(first: 50, resourceType: $resourceType) {
      edges {
        node {
          resourceId
          translatableContent { key value digest }
        }
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation register($resourceId: ID!, $translations: [TranslationInput!]!) {
    translationsRegister(resourceId: $resourceId, translations: $translations) {
      translations { locale key value }
      userErrors { message field }
    }
  }
`;

let registered = { en: 0, 'pt-BR': 0 };
let failures = 0;

async function processType(resourceType, map) {
  const data = await gql(TRANSLATABLE_QUERY, { resourceType });
  const edges = data.translatableResources.edges;
  console.log(`\n=== ${resourceType}: ${edges.length} resources ===`);

  for (const { node } of edges) {
    for (const content of node.translatableContent) {
      const target = map[content.value];
      if (!target) continue;
      const translations = Object.entries(target).map(([locale, value]) => ({
        locale, key: content.key, value, translatableContentDigest: content.digest,
      }));
      const res = await gql(REGISTER_MUTATION, { resourceId: node.resourceId, translations });
      const { translations: done, userErrors } = res.translationsRegister;
      if (userErrors.length) {
        failures++;
        console.error(`  FAIL ${node.resourceId} "${content.value}":`, JSON.stringify(userErrors));
        continue;
      }
      for (const t of done) registered[t.locale]++;
      console.log(`  OK ${node.resourceId} "${content.value}" -> ${done.map(t => `${t.locale}:"${t.value}"`).join(' | ')}`);
    }
  }
}

await processType('PRODUCT_OPTION_VALUE', VALUE_MAP);
await processType('PRODUCT_OPTION', NAME_MAP);

console.log(`\nRegistradas: en=${registered.en}, pt-BR=${registered['pt-BR']}, fallos=${failures}`);
process.exit(failures ? 1 : 0);
