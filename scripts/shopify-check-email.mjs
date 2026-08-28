import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function graphql(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const options = {
      hostname: SHOP, path: '/admin/api/2025-01/graphql.json', method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

// Email de contacto/sender de la tienda
const shop = await graphql(`{
  shop {
    name
    email
    contactEmail
    primaryDomain { host sslEnabled }
  }
}`);
console.log('📧 EMAILS DE LA TIENDA:');
console.log(`   Email cuenta: ${shop.data?.shop?.email}`);
console.log(`   Email contacto (sender): ${shop.data?.shop?.contactEmail}`);
console.log(`   Dominio principal: ${shop.data?.shop?.primaryDomain?.host}`);

// Dominios
const domains = await graphql(`{
  domains { id host sslEnabled }
}`);
console.log('\n🌐 DOMINIOS:');
domains.data?.domains?.forEach(d => console.log(`   ${d.host}`));
