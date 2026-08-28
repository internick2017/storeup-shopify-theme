import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('f:/tmp/shopify.env', 'utf8')
    .split(/\r?\n/).filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
);
const URL_ = `https://${env.SHOPIFY_SHOP}/admin/api/2024-10/graphql.json`;

async function gql(query, variables = {}) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN },
    body: JSON.stringify({ query, variables })
  });
  const j = await r.json();
  if (j.errors) throw new Error('Top-level errors: ' + JSON.stringify(j.errors));
  return j.data;
}

const meta = JSON.parse(readFileSync('f:/tmp/policies-es.json', 'utf8'));
const MUTATION = `mutation($id: ID!, $translations: [TranslationInput!]!) {
  translationsRegister(resourceId: $id, translations: $translations) {
    translations { key locale }
    userErrors { field message }
  }
}`;

let failed = false;
for (const type of Object.keys(meta)) {
  const { id, digest } = meta[type];
  const value = readFileSync(`f:/tmp/en/${type}.html`, 'utf8');
  try {
    const data = await gql(MUTATION, {
      id,
      translations: [{ locale: 'en', key: 'body', value, translatableContentDigest: digest }]
    });
    const res = data.translationsRegister;
    if (res.userErrors.length) {
      failed = true;
      console.log(`${type}: FAILED userErrors=${JSON.stringify(res.userErrors)}`);
    } else {
      console.log(`${type}: OK registered (${value.length} chars, locale=en)`);
    }
  } catch (e) {
    failed = true;
    console.log(`${type}: FAILED ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);
