import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('f:/tmp/shopify.env', 'utf8')
    .split(/\r?\n/).filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const URL = `https://${env.SHOPIFY_SHOP}/admin/api/2024-10/graphql.json`;

async function gql(query, variables = {}) {
  const r = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}

const meta = JSON.parse(readFileSync('f:/tmp/policies-es/meta.json', 'utf8'));
const MUTATION = `
mutation register($resourceId: ID!, $translations: [TranslationInput!]!) {
  translationsRegister(resourceId: $resourceId, translations: $translations) {
    translations { locale key }
    userErrors { field message }
  }
}`;

let failed = false;
for (const type of Object.keys(meta)) {
  const { id, digest } = meta[type];
  const value = readFileSync(`f:/tmp/policies-pt/${type}.html`, 'utf8');
  const res = await gql(MUTATION, {
    resourceId: id,
    translations: [{ locale: 'pt-BR', key: 'body', value, translatableContentDigest: digest }],
  });
  const errs = res.errors;
  const userErrs = res.data && res.data.translationsRegister && res.data.translationsRegister.userErrors;
  if (errs && errs.length) {
    failed = true;
    console.log(`${type}: TOP-LEVEL ERRORS:`, JSON.stringify(errs));
  } else if (userErrs && userErrs.length) {
    failed = true;
    console.log(`${type}: USER ERRORS:`, JSON.stringify(userErrs));
  } else {
    const t = res.data.translationsRegister.translations;
    console.log(`${type}: OK — registered ${JSON.stringify(t)} value chars: ${value.length}`);
  }
}
console.log(failed ? 'SOME FAILURES' : 'ALL REGISTERED');
process.exit(failed ? 1 : 0);
