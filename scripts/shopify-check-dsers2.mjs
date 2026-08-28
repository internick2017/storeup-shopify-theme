import fs from 'fs';
const env=fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
async function gql(q){const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:q})});return r.json();}
const q=`{ product(id:"gid://shopify/Product/8737067827358"){ variants(first:10){ edges{ node{ title sku inventoryItem{ tracked inventoryLevels(first:5){ edges{ node{ location{ name } } } } } } } } } }`;
const r=await gql(q);
const vs=(r.data?.product?.variants?.edges||[]).map(e=>e.node);
if(!vs.length){ console.log('ERROR/empty:', JSON.stringify(r.errors||r)); }
vs.forEach(x=>{ const locs=(x.inventoryItem?.inventoryLevels?.edges||[]).map(l=>l.node.location.name); console.log(`VAR "${x.title}" sku=${x.sku} tracked=${x.inventoryItem?.tracked} locations=[${locs.join(', ')}]`); });
