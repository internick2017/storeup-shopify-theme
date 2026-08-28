import fs from 'fs';
const env = fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
const LOCALES=['en','pt-BR'];
const BAD='contacto@storeup.store', GOOD='contato@storeup.store';
async function gql(query,variables){ const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query,variables})}); return r.json(); }
const pg=await gql(`{ pages(first:30){ edges{ node{ id handle body } } } }`);
const faq=(pg.data?.pages?.edges||[]).map(e=>e.node).find(n=>n.body&&n.body.includes(BAD));
if(!faq){ console.log('Ninguna pagina con contacto@ (quiza ya estaba bien)'); process.exit(0); }
console.log('Pagina a corregir:', faq.handle, faq.id);
const newBody=faq.body.split(BAD).join(GOOD);
const up=await gql(`mutation($id:ID!,$page:PageUpdateInput!){ pageUpdate(id:$id,page:$page){ userErrors{field message} } }`,{id:faq.id,page:{body:newBody}});
const err=up.errors||up.data?.pageUpdate?.userErrors;
console.log('source ES ->', err&&err.length?'ERROR '+JSON.stringify(err):'OK (contato@)');
if(err&&err.length){ process.exit(1); }
const tr=await gql(`{ translatableResource(resourceId:"${faq.id}"){ translatableContent{ key digest } } }`);
const bodyDigest=(tr.data?.translatableResource?.translatableContent||[]).find(c=>c.key==='body')?.digest;
for(const loc of LOCALES){
  const t=await gql(`{ translatableResource(resourceId:"${faq.id}"){ translations(locale:"${loc}"){ key value } } }`);
  const cur=(t.data?.translatableResource?.translations||[]).find(c=>c.key==='body')?.value;
  if(cur&&cur.includes(BAD)){
    const fixed=cur.split(BAD).join(GOOD);
    const reg=await gql(`mutation($id:ID!,$tr:[TranslationInput!]!){ translationsRegister(resourceId:$id,translations:$tr){ userErrors{field message} } }`,{id:faq.id,tr:[{locale:loc,key:'body',value:fixed,translatableContentDigest:bodyDigest}]});
    const e2=reg.errors||reg.data?.translationsRegister?.userErrors;
    console.log(`  ${loc}: ${e2&&e2.length?'ERROR '+JSON.stringify(e2):'OK (contato@)'}`);
  } else { console.log(`  ${loc}: sin contacto@`); }
}
console.log('LISTO faq');
