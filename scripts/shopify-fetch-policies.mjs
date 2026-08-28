import { readFileSync, writeFileSync } from 'node:fs';

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
  if (j.errors) { console.error('ERRORS:', JSON.stringify(j.errors)); process.exit(1); }
  return j.data;
}

const policies = await gql(`query { shop { shopPolicies { id type body } } }`);
const out = {};
for (const p of policies.shop.shopPolicies) {
  const tr = await gql(
    `query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value digest } } }`,
    { id: p.id }
  );
  const bodyContent = tr.translatableResource.translatableContent.find(c => c.key === 'body');
  out[p.type] = { id: p.id, digest: bodyContent?.digest, bodyLen: p.body.length, body: p.body };
  console.log(p.type, p.id, 'len=', p.body.length, 'digest=', bodyContent?.digest);
}
writeFileSync('f:/tmp/policies-es.json', JSON.stringify(out, null, 2));
console.log('saved f:/tmp/policies-es.json');
