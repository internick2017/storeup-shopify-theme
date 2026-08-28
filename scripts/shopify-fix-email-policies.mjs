import fs from 'fs';
const env = fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
const LOCALES=['en','pt-BR'];
const BAD='contacto@storeup.store', GOOD='contato@storeup.store';
async function gql(query,variables){ const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query,variables})}); return r.json(); }
const all=await gql(`{ shop { shopPolicies { id type body } } }`);
const pols=(all.data?.shop?.shopPolicies||[]).filter(p=>p.body&&p.body.includes(BAD));
console.log('Politicas con contacto@:', pols.map(p=>p.type).join(', '));
for(const p of pols){
  const newBody=p.body.split(BAD).join(GOOD);
  const up=await gql(`mutation($sp:ShopPolicyInput!){ shopPolicyUpdate(shopPolicy:$sp){ userErrors{field message} } }`,{sp:{type:p.type, body:newBody}});
  const err=up.errors||up.data?.shopPolicyUpdate?.userErrors;
  console.log(`\n[${p.type}] source ES -> ${err&&err.length?'ERROR '+JSON.stringify(err):'OK (contato@)'}`);
  // nuevo digest de 'body'
  const tr=await gql(`{ translatableResource(resourceId:"${p.id}"){ translatableContent{ key digest } } }`);
  const digest=(tr.data?.translatableResource?.translatableContent||[]).find(c=>c.key==='body')?.digest;
  for(const loc of LOCALES){
    const t=await gql(`{ translatableResource(resourceId:"${p.id}"){ translations(locale:"${loc}"){ key value } } }`);
    const cur=(t.data?.translatableResource?.translations||[]).find(c=>c.key==='body')?.value;
    if(cur&&cur.includes(BAD)){
      const fixed=cur.split(BAD).join(GOOD);
      const reg=await gql(`mutation($id:ID!,$tr:[TranslationInput!]!){ translationsRegister(resourceId:$id,translations:$tr){ userErrors{field message} } }`,{id:p.id,tr:[{locale:loc,key:'body',value:fixed,translatableContentDigest:digest}]});
      const e2=reg.errors||reg.data?.translationsRegister?.userErrors;
      console.log(`  ${loc}: ${e2&&e2.length?'ERROR '+JSON.stringify(e2):'OK (contato@)'}`);
    } else { console.log(`  ${loc}: sin contacto@ (nada que cambiar)`); }
  }
}
console.log('\nLISTO politicas');
