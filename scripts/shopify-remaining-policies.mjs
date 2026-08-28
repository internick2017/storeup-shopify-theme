import https from 'https';
import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('f:\\tmp\\shopify.env','utf8').split('\n').filter(Boolean).map(l=>l.split('=')));
function gql(q,v={}){return new Promise((res)=>{const data=JSON.stringify({query:q,variables:v});const r=https.request({hostname:env.SHOPIFY_SHOP,path:'/admin/api/2025-01/graphql.json',method:'POST',headers:{'X-Shopify-Access-Token':env.SHOPIFY_ACCESS_TOKEN,'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}},x=>{let d='';x.on('data',c=>d+=c).on('end',()=>res(JSON.parse(d)))});r.write(data);r.end();});}

const MUT = `mutation policyUpdate($shopPolicy: ShopPolicyInput!) { shopPolicyUpdate(shopPolicy: $shopPolicy) { shopPolicy { type } userErrors { message } } }`;

const policies = {
  CONTACT_INFORMATION: `
<p><strong>Store Up</strong></p>
<p>Email: <strong>contacto@storeup.store</strong></p>
<p>Ubicación: Francisco Beltrão, Paraná, Brasil</p>
<p>Atendemos consultas por email en español, inglés y portugués. Te respondemos en un plazo de 24-48 horas hábiles.</p>
`,
  SHIPPING_POLICY: `
<p><strong>Última actualización: junio 2026</strong></p>
<h3>Cobertura de envío</h3>
<p>Realizamos envíos a España, Brasil y a varios países de Europa, América y más. El destino se confirma en la pantalla de pago.</p>
<h3>Costos de envío</h3>
<p>🇪🇸 <strong>España: envío gratuito.</strong><br>
🇧🇷 <strong>Brasil: frete grátis.</strong><br>
🌍 Internacional: tarifa indicada en el checkout.</p>
<h3>Tiempos de entrega</h3>
<p>Los pedidos se procesan en 1-3 días hábiles. La entrega estimada es de <strong>15 a 25 días hábiles</strong> según el destino. Los tiempos son estimaciones y pueden variar por temporada alta, aduana o factores del transportista.</p>
<h3>Seguimiento</h3>
<p>Todos los pedidos incluyen <strong>número de seguimiento</strong>. Lo recibirás por email cuando tu pedido sea despachado, para rastrearlo en todo momento.</p>
<h3>Aduana e impuestos de importación</h3>
<p>Según el país de destino, pueden aplicarse impuestos o cargos de aduana, que son responsabilidad del cliente. Consulta la normativa de tu país.</p>
<h3>Pedido no recibido o retrasado</h3>
<p>Si tu pedido no llega en el plazo estimado, escríbenos a <strong>contacto@storeup.store</strong>. Investigaremos con el transportista y, de no resolverse, te ofreceremos reenvío o reembolso.</p>
`,
  LEGAL_NOTICE: `
<p><strong>Aviso legal</strong></p>
<p>Este sitio web (storeup.store) es operado por <strong>Store Up</strong>.</p>
<p><strong>Responsable:</strong> Store Up<br>
<strong>Contacto:</strong> contacto@storeup.store<br>
<strong>Ubicación:</strong> Francisco Beltrão, Paraná, Brasil</p>
<p>Store Up opera con tecnología de Shopify. Todas las ventas se realizan directamente con Store Up.</p>
<p>El contenido de este sitio (textos, imágenes, marca y diseño) está protegido por las leyes de propiedad intelectual aplicables. Para consultas legales o sobre tus datos, escríbenos a contacto@storeup.store.</p>
<p>Para clientes de la Unión Europea: tienes derecho a la resolución de litigios en línea a través de la plataforma de la Comisión Europea (ec.europa.eu/consumers/odr).</p>
`
};

for (const [type, body] of Object.entries(policies)) {
  const r = await gql(MUT, { shopPolicy: { type, body } });
  if (r.errors?.length) console.log(`❌ ${type}: ${r.errors[0].message}`);
  else if (r.data?.shopPolicyUpdate?.userErrors?.length) console.log(`❌ ${type}: ${r.data.shopPolicyUpdate.userErrors[0].message}`);
  else console.log(`✅ ${type} creada/actualizada`);
}

// Verificar todas
const v = await gql('{ shop { shopPolicies { type body } } }');
console.log('\n📄 TODAS las políticas:');
v.data.shop.shopPolicies.forEach(p=>console.log(`   ✅ ${p.type}: ${p.body?p.body.length+' chars':'vacía'}`));
