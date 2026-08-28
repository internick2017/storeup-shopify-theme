import fs from 'fs';
const env = fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN = (env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP = (env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1] || 'yxx05u-wr.myshopify.com';
async function gql(q){ const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:q})}); return r.json(); }
function scan(label, text){
  if(!text) return;
  const hits = [];
  if(/contacto@storeup\.store/i.test(text)) hits.push('contacto@ (CON C - revisar)');
  if(/contato@storeup\.store/i.test(text)) hits.push('contato@ (con t - OK)');
  if(/internick2017@gmail/i.test(text)) hits.push('internick2017@gmail (PERSONAL - revisar)');
  const other = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [];
  const uniq = [...new Set(other)];
  console.log(`\n=== ${label} ===`);
  console.log('  flags:', hits.length?hits.join(' | '):'(sin email)');
  if(uniq.length) console.log('  emails encontrados:', uniq.join(', '));
}
// 1) politicas
const pol = await gql(`{ shop { shopPolicies { type body } } }`);
(pol.data?.shop?.shopPolicies||[]).forEach(p=>scan('POLICY '+p.type, p.body));
// 2) paginas (faq, contact)
const pages = await gql(`{ pages(first:20){ edges{ node{ title handle body } } } }`);
(pages.data?.pages?.edges||[]).forEach(e=>scan('PAGE '+e.node.handle, e.node.body));
