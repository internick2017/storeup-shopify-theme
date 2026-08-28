import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const r = await fetch(`https://${env.SHOPIFY_SHOP}/admin/api/2024-10/graphql.json`, {
  method: 'POST',
  headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: `query {
    shop { shopPolicies { id type title url body } }
  }` }),
});
const j = await r.json();
if (j.errors) { console.error('errors:', JSON.stringify(j.errors)); process.exit(1); }
for (const p of j.data.shop.shopPolicies) {
  console.log(`${p.type} | id=${p.id} | title="${p.title}" | bodyLen=${p.body.length} | ${p.url}`);
}

// Check translatable content exists for one policy
const first = j.data.shop.shopPolicies[0];
const tr = await fetch(`https://${env.SHOPIFY_SHOP}/admin/api/2024-10/graphql.json`, {
  method: 'POST',
  headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: `query { translatableResource(resourceId: "${first.id}") { translatableContent { key digest } } }` }),
});
const tj = await tr.json();
console.log('\nClaves traducibles de', first.type + ':', JSON.stringify(tj.data && tj.data.translatableResource ? tj.data.translatableResource.translatableContent.map(c => c.key) : tj).slice(0, 300));
