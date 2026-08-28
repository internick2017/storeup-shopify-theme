import https from 'https';
import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('f:\\tmp\\shopify.env','utf8').split('\n').filter(Boolean).map(l=>l.split('=')));
function gql(q){return new Promise((res,rej)=>{const data=JSON.stringify({query:q});const r=https.request({hostname:env.SHOPIFY_SHOP,path:'/admin/api/2025-01/graphql.json',method:'POST',headers:{'X-Shopify-Access-Token':env.SHOPIFY_ACCESS_TOKEN,'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}},x=>{let d='';x.on('data',c=>d+=c).on('end',()=>res(JSON.parse(d)))});r.write(data);r.end();});}
const r = await gql('{ shop { shopPolicies { type title url body } } }');
for (const p of r.data.shop.shopPolicies) {
  console.log(`${p.type}: ${p.body ? p.body.length+' chars' : 'VACÍA'} | url: ${p.url||'(sin url)'}`);
}
