import fs from 'fs';
const env=fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
async function gql(q){const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:q})});return r.json();}
const b=await gql(`{ blogs(first:5){ edges{ node{ id handle title } } } }`);
console.log('BLOGS:'); (b.data?.blogs?.edges||[]).forEach(e=>console.log(`  ${e.node.title} | handle=${e.node.handle} | ${e.node.id}`));
const p=await gql(`{ product(id:"gid://shopify/Product/8737067827358"){ handle onlineStoreUrl featuredMedia{ ... on MediaImage { image{ url } } } } }`);
console.log('PRODUCT handle:', p.data?.product?.handle);
console.log('PRODUCT url:', p.data?.product?.onlineStoreUrl);
console.log('FEATURED IMG:', p.data?.product?.featuredMedia?.image?.url);
// articulos existentes (para no duplicar handles)
const a=await gql(`{ articles(first:20){ edges{ node{ handle title } } } }`);
console.log('ARTICULOS EXISTENTES:'); (a.data?.articles?.edges||[]).forEach(e=>console.log(`  ${e.node.handle} — ${e.node.title}`));
