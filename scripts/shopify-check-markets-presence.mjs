import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('f:\\tmp\\shopify.env', 'utf8').split('\n').filter(Boolean).map(l => l.split('=')));
const q = `{
  markets(first: 10) {
    edges { node {
      id name enabled primary
      regions(first: 10) { edges { node { name ... on MarketRegionCountry { code } } } }
      webPresences(first: 5) { edges { node {
        id domain { host } defaultLocale { locale } alternateLocales { locale }
        rootUrls { locale url }
      } } }
    } }
  }
}`;
const r = await fetch(`https://${env.SHOPIFY_SHOP}/admin/api/2024-10/graphql.json`, {
  method: 'POST',
  headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: q }),
});
const j = await r.json();
if (j.errors) { console.error(JSON.stringify(j.errors, null, 2)); process.exit(1); }
console.log(JSON.stringify(j.data, null, 2));
