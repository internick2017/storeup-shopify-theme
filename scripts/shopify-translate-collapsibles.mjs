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
      hostname: SHOP, path: '/admin/api/2024-10/graphql.json', method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

const MAP = {
  "🚚 Envío y entrega": { en: "🚚 Shipping & delivery", pt: "🚚 Envio e entrega" },
  "<p>Envío <strong>gratuito</strong> a España. Entrega estimada en 15-25 días hábiles. Recibirás un número de seguimiento para rastrear tu pedido en todo momento.</p>": {
    en: "<p><strong>Free</strong> shipping. Estimated delivery in 15-25 business days. You'll get a tracking number to follow your order anytime.</p>",
    pt: "<p>Frete <strong>grátis</strong>. Entrega estimada em 15-25 dias úteis. Você receberá um código de rastreamento para acompanhar seu pedido a qualquer momento.</p>"
  },
  "✅ Garantía de satisfacción": { en: "✅ Satisfaction guarantee", pt: "✅ Garantia de satisfação" },
  "<p>Si tu Golden Hour no llega como esperabas, te <strong>devolvemos el dinero</strong>. Sin preguntas. Compra sin riesgo.</p>": {
    en: "<p>If your Golden Hour doesn't arrive as expected, we <strong>refund your money</strong>. No questions asked. Shop risk-free.</p>",
    pt: "<p>Se sua Golden Hour não chegar como esperado, <strong>devolvemos seu dinheiro</strong>. Sem perguntas. Compre sem risco.</p>"
  },
  "❓ Preguntas frecuentes": { en: "❓ FAQ", pt: "❓ Perguntas frequentes" },
  "<p><strong>¿Cómo se enciende?</strong> Se conecta por USB a cualquier cargador, power bank o PC. Un botón controla todo.</p><p><strong>¿Hace ruido?</strong> No, es totalmente silenciosa (0.6W). Ideal para dormir con ella.</p><p><strong>¿Sirve para fotos/videos?</strong> Sí, es el efecto favorito de creadores en TikTok e Instagram.</p>": {
    en: "<p><strong>How do I turn it on?</strong> Plug it into any USB charger, power bank or PC. One button controls everything.</p><p><strong>Is it noisy?</strong> No, completely silent (0.6W). Perfect to sleep with it on.</p><p><strong>Good for photos/videos?</strong> Yes, the favourite effect of TikTok & Instagram creators.</p>",
    pt: "<p><strong>Como liga?</strong> Conecta por USB em qualquer carregador, power bank ou PC. Um botão controla tudo.</p><p><strong>Faz barulho?</strong> Não, totalmente silenciosa (0.6W). Ideal para dormir com ela ligada.</p><p><strong>Serve para fotos/vídeos?</strong> Sim, o efeito favorito dos criadores no TikTok e Instagram.</p>"
  }
};

const reg = `mutation r($resourceId: ID!, $translations: [TranslationInput!]!) { translationsRegister(resourceId: $resourceId, translations: $translations) { userErrors { message } translations { key } } }`;
const res = await graphql(`{ translatableResources(first: 50, resourceType: ONLINE_STORE_THEME_JSON_TEMPLATE) { edges { node { resourceId translatableContent { key value digest } } } } }`);

let total = 0;
for (const { node } of res.data.translatableResources.edges) {
  if (!node.resourceId.includes('product')) continue;
  const trans = [];
  for (const c of node.translatableContent) {
    if (MAP[c.value]) {
      trans.push({ locale: "en", key: c.key, value: MAP[c.value].en, translatableContentDigest: c.digest });
      trans.push({ locale: "pt-BR", key: c.key, value: MAP[c.value].pt, translatableContentDigest: c.digest });
    }
  }
  if (trans.length) {
    const r = await graphql(reg, { resourceId: node.resourceId, translations: trans });
    const e = r.data?.translationsRegister?.userErrors;
    if (!e?.length) { total += trans.length; console.log(`✅ ${trans.length} traducciones registradas (en+pt)`); }
    else console.log(`⚠️  ${e[0].message}`);
  }
}
console.log(`\n📊 Total: ${total} traducciones de bloques de confianza`);
