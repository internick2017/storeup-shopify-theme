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

// Estado de Shopify Payments
console.log('💳 SHOPIFY PAYMENTS:');
const sp = await graphql(`{
  shopifyPaymentsAccount {
    activated
    accountOpenerName
    country
    defaultCurrency
    onboardable
    chargeStatementDescriptors { default }
  }
}`);
if (sp.errors) {
  console.log('   ⚠️ ', sp.errors[0].message);
} else if (!sp.data?.shopifyPaymentsAccount) {
  console.log('   ❌ Shopify Payments NO está configurado / no hay cuenta');
} else {
  const a = sp.data.shopifyPaymentsAccount;
  console.log(`   activated: ${a.activated}`);
  console.log(`   país: ${a.country} | moneda: ${a.defaultCurrency}`);
  console.log(`   onboardable: ${a.onboardable}`);
  console.log(`   titular: ${a.accountOpenerName || '(no completado)'}`);
}

// Plan de la tienda
console.log('\n📋 PLAN:');
const shop = await graphql(`{ shop { plan { displayName partnerDevelopment shopifyPlus } currencyCode } }`);
console.log(`   Plan: ${shop.data?.shop?.plan?.displayName}`);
console.log(`   Dev store: ${shop.data?.shop?.plan?.partnerDevelopment}`);
console.log(`   Moneda: ${shop.data?.shop?.currencyCode}`);
