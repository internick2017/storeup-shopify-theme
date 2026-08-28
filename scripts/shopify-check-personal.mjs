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

// 1. Pasarelas de pago disponibles/activas
console.log('💳 PASARELAS DE PAGO ACTIVAS:');
const pg = await graphql(`{ shop { name } paymentGatewayConfigurations: shop { id } }`);

// 2. Info pública de la tienda (donde puede aparecer nombre personal)
console.log('\n👤 INFO PÚBLICA DE LA TIENDA:');
const shop = await graphql(`{
  shop {
    name
    email
    contactEmail
    billingAddress { name firstName lastName company city country }
  }
}`);
const s = shop.data.shop;
console.log(`   Nombre tienda: ${s.name}`);
console.log(`   Email contacto: ${s.contactEmail}`);
console.log(`   Dirección facturación: name=${s.billingAddress?.name} company=${s.billingAddress?.company} ciudad=${s.billingAddress?.city}`);

// 3. Políticas (suelen tener nombre personal)
console.log('\n📄 POLÍTICAS (buscar nombre personal):');
const pol = await graphql(`{
  shop {
    shopPolicies { type title body }
  }
}`);
for (const p of pol.data?.shop?.shopPolicies || []) {
  const hasName = /nick|granados|internick/i.test(p.body || '');
  console.log(`   ${p.title}: ${p.body ? p.body.length + ' chars' : 'vacía'} ${hasName ? '⚠️ CONTIENE NOMBRE' : ''}`);
}
