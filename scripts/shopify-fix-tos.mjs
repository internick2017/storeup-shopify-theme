import https from 'https';
import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('f:\\tmp\\shopify.env','utf8').split('\n').filter(Boolean).map(l=>l.split('=')));
function gql(q,v={}){return new Promise((res)=>{const data=JSON.stringify({query:q,variables:v});const r=https.request({hostname:env.SHOPIFY_SHOP,path:'/admin/api/2025-01/graphql.json',method:'POST',headers:{'X-Shopify-Access-Token':env.SHOPIFY_ACCESS_TOKEN,'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}},x=>{let d='';x.on('data',c=>d+=c).on('end',()=>res(JSON.parse(d)))});r.write(data);r.end();});}

const TOS = `
<h3>INFORMACIÓN GENERAL</h3>
<p>¡Bienvenido a Store Up! Los términos "nosotros", "nos" y "nuestro" se refieren a Store Up. Store Up dirige esta tienda y sitio web, incluyendo toda la información, contenido, características, herramientas, productos y servicios relacionados para ofrecerle a usted, el cliente, una experiencia de compra selecta (los "Servicios"). Store Up usa la tecnología de Shopify, que nos permite ofrecerle los Servicios.</p>
<p>Lea atentamente estos Términos del Servicio, ya que incluyen información importante sobre sus derechos legales y cubren áreas como garantía, descargo de responsabilidad y limitación de responsabilidad.</p>
<p>Al visitar, interactuar con o utilizar nuestros Servicios, usted acepta estar sujeto a estos Términos del Servicio y nuestra <a href="/policies/privacy-policy">Política de privacidad</a>. Si no está de acuerdo, no debe utilizar ni acceder a nuestros Servicios.</p>

<h3>SECCIÓN 1 - ACCESO Y CUENTA</h3>
<p>Al aceptar estos Términos, usted declara que tiene al menos la mayoría de edad legal en su lugar de residencia. Para usar los Servicios es posible que se le solicite información como su email, datos de facturación, pago y envío. Usted declara que toda la información que proporciona es correcta, actual y completa. Usted es el único responsable de la seguridad de su cuenta y no podrá transferirla a terceros.</p>

<h3>SECCIÓN 2 - NUESTROS PRODUCTOS</h3>
<p>Hemos hecho todo lo posible para mostrar nuestros productos de forma precisa. Los colores o apariencia pueden diferir según su pantalla. Todas las descripciones pueden modificarse sin previo aviso. Nos reservamos el derecho de interrumpir la venta de cualquier producto y de limitar cantidades.</p>

<h3>SECCIÓN 3 - PEDIDOS</h3>
<p>Cuando realiza un pedido, está haciendo una oferta de compra. Store Up se reserva el derecho de aceptar o rechazar su pedido. No se aceptará hasta que confirmemos y procesemos su pago. Revise sus pedidos cuidadosamente. Podrá devolver o cambiar su compra de acuerdo con nuestra <a href="/policies/refund-policy">política de reembolso</a>. Su compra es para uso personal o doméstico, no para reventa ni exportación comercial.</p>

<h3>SECCIÓN 4 - PRECIOS Y FACTURACIÓN</h3>
<p>Los precios, descuentos y promociones están sujetos a cambios sin previo aviso. El precio cobrado será el vigente al momento del pedido. Salvo indicación contraria, los precios no incluyen impuestos, envío, gestión, aduana ni cargos de importación. Usted acepta proporcionar información de pago verdadera y declara estar autorizado a usar el método de pago elegido.</p>

<h3>SECCIÓN 5 - ENVÍO Y ENTREGA</h3>
<p>No somos responsables de retrasos en el envío y la entrega. Todos los tiempos son estimaciones y no están garantizados. No seremos responsables por retrasos del transportista, aduana o eventos fuera de nuestro control. Una vez transferidos los productos al transportista, el riesgo de pérdida pasa a usted.</p>

<h3>SECCIÓN 6 - PROPIEDAD INTELECTUAL</h3>
<p>Nuestros Servicios (marcas, textos, imágenes, gráficos, reseñas, videos y su diseño) son propiedad de Store Up o sus licenciantes y están protegidos por las leyes de propiedad intelectual aplicables. Puede usar los Servicios solo para uso personal y no comercial. No reproduzca ni transmita material sin nuestro consentimiento por escrito. Los nombres y logos de Store Up son sus marcas; los de Shopify son de Shopify.</p>

<h3>SECCIÓN 7 - HERRAMIENTAS OPCIONALES</h3>
<p>Podemos darle acceso a herramientas de terceros que no controlamos, "tal cual" y "según disponibilidad", sin garantías. Su uso es por su cuenta y riesgo. Las nuevas funciones futuras también estarán sujetas a estos Términos.</p>

<h3>SECCIÓN 8 - ENLACES DE TERCEROS</h3>
<p>Los Servicios pueden contener enlaces a sitios de terceros que no controlamos. No somos responsables de su contenido. Si accede a ellos, lo hace por su cuenta y riesgo. Revise sus políticas antes de cualquier transacción.</p>

<h3>SECCIÓN 9 - RELACIÓN CON SHOPIFY</h3>
<p>Store Up opera con tecnología de Shopify. Cualquier compra que realice se hace directamente con Store Up. Shopify no es responsable de las ventas entre usted y Store Up. Usted exonera a Shopify de cualquier reclamación relacionada con su compra con Store Up.</p>

<h3>SECCIÓN 10 - POLÍTICA DE PRIVACIDAD</h3>
<p>Toda la información personal que recogemos está sujeta a nuestra <a href="/policies/privacy-policy">Política de privacidad</a>. Como los Servicios están alojados por Shopify, Shopify recoge y procesa información sobre su uso para ofrecer y mejorar los Servicios.</p>

<h3>SECCIÓN 11 - COMENTARIOS</h3>
<p>Si nos envía ideas, sugerencias o reseñas, nos otorga una licencia perpetua, mundial y libre de regalías para usarlas para cualquier propósito, incluido el comercial. Usted declara que posee los derechos sobre ese contenido. No tenemos obligación de mantenerlo confidencial ni de compensarlo.</p>

<h3>SECCIÓN 12 - ERRORES, INEXACTITUDES Y OMISIONES</h3>
<p>Puede haber información con errores tipográficos, inexactitudes u omisiones (descripciones, precios, promociones, envío, disponibilidad). Nos reservamos el derecho de corregirlos y de cambiar o cancelar pedidos si alguna información es inexacta, en cualquier momento sin previo aviso.</p>

<h3>SECCIÓN 13 - USOS PROHIBIDOS</h3>
<p>Podrá usar los Servicios solo con fines lícitos. No los use para fines ilegales, infringir leyes o propiedad intelectual, acosar a terceros, transmitir información falsa, suplantar a otros, subir virus o interferir con la seguridad. Podemos suspender o cancelar su cuenta si infringe estos Términos.</p>

<h3>SECCIÓN 14 - AGENTES</h3>
<p>Si usa un Agente (software autónomo) para interactuar con los Servicios, debe identificarse en cada solicitud HTTP/HTTPS ("Agente/[nombre]"), no ocultar su naturaleza, no imitar humanos ni eludir CAPTCHAs, responder con veracidad sobre si es humano, y no eludir medidas de control. Podemos limitar técnicamente el acceso de cualquier Agente.</p>

<h3>SECCIÓN 15 - RESCISIÓN</h3>
<p>Podemos rescindir su acceso a los Servicios en cualquier momento sin previo aviso. Usted seguirá siendo responsable de los importes adeudados. Las secciones que por su naturaleza deban sobrevivir continuarán aplicándose.</p>

<h3>SECCIÓN 16 - DESCARGO DE GARANTÍAS</h3>
<p>Salvo que la ley aplicable disponga lo contrario, los Servicios y productos se proporcionan "tal cual" y "según disponibilidad", sin garantías de ningún tipo. <strong>Si usted reside en la Unión Europea u otra jurisdicción con garantías legales obligatorias al consumidor, dichas garantías (incluida la garantía legal de 2 años) se mantienen vigentes y prevalecen sobre cualquier exención de este documento.</strong></p>

<h3>SECCIÓN 17 - LIMITACIÓN DE RESPONSABILIDAD</h3>
<p>En la máxima medida permitida por la ley, Store Up y sus partners no serán responsables de daños indirectos, incidentales, punitivos o consecuentes derivados del uso de los Servicios o productos. Esta limitación no afecta los derechos imperativos que la ley otorgue a los consumidores.</p>

<h3>SECCIÓN 18 - INDEMNIZACIÓN</h3>
<p>Usted acepta indemnizar y eximir de responsabilidad a Store Up, Shopify y sus afiliados de cualquier reclamación, incluidos honorarios de abogados, que surja de su incumplimiento de estos Términos, su violación de leyes o derechos de terceros, o su uso de los Servicios.</p>

<h3>SECCIÓN 19 - DISCREPANCIA</h3>
<p>Si alguna disposición se considera ilegal o inaplicable, será ejecutable en la máxima medida permitida y la parte inaplicable se excluirá sin afectar la validez del resto.</p>

<h3>SECCIÓN 20 - RENUNCIA; TODO EL ACUERDO</h3>
<p>El no ejercer un derecho no constituye renuncia. Estos Términos constituyen el acuerdo completo entre usted y nosotros, reemplazando acuerdos anteriores.</p>

<h3>SECCIÓN 21 - CESIÓN</h3>
<p>Usted no podrá ceder este acuerdo sin nuestro consentimiento por escrito. Nosotros podemos cederlo sin su consentimiento ni notificación.</p>

<h3>SECCIÓN 22 - LEY APLICABLE</h3>
<p>Estos Términos se regirán por las leyes de la jurisdicción donde Store Up tiene su sede (Brasil), sin perjuicio de los derechos imperativos que la legislación de protección al consumidor del país de residencia del cliente (por ejemplo, la Unión Europea) le otorgue.</p>

<h3>SECCIÓN 23 - ENCABEZADOS</h3>
<p>Los encabezados se incluyen solo para comodidad y no limitan estos Términos.</p>

<h3>SECCIÓN 24 - CAMBIOS A LOS TÉRMINOS</h3>
<p>Puede revisar la versión más actualizada en esta página en cualquier momento. Nos reservamos el derecho de actualizar estos Términos publicando los cambios en nuestro sitio. Su uso continuado tras la publicación constituye la aceptación de dichos cambios.</p>

<h3>SECCIÓN 25 - INFORMACIÓN DE CONTACTO</h3>
<p>Las preguntas sobre los Términos del Servicio deben enviarse a <strong>contacto@storeup.store</strong>.</p>
<p>Nuestra información de contacto:<br>
<strong>Store Up</strong><br>
Email: contacto@storeup.store<br>
Ubicación: Francisco Beltrão, Paraná, Brasil</p>
`;

const r = await gql(`
  mutation policyUpdate($shopPolicy: ShopPolicyInput!) {
    shopPolicyUpdate(shopPolicy: $shopPolicy) { shopPolicy { type url } userErrors { message } }
  }
`, { shopPolicy: { type: "TERMS_OF_SERVICE", body: TOS } });

if (r.errors?.length) console.log('❌ GraphQL:', r.errors[0].message);
else if (r.data?.shopPolicyUpdate?.userErrors?.length) console.log('❌', r.data.shopPolicyUpdate.userErrors[0].message);
else console.log('✅ Términos del Servicio actualizados de verdad:', r.data.shopPolicyUpdate.shopPolicy.url);

// Verificar que NO queden placeholders
const v = await gql('{ shop { shopPolicies { type body } } }');
const tos = v.data.shop.shopPolicies.find(p=>p.type==='TERMS_OF_SERVICE');
const hasPlaceholders = /INSERTAR|contato@|EMPRENDEDOR/.test(tos.body);
console.log(`\n🔍 ¿Quedan placeholders/errores? ${hasPlaceholders ? '⚠️ SÍ' : '✅ NO, limpio'}`);
console.log(`   Largo: ${tos.body.length} chars`);
