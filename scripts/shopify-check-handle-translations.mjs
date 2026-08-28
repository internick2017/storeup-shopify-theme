import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('f:\\tmp\\shopify.env', 'utf8').split('\n').filter(Boolean).map(l => l.split('=')));
const q = `query {
  translatableResource(resourceId: "gid://shopify/Product/8737067827358") {
    en: translations(locale: "en") { key value }
    pt: translations(locale: "pt-BR") { key value }
    translatableContent { key value }
  }
}`;
const r = await fetch(`https://${env.SHOPIFY_SHOP}/admin/api/2024-10/graphql.json`, {
  method: 'POST',
  headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: q }),
});
const j = await r.json();
const tr = j.data.translatableResource;
console.log('translatableContent keys:', tr.translatableContent.map(c => `${c.key}=${(c.value || '').slice(0, 60)}`).join('\n  '));
console.log('\nEN translations:', JSON.stringify(tr.en, null, 2));
console.log('\nPT translations:', JSON.stringify(tr.pt, null, 2));
