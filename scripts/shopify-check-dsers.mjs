import fs from 'fs';
const env=fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
async function gql(q){const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:q})});return r.json();}
// servicios de fulfillment registrados (DSers registraria uno)
const fs_=await gql(`{ shop{ fulfillmentServices{ serviceName handle type } } }`);
console.log('FULFILLMENT SERVICES:', JSON.stringify(fs_.data?.shop?.fulfillmentServices||fs_.errors));
// variantes del producto: que servicio de fulfillment tienen
const v=await gql(`{ product(id:"gid://shopify/Product/8737067827358"){ variants(first:10){ edges{ node{ sku inventoryItem{ tracked } fulfillmentService{ serviceName handle } } } } } }`);
const vs=(v.data?.product?.variants?.edges||[]).map(e=>e.node);
vs.forEach(x=>console.log(`VARIANT sku=${x.sku} tracked=${x.inventoryItem?.tracked} fulfillment=${x.fulfillmentService?.serviceName||x.fulfillmentService?.handle||'(manual/none)'}`));
