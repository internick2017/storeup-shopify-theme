import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const BASE = `https://${env.SHOPIFY_SHOP}/admin/api/2024-10`;
const HDR = { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' };

async function rest(method, path, body) {
  const r = await fetch(`${BASE}${path}`, { method, headers: HDR, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  return { status: r.status, body: text ? JSON.parse(text) : {} };
}
async function gql(query, variables) {
  const r = await fetch(`${BASE}/graphql.json`, { method: 'POST', headers: HDR, body: JSON.stringify({ query, variables }) });
  return r.json();
}

const PRODUCT_PATH = '/products/lampara-proyectora-de-atardecer-ambiente-aesthetic-para-tu-cuarto';

const FAQ = {
  es: {
    title: 'Preguntas frecuentes',
    seoTitle: 'Preguntas Frecuentes — Envíos, Devoluciones y Pagos | Store Up',
    seoDesc: 'Resolvemos tus dudas: tiempos de envío, seguimiento, devoluciones de 14 días, garantía de 2 años y métodos de pago seguros.',
    qa: [
      ['¿Cuánto tarda en llegar mi pedido?', `Procesamos los pedidos en 1-3 días hábiles y la entrega estimada es de 15 a 25 días hábiles según el destino. En cuanto tu pedido sale, te enviamos el número de seguimiento por email.`],
      ['¿El envío es gratis?', `Sí: el envío a España y Brasil es gratuito. Para el resto de países, la tarifa exacta se muestra en el checkout antes de pagar.`],
      ['¿Cómo sigo mi pedido?', `Todos los pedidos incluyen número de seguimiento. Lo recibirás por email cuando despachemos tu pedido y podrás rastrearlo en todo momento.`],
      ['¿Qué pasa si mi pedido no llega?', `Escríbenos a contacto@storeup.store. Investigamos con el transportista y, si no se resuelve, te ofrecemos reenvío o reembolso completo.`],
      ['¿Puedo devolver mi compra?', `Sí. Tienes 14 días naturales desde que recibes el pedido para desistir de la compra (clientes UE), y todos los productos tienen 2 años de garantía legal. Consulta la política de reembolso para los pasos.`],
      ['¿Qué métodos de pago aceptáis?', `Tarjeta (Visa, Mastercard, American Express y más), Apple Pay y Google Pay. El pago es 100% seguro con verificación 3D Secure.`],
      ['¿Cuál es la diferencia entre las 3 versiones de la lámpara?', `La <strong>Clásica</strong> proyecta el atardecer naranja con un botón; la <strong>Golden</strong> añade 16 colores con mando a distancia; la <strong>Pro</strong> se controla desde el móvil con la app (Tuya / Smart Life). <a href="${PRODUCT_PATH}">Compáralas aquí</a>.`],
      ['¿Hay descuento en la primera compra?', `Sí: usa el código <strong>BIENVENIDO10</strong> en el checkout y obtén un 10% de descuento en tu primer pedido.`],
      ['¿La lámpara hace ruido o consume mucho?', `Es totalmente silenciosa, funciona por USB (5V) y su consumo es mínimo — puedes dormir con ella encendida sin problema.`],
    ],
  },
  en: {
    title: 'FAQ',
    seoTitle: 'FAQ — Shipping, Returns & Payments | Store Up',
    seoDesc: 'Your questions answered: delivery times, order tracking, 14-day returns, 2-year warranty and secure payment methods.',
    qa: [
      ['How long does delivery take?', `We process orders within 1-3 business days and estimated delivery is 15 to 25 business days depending on destination. As soon as your order ships, we email you the tracking number.`],
      ['Is shipping free?', `Yes: shipping to Spain and Brazil is free. For other countries, the exact rate is shown at checkout before you pay.`],
      ['How do I track my order?', `Every order includes a tracking number. You'll receive it by email once your order ships, so you can follow it at any time.`],
      ['What if my order doesn’t arrive?', `Write to us at contacto@storeup.store. We investigate with the carrier and, if unresolved, we offer a reshipment or a full refund.`],
      ['Can I return my purchase?', `Yes. You have 14 calendar days from delivery to withdraw from the purchase (EU customers), and all products carry a 2-year legal warranty. See the refund policy for the steps.`],
      ['Which payment methods do you accept?', `Card (Visa, Mastercard, American Express and more), Apple Pay and Google Pay. Payment is 100% secure with 3D Secure verification.`],
      ['What’s the difference between the 3 lamp versions?', `The <strong>Classic</strong> projects the orange sunset with one button; the <strong>Golden</strong> adds 16 colors with a remote; the <strong>Pro</strong> is controlled from your phone via the app (Tuya / Smart Life). <a href="/en${PRODUCT_PATH}">Compare them here</a>.`],
      ['Is there a first-order discount?', `Yes: use code <strong>BIENVENIDO10</strong> at checkout for 10% off your first order.`],
      ['Is the lamp noisy or power-hungry?', `It's completely silent, runs on USB (5V) and uses minimal power — you can sleep with it on, no problem.`],
    ],
  },
  'pt-BR': {
    title: 'Perguntas frequentes',
    seoTitle: 'Perguntas Frequentes — Envios, Devoluções e Pagamentos | Store Up',
    seoDesc: 'Tire suas dúvidas: prazos de entrega, rastreamento, devolução em 14 dias, garantia de 2 anos e métodos de pagamento seguros.',
    qa: [
      ['Quanto tempo demora a entrega?', `Processamos os pedidos em 1-3 dias úteis e a entrega estimada é de 15 a 25 dias úteis conforme o destino. Assim que o pedido for despachado, enviamos o código de rastreamento por email.`],
      ['O frete é grátis?', `Sim: o envio para a Espanha e o Brasil é gratuito. Para os demais países, a tarifa exata aparece no checkout antes de pagar.`],
      ['Como acompanho meu pedido?', `Todos os pedidos incluem código de rastreamento. Você o recebe por email quando o pedido for despachado e pode acompanhá-lo a qualquer momento.`],
      ['E se o meu pedido não chegar?', `Escreva para contacto@storeup.store. Investigamos com a transportadora e, se não for resolvido, oferecemos reenvio ou reembolso total.`],
      ['Posso devolver minha compra?', `Sim. Você tem 14 dias corridos a partir do recebimento para desistir da compra (clientes da UE), e todos os produtos têm 2 anos de garantia legal. Veja a política de reembolso para os passos.`],
      ['Quais métodos de pagamento vocês aceitam?', `Cartão (Visa, Mastercard, American Express e mais), Apple Pay e Google Pay. O pagamento é 100% seguro com verificação 3D Secure.`],
      ['Qual a diferença entre as 3 versões da luminária?', `A <strong>Clássica</strong> projeta o pôr do sol laranja com um botão; a <strong>Golden</strong> adiciona 16 cores com controle remoto; a <strong>Pro</strong> é controlada pelo celular com o app (Tuya / Smart Life). <a href="/pt${PRODUCT_PATH}">Compare aqui</a>.`],
      ['Tem desconto na primeira compra?', `Sim: use o código <strong>BIENVENIDO10</strong> no checkout e ganhe 10% de desconto no primeiro pedido.`],
      ['A luminária faz barulho ou gasta muita energia?', `É totalmente silenciosa, funciona por USB (5V) e o consumo é mínimo — você pode dormir com ela ligada sem problema.`],
    ],
  },
};

const buildBody = (loc) => FAQ[loc].qa.map(([q, a]) => `<h3>${q}</h3>\n<p>${a}</p>`).join('\n');

// ── 1) Create FAQ page (idempotent) ──────────────────────────────
console.log('1️⃣ Página FAQ...');
let page;
const existing = await rest('GET', '/pages.json?handle=faq');
if (existing.body.pages && existing.body.pages.length) {
  page = existing.body.pages[0];
  console.log(`   ⏭️ Ya existe: ${page.id} (/pages/${page.handle})`);
} else {
  const created = await rest('POST', '/pages.json', {
    page: {
      title: FAQ.es.title,
      handle: 'faq',
      body_html: buildBody('es'),
      published: true,
      metafields: [
        { namespace: 'global', key: 'title_tag', value: FAQ.es.seoTitle, type: 'single_line_text_field' },
        { namespace: 'global', key: 'description_tag', value: FAQ.es.seoDesc, type: 'single_line_text_field' },
      ],
    },
  });
  if (created.status !== 201) { console.error('   ❌', created.status, JSON.stringify(created.body).slice(0, 300)); process.exit(1); }
  page = created.body.page;
  console.log(`   ✅ Creada: ${page.id} (/pages/${page.handle})`);
}

// ── 2) Translate the page EN + PT-BR ─────────────────────────────
console.log('\n2️⃣ Traduciendo página FAQ...');
// Resource type for pages in 2024-10: try Page gid first (articles turned out to be Article)
let pageGid = `gid://shopify/Page/${page.id}`;
let trRes = await gql(`query($id: ID!) { translatableResource(resourceId: $id) { resourceId translatableContent { key value digest } } }`, { id: pageGid });
if (!trRes.data || !trRes.data.translatableResource) {
  pageGid = `gid://shopify/OnlineStorePage/${page.id}`;
  trRes = await gql(`query($id: ID!) { translatableResource(resourceId: $id) { resourceId translatableContent { key value digest } } }`, { id: pageGid });
}
if (!trRes.data || !trRes.data.translatableResource) {
  console.error('   ❌ No encontré el recurso traducible de la página:', JSON.stringify(trRes).slice(0, 300));
} else {
  const content = trRes.data.translatableResource.translatableContent;
  const dig = (key) => { const c = content.find(x => x.key === key); return c ? c.digest : null; };
  for (const locale of ['en', 'pt-BR']) {
    const t = FAQ[locale];
    const translations = [];
    if (dig('title')) translations.push({ locale, key: 'title', value: t.title, translatableContentDigest: dig('title') });
    if (dig('body_html')) translations.push({ locale, key: 'body_html', value: buildBody(locale), translatableContentDigest: dig('body_html') });
    if (dig('meta_title')) translations.push({ locale, key: 'meta_title', value: t.seoTitle, translatableContentDigest: dig('meta_title') });
    if (dig('meta_description')) translations.push({ locale, key: 'meta_description', value: t.seoDesc, translatableContentDigest: dig('meta_description') });
    const reg = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) {
      translationsRegister(resourceId: $id, translations: $t) {
        translations { locale key } userErrors { field message }
      } }`, { id: pageGid, t: translations });
    if (reg.errors) { console.error(`   ❌ ${locale} errors:`, JSON.stringify(reg.errors).slice(0, 300)); continue; }
    const ue = reg.data.translationsRegister.userErrors;
    if (ue.length) console.error(`   ❌ ${locale} userErrors:`, JSON.stringify(ue).slice(0, 300));
    else console.log(`   ✅ ${locale}: ${reg.data.translationsRegister.translations.length} claves`);
  }
}

// ── 3) Footer menu: fix PT titles + add FAQ & Contacto ──────────
console.log('\n3️⃣ Menú footer...');
const menus = await gql(`query { menus(first: 10) { nodes { id handle title items { id title type url resourceId items { id title type url resourceId } } } } }`);
const footer = menus.data.menus.nodes.find(m => m.handle === 'footer');
if (!footer) { console.error('   ❌ No hay menú footer'); process.exit(1); }
console.log('   Antes:', footer.items.map(i => i.title).join(' | '));

const RENAMES = { 'Busca': 'Búsqueda', 'Suas opções de privacidade': 'Tus opciones de privacidad' };
const toInput = (i) => {
  const inp = { id: i.id, title: RENAMES[i.title] || i.title, type: i.type };
  if (i.resourceId) inp.resourceId = i.resourceId;
  else if (i.url) inp.url = i.url;
  if (i.items && i.items.length) inp.items = i.items.map(toInput);
  return inp;
};
const items = footer.items.map(toInput);
if (!footer.items.some(i => /faq|preguntas/i.test(i.title))) {
  items.push({ title: 'Preguntas frecuentes', type: 'PAGE', resourceId: `gid://shopify/Page/${page.id}` });
}
if (!footer.items.some(i => /contacto|contato|contact/i.test(i.title))) {
  items.push({ title: 'Contacto', type: 'HTTP', url: '/pages/contact' });
}
const upd = await gql(`mutation($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
  menuUpdate(id: $id, title: $title, items: $items) {
    menu { items { id title } } userErrors { field message }
  } }`, { id: footer.id, title: footer.title, items });
if (upd.errors || upd.data.menuUpdate.userErrors.length) {
  console.error('   ❌', JSON.stringify(upd.errors || upd.data.menuUpdate.userErrors).slice(0, 400)); process.exit(1);
}
console.log('   ✅ Ahora:', upd.data.menuUpdate.menu.items.map(i => i.title).join(' | '));

// ── 4) Translate footer LINK items (en + pt-BR) ──────────────────
console.log('\n4️⃣ Traduciendo items del footer...');
const LINK_T = {
  'Búsqueda': { en: 'Search', 'pt-BR': 'Busca' },
  'Tus opciones de privacidad': { en: 'Your privacy choices', 'pt-BR': 'Suas opções de privacidade' },
  'Preguntas frecuentes': { en: 'FAQ', 'pt-BR': 'Perguntas frequentes' },
  'Contacto': { en: 'Contact', 'pt-BR': 'Contato' },
};
const links = await gql(`query { translatableResources(first: 100, resourceType: LINK) { nodes { resourceId translatableContent { key value digest } } } }`);
let count = 0;
for (const node of links.data.translatableResources.nodes) {
  const c = node.translatableContent.find(x => x.key === 'title');
  if (!c || !LINK_T[c.value]) continue;
  for (const locale of ['en', 'pt-BR']) {
    const reg = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) {
      translationsRegister(resourceId: $id, translations: $t) {
        translations { locale key } userErrors { field message }
      } }`, { id: node.resourceId, t: [{ locale, key: 'title', value: LINK_T[c.value][locale], translatableContentDigest: c.digest }] });
    if (reg.errors || (reg.data && reg.data.translationsRegister.userErrors.length)) {
      console.error(`   ❌ "${c.value}" ${locale}:`, JSON.stringify(reg.errors || reg.data.translationsRegister.userErrors).slice(0, 200));
    } else count++;
  }
}
console.log(`   ✅ ${count} traducciones de menú registradas`);

console.log('\n🎉 FAQ + footer listos.');
