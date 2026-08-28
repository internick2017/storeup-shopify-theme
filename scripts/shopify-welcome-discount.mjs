import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function graphql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
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

console.log('🎟️  Creando descuento de bienvenida (10% primera compra)...\n');

const r = await graphql(`
  mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode { id }
      userErrors { field message }
    }
  }
`, {
  basicCodeDiscount: {
    title: "Bienvenida 10% - Primera compra",
    code: "BIENVENIDO10",
    startsAt: "2026-06-02T00:00:00Z",
    customerSelection: { all: true },
    customerGets: {
      value: { percentage: 0.10 },
      items: { all: true }
    },
    appliesOncePerCustomer: true,
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true }
  }
});

if (r.errors?.length) {
  console.log('❌', JSON.stringify(r.errors, null, 2));
} else if (r.data?.discountCodeBasicCreate?.userErrors?.length) {
  console.log('⚠️ ', JSON.stringify(r.data.discountCodeBasicCreate.userErrors, null, 2));
} else {
  console.log('✅ Descuento creado: código BIENVENIDO10 (10% off, 1 uso por cliente)');
  console.log(`   ID: ${r.data.discountCodeBasicCreate.codeDiscountNode.id}`);
}
