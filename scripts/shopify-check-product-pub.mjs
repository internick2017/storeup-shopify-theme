import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('f:\\tmp\\shopify.env', 'utf8').split('\n').filter(Boolean).map(l => l.split('=')));
const gql = async (query) => {
  const r = await fetch(`https://${env.SHOPIFY_SHOP}/admin/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const j = await r.json();
  if (j.errors) { console.error(JSON.stringify(j.errors, null, 2)); process.exit(1); }
  return j.data;
};

const d = await gql(`{
  product(id: "gid://shopify/Product/8737067827358") {
    status publishedAt handle
    resourcePublicationsV2(first: 20) {
      edges { node { isPublished publication { name catalog { id title ... on MarketCatalog { markets(first: 5) { edges { node { name } } } } } } } }
    }
  }
  catalogs(first: 20) { edges { node { id title status ... on MarketCatalog { markets(first: 5) { edges { node { name } } } } } } }
}`);
console.log(JSON.stringify(d, null, 2));
