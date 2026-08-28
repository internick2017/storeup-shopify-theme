import fs from 'fs';
const env=fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
async function gql(q){const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:q})});return r.json();}
const px=await gql(`{ webPixel { id settings } }`);
console.log('WEB PIXEL (API):', JSON.stringify(px.data?.webPixel||px.errors||'null'));
// buscar el pixel de Meta en el storefront
const r=await fetch('https://storeup.store/');
const html=await r.text();
const fbId=(html.match(/facebook[^"']*?(\d{15,16})/i)||html.match(/"pixel[_-]?id"\s*[:=]\s*"?(\d{15,16})/i)||[]);
console.log('storefront HTTP', r.status, '| fbevents en HTML:', /fbevents\.js|connect\.facebook\.net|fbq\(/i.test(html));
console.log('posible pixel id en HTML:', fbId[1]||'(no visible en HTML crudo - normal, Shopify usa pixels sandbox)');
