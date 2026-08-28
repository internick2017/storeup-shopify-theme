import fs from 'fs';
const env=fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
async function gql(q){const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:q})});return r.json();}
const r=await gql(`{ orders(first:100, query:"tag:test-data"){ edges{ node{ name cancelledAt displayFulfillmentStatus } } } }`);
const os=(r.data?.orders?.edges||[]).map(e=>e.node);
const cancelled=os.filter(o=>o.cancelledAt).length;
const open=os.filter(o=>!o.cancelledAt).length;
console.log(`test-data orders: ${os.length} | canceladas=${cancelled} | aun abiertas=${open}`);
// tambien: cuantas ordenes NO canceladas existen en total (deberian ser 0 si solo habia test)
const r2=await gql(`{ ordersCount(query:"-status:cancelled"){ count } }`);
console.log('Ordenes activas (no canceladas) en la tienda:', JSON.stringify(r2.data?.ordersCount||r2.errors));
