import fs from 'fs';
const env=fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
async function gql(query,variables){const r=await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query,variables})});return r.json();}
// 1) listar pedidos tag:test-data (con paginacion)
let orders=[], cursor=null;
do{
  const q=`{ orders(first:100, query:"tag:test-data"${cursor?`, after:"${cursor}"`:''}){ edges{ cursor node{ id name tags displayFinancialStatus displayFulfillmentStatus } } pageInfo{ hasNextPage } } }`;
  const r=await gql(q);
  const edges=r.data?.orders?.edges||[];
  orders.push(...edges.map(e=>e.node));
  cursor=edges.length?edges[edges.length-1].cursor:null;
  if(!r.data?.orders?.pageInfo?.hasNextPage) break;
}while(cursor);
console.log(`Pedidos tag:test-data encontrados: ${orders.length}`);
console.log('Ejemplos:', orders.slice(0,3).map(o=>`${o.name}(${o.displayFinancialStatus}/${o.displayFulfillmentStatus})`).join(', '));
// safety: todos deben empezar con #SU
const bad=orders.filter(o=>!o.name.startsWith('#SU'));
if(bad.length){ console.log('⚠️ ABORTO: hay pedidos que no son #SU:', bad.map(o=>o.name).join(', ')); process.exit(1); }
// 2) cancelar cada uno
let ok=0, fail=0;
for(const o of orders){
  const m=`mutation($id:ID!){ orderCancel(orderId:$id, reason:OTHER, refund:false, restock:false, notifyCustomer:false, staffNote:"test-data cleanup"){ orderCancelUserErrors{ field message code } } }`;
  const r=await gql(m,{id:o.id});
  const errs=r.errors||r.data?.orderCancel?.orderCancelUserErrors;
  if(errs&&errs.length){ fail++; if(fail<=3) console.log(`  ${o.name} ERROR: ${JSON.stringify(errs)}`); }
  else ok++;
}
console.log(`\nCanceladas: ${ok} | fallidas: ${fail}`);
