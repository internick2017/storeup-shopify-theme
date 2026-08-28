import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const THEME_ID = '156532670622';

function api(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: SHOP, path: `/admin/api/2024-10${path}`, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', ...(data && { 'Content-Length': Buffer.byteLength(data) }) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}

const asset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=templates/product.json`);
const tpl = JSON.parse(asset.asset.value);
const mainKey = Object.keys(tpl.sections).find(k => tpl.sections[k].type?.includes('product') || k === 'main') || Object.keys(tpl.sections)[0];
const main = tpl.sections[mainKey];

console.log('Bloques actuales:', main.block_order.map(k => main.blocks[k]?.type).join(', '));

// Agregar bloques collapsible (envío, garantía, FAQ) después del buy button
main.blocks.trust_icons = {
  type: "collapsible_tab",
  settings: {
    heading: "🚚 Envío y entrega",
    icon: "truck",
    content: "",
    page: ""
  }
};
// Dawn collapsible usa 'content' (richtext). Lo seteamos:
main.blocks.trust_icons.settings.content = "<p>Envío <strong>gratuito</strong> a España. Entrega estimada en 15-25 días hábiles. Recibirás un número de seguimiento para rastrear tu pedido en todo momento.</p>";

main.blocks.guarantee = {
  type: "collapsible_tab",
  settings: {
    heading: "✅ Garantía de satisfacción",
    icon: "heart",
    content: "<p>Si tu Golden Hour no llega como esperabas, te <strong>devolvemos el dinero</strong>. Sin preguntas. Compra sin riesgo.</p>",
    page: ""
  }
};

main.blocks.faq = {
  type: "collapsible_tab",
  settings: {
    heading: "❓ Preguntas frecuentes",
    icon: "question_mark",
    content: "<p><strong>¿Cómo se enciende?</strong> Se conecta por USB a cualquier cargador, power bank o PC. Un botón controla todo.</p><p><strong>¿Hace ruido?</strong> No, es totalmente silenciosa (0.6W). Ideal para dormir con ella.</p><p><strong>¿Sirve para fotos/videos?</strong> Sí, es el efecto favorito de creadores en TikTok e Instagram.</p>",
    page: ""
  }
};

// Insertar después del buy_buttons si existe, si no al final
const buyIdx = main.block_order.findIndex(k => main.blocks[k]?.type === 'buy_buttons');
const newBlocks = ['trust_icons', 'guarantee', 'faq'];
if (buyIdx >= 0) {
  main.block_order.splice(buyIdx + 1, 0, ...newBlocks);
} else {
  main.block_order.push(...newBlocks);
}

const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'templates/product.json', value: JSON.stringify(tpl) }
});
console.log(r.errors ? `❌ ${JSON.stringify(r.errors)}` : '✅ Bloques de confianza agregados (envío, garantía, FAQ)');
console.log('Nuevo orden:', main.block_order.map(k => main.blocks[k]?.type).join(', '));
