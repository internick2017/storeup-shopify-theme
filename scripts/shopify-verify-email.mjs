import fs from 'fs';
const env=fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
async function gql(q){const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:q})});return r.json();}
let badTotal=0, goodTotal=0;
function check(label,text){ if(!text)return; const bad=(text.match(/contacto@storeup\.store/gi)||[]).length; const good=(text.match(/contato@storeup\.store/gi)||[]).length; badTotal+=bad; goodTotal+=good; if(bad) console.log(`  ❌ ${label}: ${bad}x contacto@ (con c)`); }
const pol=await gql(`{ shop{ shopPolicies{ id type body } } }`);
for(const p of (pol.data?.shop?.shopPolicies||[])){ check('POL '+p.type+' [es]',p.body);
  for(const loc of ['en','pt-BR']){ const t=await gql(`{ translatableResource(resourceId:"${p.id}"){ translations(locale:"${loc}"){ key value } } }`); for(const c of (t.data?.translatableResource?.translations||[])) check(`POL ${p.type} [${loc}]`,c.value); } }
const pg=await gql(`{ pages(first:30){ edges{ node{ id handle body } } } }`);
for(const e of (pg.data?.pages?.edges||[])){ const n=e.node; check('PAGE '+n.handle+' [es]',n.body);
  for(const loc of ['en','pt-BR']){ const t=await gql(`{ translatableResource(resourceId:"${n.id}"){ translations(locale:"${loc}"){ key value } } }`); for(const c of (t.data?.translatableResource?.translations||[])) check(`PAGE ${n.handle} [${loc}]`,c.value); } }
console.log(`\nRESULTADO: contacto@ (con c, malo) = ${badTotal} | contato@ (con t, bueno) = ${goodTotal}`);
console.log(badTotal===0 ? '✅ TODO CONSISTENTE en contato@ (con t), en los 3 idiomas' : '⚠️ aun quedan contacto@');
