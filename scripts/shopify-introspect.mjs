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
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const res = await graphql(`{
  __type(name: "DeliveryProfileLocationGroupInput") {
    inputFields {
      name
      type { name kind ofType { name kind } }
    }
  }
}`);

console.log('DeliveryProfileLocationGroupInput fields:');
res.data.__type.inputFields.forEach(f => {
  const t = f.type.name || f.type.ofType?.name || f.type.kind;
  console.log(`  ${f.name}: ${t}`);
});

// También checar el input de Update
const res2 = await graphql(`{
  __type(name: "DeliveryProfileInput") {
    inputFields {
      name
      type { name kind ofType { name kind } }
    }
  }
}`);

console.log('\nDeliveryProfileInput fields:');
res2.data.__type.inputFields.forEach(f => {
  const t = f.type.name || f.type.ofType?.name || f.type.kind;
  console.log(`  ${f.name}: ${t}`);
});
