import https from 'https';
import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('f:\\tmp\\shopify.env','utf8').split('\n').filter(Boolean).map(l=>l.split('=')));
function gql(q,v={}){return new Promise((res)=>{const data=JSON.stringify({query:q,variables:v});const r=https.request({hostname:env.SHOPIFY_SHOP,path:'/admin/api/2025-01/graphql.json',method:'POST',headers:{'X-Shopify-Access-Token':env.SHOPIFY_ACCESS_TOKEN,'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}},x=>{let d='';x.on('data',c=>d+=c).on('end',()=>res(JSON.parse(d)))});r.write(data);r.end();});}

const REFUND = `
<p><strong>Última actualización: junio 2026</strong></p>
<p>En Store Up queremos que estés 100% conforme con tu compra. Esta política explica cómo funcionan las devoluciones y reembolsos.</p>
<h3>Derecho de desistimiento (clientes de la UE)</h3>
<p>Si resides en la Unión Europea, tienes derecho a <strong>cancelar tu pedido dentro de los 14 días</strong> posteriores a la recepción del producto, sin necesidad de justificación, según la normativa europea de protección al consumidor.</p>
<h3>Plazo de devolución</h3>
<p>Aceptamos devoluciones dentro de los <strong>30 días</strong> posteriores a la entrega. Para ser elegible, el producto debe estar sin usar, en su estado y embalaje original.</p>
<h3>Cómo iniciar una devolución</h3>
<p>Escríbenos a <strong>contacto@storeup.store</strong> con tu número de pedido y el motivo. Te responderemos con las instrucciones. No envíes el producto sin contactarnos primero.</p>
<h3>Reembolsos</h3>
<p>Una vez recibido y revisado el producto devuelto, te notificaremos la aprobación. Si se aprueba, el reembolso se procesará a tu método de pago original en un plazo de <strong>5-10 días hábiles</strong>.</p>
<h3>Producto dañado o incorrecto</h3>
<p>Si recibes un producto defectuoso, dañado o equivocado, contáctanos dentro de las 48 horas con fotos. Te enviaremos un reemplazo o reembolso completo sin coste para ti.</p>
<h3>Pedido no recibido</h3>
<p>Si tu pedido no llega en el plazo estimado, contáctanos. Investigaremos con el transportista y, de no resolverse, te ofreceremos reenvío o reembolso.</p>
<h3>Gastos de envío de devolución</h3>
<p>Salvo en casos de producto defectuoso o error nuestro, los gastos de envío de la devolución corren por cuenta del cliente. Los gastos de envío originales no son reembolsables.</p>
<h3>Contacto</h3>
<p>¿Dudas sobre tu devolución? Escríbenos a <strong>contacto@storeup.store</strong> — estamos para ayudarte.</p>
`;

const r = await gql(`
  mutation policyUpdate($shopPolicy: ShopPolicyInput!) {
    shopPolicyUpdate(shopPolicy: $shopPolicy) { shopPolicy { type url } userErrors { message } }
  }
`, { shopPolicy: { type: "REFUND_POLICY", body: REFUND } });

const e = r.data?.shopPolicyUpdate?.userErrors;
if (e?.length) console.log('❌', e[0].message);
else console.log('✅ Política de reembolso CREADA:', r.data.shopPolicyUpdate.shopPolicy.url);

// Verificar todas
const v = await gql('{ shop { shopPolicies { type body } } }');
console.log('\n📄 Políticas finales:');
v.data.shop.shopPolicies.forEach(p=>console.log(`   ${p.type}: ${p.body?p.body.length+' chars ✅':'vacía'}`));
