import fs from 'fs';
const env = fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN = (env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP = (env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1] || 'yxx05u-wr.myshopify.com';
async function gql(q){
  const r = await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{
    method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({query:q})});
  return r.json();
}
// 1) ¿hay campos SEO de la home / shop?
const shop = await gql(`{ shop { name email contactEmail } }`);
console.log('SHOP:', JSON.stringify(shop.data||shop.errors));
// 2) web pixels existentes (custom pixels via API)
const px = await gql(`{ webPixel { id settings } }`);
console.log('WEB PIXEL:', JSON.stringify(px.data||px.errors));
// 3) ¿el theme tiene una plantilla index con SEO? (online store pages)
const pages = await gql(`{ onlineStore { id } }`).catch(e=>({err:String(e)}));
console.log('ONLINE STORE:', JSON.stringify(pages.data||pages.errors||pages));
