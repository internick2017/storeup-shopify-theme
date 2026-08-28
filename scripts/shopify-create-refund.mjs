import https from 'https';
import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('f:\\tmp\\shopify.env','utf8').split('\n').filter(Boolean).map(l=>l.split('=')));
function gql(q,v={}){return new Promise((res)=>{const data=JSON.stringify({query:q,variables:v});const r=https.request({hostname:env.SHOPIFY_SHOP,path:'/admin/api/2025-01/graphql.json',method:'POST',headers:{'X-Shopify-Access-Token':env.SHOPIFY_ACCESS_TOKEN,'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}},x=>{let d='';x.on('data',c=>d+=c).on('end',()=>res(JSON.parse(d)))});r.write(data);r.end();});}

// Introspect ShopPolicyInput
const t = await gql(`{ __type(name:"ShopPolicyInput"){ inputFields { name type { name kind ofType { name } } } } }`);
console.log('ShopPolicyInput fields:');
t.data.__type.inputFields.forEach(f=>console.log('  '+f.name+': '+(f.type.name||f.type.ofType?.name||f.type.kind)));

// Ver enum de tipos disponibles
const e = await gql(`{ __type(name:"ShopPolicyType"){ enumValues { name } } }`);
console.log('\nShopPolicyType valores:', e.data.__type?.enumValues?.map(v=>v.name).join(', '));
