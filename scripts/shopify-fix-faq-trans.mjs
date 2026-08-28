import fs from 'fs';
const env=fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
const BAD='contacto@storeup.store',GOOD='contato@storeup.store';
const FAQ='gid://shopify/Page/124582035614';
async function gql(query,variables){const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query,variables})});return r.json();}
// digests por key del recurso FAQ
const tc=await gql(`{ translatableResource(resourceId:"${FAQ}"){ translatableContent{ key digest } } }`);
const digests=Object.fromEntries((tc.data?.translatableResource?.translatableContent||[]).map(c=>[c.key,c.digest]));
for(const loc of ['en','pt-BR']){
  const t=await gql(`{ translatableResource(resourceId:"${FAQ}"){ translations(locale:"${loc}"){ key value } } }`);
  for(const c of (t.data?.translatableResource?.translations||[])){
    if(c.value&&c.value.includes(BAD)){
      const fixed=c.value.split(BAD).join(GOOD);
      const reg=await gql(`mutation($id:ID!,$tr:[TranslationInput!]!){ translationsRegister(resourceId:$id,translations:$tr){ userErrors{field message} } }`,{id:FAQ,tr:[{locale:loc,key:c.key,value:fixed,translatableContentDigest:digests[c.key]}]});
      const e=reg.errors||reg.data?.translationsRegister?.userErrors;
      console.log(`${loc} key="${c.key}": ${e&&e.length?'ERROR '+JSON.stringify(e):'OK -> contato@'}`);
    }
  }
}
console.log('done');
