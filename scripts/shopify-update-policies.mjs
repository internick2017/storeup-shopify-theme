import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function graphql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const options = {
      hostname: SHOP, path: '/admin/api/2025-01/graphql.json', method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

// 1. Obtener IDs de las políticas
console.log('🔍 Obteniendo políticas...');
const pol = await graphql(`{ shop { shopPolicies { id type } } }`);
const policies = pol.data.shop.shopPolicies;
const tosId = policies.find(p => p.type === 'TERMS_OF_SERVICE')?.id;
const refundId = policies.find(p => p.type === 'REFUND_POLICY')?.id;
console.log('   ToS:', tosId, '| Refund:', refundId);

// ─── POLÍTICA DE REEMBOLSO (UE-compliant) ───
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

// ─── TÉRMINOS DEL SERVICIO (completados) ───
const TOS = `
<h3>INFORMACIÓN GENERAL</h3>
<p>¡Bienvenido a Store Up! Los términos "nosotros", "nos" y "nuestro" se refieren a Store Up. Store Up dirige esta tienda y sitio web, incluyendo toda la información, contenido, características, herramientas, productos y servicios relacionados para ofrecerle a usted, el cliente, una experiencia de compra selecta (los "Servicios"). Store Up usa la tecnología de Shopify, que nos permite ofrecerle los Servicios.</p>
<p>Los siguientes términos y condiciones, junto con cualquier política a la que se hace referencia en este documento (estos "Términos del Servicio" o "Términos") describen sus derechos y responsabilidades cuando utiliza los Servicios.</p>
<p>Lea atentamente estos Términos del Servicio, ya que incluyen información importante sobre sus derechos legales y cubren áreas como garantía, descargo de responsabilidad y limitación de responsabilidad.</p>
<p>Al visitar, interactuar con o utilizar nuestros Servicios, usted acepta estar sujeto a estos Términos del Servicio y nuestra <a href="/policies/privacy-policy">Política de privacidad</a>. Si no está de acuerdo con estos Términos del Servicio o Política de privacidad, no debe utilizar ni acceder a nuestros Servicios.</p>

<h3>SECCIÓN 1 - ACCESO Y CUENTA</h3>
<p>Al aceptar estos Términos del Servicio, usted declara que tiene al menos la mayoría de edad legal en su estado o provincia de residencia y nos ha dado su consentimiento para permitir que cualquiera de sus dependientes menores de edad utilice los Servicios en los dispositivos que posee, compra o administra.</p>
<p>Para utilizar los Servicios, incluido el acceso o la navegación en nuestras tiendas online o la compra de cualquiera de los productos o servicios que ofrecemos, es posible que se le solicite que proporcione cierta información, como su dirección de correo electrónico, información de facturación, de pago y de envío. Usted declara y garantiza que toda la información que proporciona en nuestra tienda es correcta, está actualizada y completa y que tiene todos los derechos necesarios para proporcionar esta información.</p>
<p>Usted es el único responsable de mantener la seguridad de las credenciales de su cuenta y de toda la actividad de su cuenta. No podrá transferir, vender, ceder ni licenciar su cuenta a ninguna otra persona.</p>

<h3>SECCIÓN 2 - NUESTROS PRODUCTOS</h3>
<p>Hemos hecho todo lo posible para que nuestros productos y servicios se muestren de forma precisa en nuestra tienda online. Sin embargo, tenga en cuenta que los colores o la apariencia del producto pueden diferir de cómo se muestran en su pantalla debido al tipo de dispositivo que utilice. No garantizamos que la apariencia o calidad de cualquier producto cumpla exactamente con cómo se muestra. Todas las descripciones pueden ser modificadas en cualquier momento sin previo aviso. Nos reservamos el derecho de interrumpir la venta de cualquier producto y de limitar las cantidades.</p>

<h3>SECCIÓN 3 - PEDIDOS</h3>
<p>Cuando realiza un pedido, está haciendo una oferta de compra. Store Up se reserva el derecho de aceptar o rechazar su pedido por cualquier motivo. No se aceptará su pedido hasta que Store Up confirme que lo acepta. Debemos recibir y procesar su pago antes de aceptar su pedido. Revise sus pedidos cuidadosamente antes de comprar. Podrá devolver o hacer cambios únicamente de acuerdo con nuestra <a href="/policies/refund-policy">política de reembolso</a>. Usted declara que su compra es para uso personal o doméstico y no para revenderla ni exportarla comercialmente.</p>

<h3>SECCIÓN 4 - PRECIOS Y FACTURACIÓN</h3>
<p>Los precios, descuentos y promociones están sujetos a cambios sin previo aviso. El precio cobrado será el vigente en el momento del pedido y se indicará en la confirmación. Salvo indicación contraria, los precios no incluyen impuestos, gastos de envío, gestión, aduana ni cargos de importación. Usted acepta proporcionar información de pago verdadera, correcta y completa, y declara estar autorizado a usar el método de pago elegido.</p>

<h3>SECCIÓN 5 - ENVÍO Y ENTREGA</h3>
<p>No somos responsables de retrasos en el envío y la entrega. Todos los tiempos de entrega son estimaciones y no están garantizados. No seremos responsables por retrasos ocasionados por la empresa de transporte, trámites aduaneros o eventos fuera de nuestro control. Una vez que transferimos los productos a la empresa de transporte, el título y el riesgo de pérdida se le transfieren a usted.</p>

<h3>SECCIÓN 6 - PROPIEDAD INTELECTUAL</h3>
<p>Nuestros Servicios, incluyendo marcas, textos, imágenes, gráficos, reseñas, videos y su diseño y disposición, son propiedad de Store Up, su afiliado o licenciante y están protegidos por las leyes de propiedad intelectual aplicables. Estos Términos le permiten utilizar los Servicios únicamente para su uso personal y no comercial. No debe reproducir, distribuir, modificar ni transmitir ningún material de los Servicios sin nuestro consentimiento previo por escrito. Los nombres, logos y eslóganes de Store Up son marcas de Store Up. Los de Shopify son marcas de Shopify.</p>

<h3>SECCIÓN 7 - HERRAMIENTAS OPCIONALES</h3>
<p>Podemos darle acceso a herramientas de terceros que no monitorizamos ni controlamos. Se proporcionan "tal cual" y "según disponibilidad" sin garantías. Su uso es por su cuenta y riesgo. Las nuevas funciones que ofrezcamos en el futuro también estarán sujetas a estos Términos.</p>

<h3>SECCIÓN 8 - ENLACES DE TERCEROS</h3>
<p>Los Servicios pueden contener enlaces a sitios de terceros que no controlamos. No somos responsables de su contenido ni exactitud. Si accede a sitios de terceros, lo hace por su cuenta y riesgo. Revise sus políticas antes de cualquier transacción.</p>

<h3>SECCIÓN 9 - RELACIÓN CON SHOPIFY</h3>
<p>Store Up opera con tecnología de Shopify, lo que nos permite ofrecerle los Servicios. Cualquier venta o compra que realice se hace directamente con Store Up. Shopify no es responsable de ningún aspecto de las ventas entre usted y Store Up. Usted exonera a Shopify y sus afiliados de cualquier reclamación relacionada con su compra con Store Up.</p>

<h3>SECCIÓN 10 - POLÍTICA DE PRIVACIDAD</h3>
<p>Toda la información personal que recogemos está sujeta a nuestra <a href="/policies/privacy-policy">Política de privacidad</a>. Debido a que los Servicios están alojados por Shopify, Shopify recoge y procesa información sobre su uso de los Servicios para ofrecerlos y mejorarlos.</p>

<h3>SECCIÓN 11 - COMENTARIOS</h3>
<p>Si nos envía ideas, sugerencias o reseñas ("comentario"), nos otorga una licencia perpetua, mundial y libre de regalías para usar, reproducir, modificar y mostrar dicho comentario para cualquier propósito, incluido el comercial. Usted declara que posee los derechos sobre el comentario y que cumple con estos Términos. No tenemos obligación de mantenerlo confidencial ni de compensarlo.</p>

<h3>SECCIÓN 12 - ERRORES, INEXACTITUDES Y OMISIONES</h3>
<p>Ocasionalmente puede haber información con errores tipográficos, inexactitudes u omisiones (descripciones, precios, promociones, envío, disponibilidad). Nos reservamos el derecho de corregir errores y de cambiar o cancelar pedidos si alguna información es inexacta, en cualquier momento sin previo aviso.</p>

<h3>SECCIÓN 13 - USOS PROHIBIDOS</h3>
<p>Podrá usar los Servicios únicamente con fines lícitos. No puede usarlos para propósitos ilegales, infringir leyes o derechos de propiedad intelectual, acosar a terceros, transmitir información falsa, suplantar a otros, subir virus, o interferir con la seguridad de los Servicios. Nos reservamos el derecho de suspender o cancelar su cuenta si infringe estos Términos.</p>

<h3>SECCIÓN 14 - AGENTES</h3>
<p>Esta sección aplica si usa un Agente (software que realiza acciones autónomas en su nombre) para interactuar con los Servicios. Los Agentes deben identificarse en cada solicitud HTTP/HTTPS revelando su nombre ("Agente/[nombre]"), no ocultar su naturaleza, no imitar comportamiento humano ni eludir CAPTCHAs, responder con veracidad sobre si son humanos o no, y no eludir medidas de control. Podemos limitar técnicamente el acceso de cualquier Agente.</p>

<h3>SECCIÓN 15 - RESCISIÓN</h3>
<p>Podemos rescindir este acuerdo o su acceso a los Servicios en cualquier momento sin previo aviso. Usted seguirá siendo responsable de los importes adeudados hasta la rescisión. Las secciones que por su naturaleza deban sobrevivir (Propiedad intelectual, Comentarios, Descargo de garantías, Limitación de responsabilidad, Indemnización, etc.) continuarán aplicándose.</p>

<h3>SECCIÓN 16 - DESCARGO DE RESPONSABILIDAD DE GARANTÍAS</h3>
<p>La información de los Servicios se proporciona solo con fines informativos. Salvo que la ley aplicable disponga lo contrario, los Servicios y productos se proporcionan "tal cual" y "según disponibilidad", sin garantías de ningún tipo. <strong>Nota: si usted reside en la Unión Europea u otra jurisdicción que otorgue garantías legales obligatorias al consumidor, dichas garantías (incluida la garantía legal de conformidad de 2 años) se mantienen vigentes y prevalecen sobre cualquier exención de este documento.</strong></p>

<h3>SECCIÓN 17 - LIMITACIÓN DE RESPONSABILIDAD</h3>
<p>En la máxima medida permitida por la ley, Store Up y sus partners no serán responsables de daños indirectos, incidentales, punitivos o consecuentes derivados de su uso de los Servicios o productos. Esta limitación no afecta los derechos que la ley aplicable otorgue de forma imperativa a los consumidores.</p>

<h3>SECCIÓN 18 - INDEMNIZACIÓN</h3>
<p>Usted acepta indemnizar y eximir de responsabilidad a Store Up, Shopify y sus afiliados de cualquier reclamación, incluidos honorarios de abogados, que surja de su incumplimiento de estos Términos, su violación de cualquier ley o derechos de terceros, o su uso de los Servicios.</p>

<h3>SECCIÓN 19 - DISCREPANCIA</h3>
<p>Si alguna disposición de estos Términos se considera ilegal, nula o inaplicable, será ejecutable en la máxima medida permitida y la parte inaplicable se excluirá sin afectar la validez de las disposiciones restantes.</p>

<h3>SECCIÓN 20 - RENUNCIA; TODO EL ACUERDO</h3>
<p>El hecho de que no ejerzamos algún derecho no constituye renuncia. Estos Términos constituyen el acuerdo completo entre usted y nosotros, reemplazando cualquier acuerdo anterior.</p>

<h3>SECCIÓN 21 - CESIÓN</h3>
<p>Usted no podrá ceder este acuerdo sin nuestro consentimiento previo por escrito. Nosotros podemos cederlo sin su consentimiento ni notificación.</p>

<h3>SECCIÓN 22 - LEY APLICABLE</h3>
<p>Estos Términos se regirán por las leyes de la jurisdicción donde Store Up tiene su sede (Brasil), sin perjuicio de los derechos imperativos que la legislación de protección al consumidor del país de residencia del cliente (por ejemplo, la Unión Europea) le otorgue.</p>

<h3>SECCIÓN 23 - ENCABEZADOS</h3>
<p>Los encabezados se incluyen únicamente para comodidad y no limitan estos Términos.</p>

<h3>SECCIÓN 24 - CAMBIOS A LOS TÉRMINOS DEL SERVICIO</h3>
<p>Puede revisar la versión más actualizada en cualquier momento en esta página. Nos reservamos el derecho de actualizar o cambiar estos Términos publicando los cambios en nuestro sitio. Su uso continuado tras la publicación constituye la aceptación de dichos cambios.</p>

<h3>SECCIÓN 25 - INFORMACIÓN DE CONTACTO</h3>
<p>Las preguntas sobre los Términos del Servicio deben enviarse a <strong>contacto@storeup.store</strong>.</p>
<p>Nuestra información de contacto:<br>
<strong>Store Up</strong><br>
Email: contacto@storeup.store<br>
Ubicación: Francisco Beltrão, Paraná, Brasil</p>
`;

// Aplicar
console.log('\n🔧 Actualizando Política de reembolso...');
const r1 = await graphql(`
  mutation policyUpdate($shopPolicy: ShopPolicyInput!) {
    shopPolicyUpdate(shopPolicy: $shopPolicy) { shopPolicy { type } userErrors { message } }
  }
`, { shopPolicy: { id: refundId, body: REFUND } });
console.log(r1.data?.shopPolicyUpdate?.userErrors?.length ? `❌ ${r1.data.shopPolicyUpdate.userErrors[0].message}` : '✅ Política de reembolso actualizada (UE-compliant)');

console.log('\n🔧 Actualizando Términos del Servicio...');
const r2 = await graphql(`
  mutation policyUpdate($shopPolicy: ShopPolicyInput!) {
    shopPolicyUpdate(shopPolicy: $shopPolicy) { shopPolicy { type } userErrors { message } }
  }
`, { shopPolicy: { id: tosId, body: TOS } });
console.log(r2.data?.shopPolicyUpdate?.userErrors?.length ? `❌ ${r2.data.shopPolicyUpdate.userErrors[0].message}` : '✅ Términos del Servicio actualizados (completados)');
