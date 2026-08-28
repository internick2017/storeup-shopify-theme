import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const PRODUCT_ID = '8737067827358';

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

// 1. Habilitar pt-BR
console.log('🇧🇷 Habilitando portugués (pt-BR)...');
const enable = await graphql(`mutation { shopLocaleEnable(locale: "pt-BR") { shopLocale { locale } userErrors { message } } }`);
const ee = enable.data?.shopLocaleEnable?.userErrors;
console.log(ee?.length ? (ee[0].message.includes('already') ? '✅ pt-BR ya estaba' : `⚠️ ${ee[0].message}`) : '✅ pt-BR habilitado');

const pub = await graphql(`mutation { shopLocaleUpdate(locale: "pt-BR", shopLocale: { published: true }) { shopLocale { locale published } userErrors { message } } }`);
console.log('✅ pt-BR publicado');

// 2. Mapa español → portugués
const PT = {
  "La hora dorada, a cualquier hora": "A hora dourada, a qualquer hora",
  "Transforma tu cuarto en un atardecer infinito — sin ventanas, sin esperar": "Transforme seu quarto em um pôr do sol infinito — sem janelas, sem esperar",
  "Conseguir mi Golden Hour": "Quero minha Golden Hour",
  "🌅 Atardecer en segundos": "🌅 Pôr do sol em segundos",
  "<p>Enciéndela y tu cuarto cambia. Sin esperar. A cualquier hora del día o de la noche.</p>": "<p>Ligue e seu quarto se transforma. Sem esperar. A qualquer hora do dia ou da noite.</p>",
  "🎨 Tu cuarto, tu ambiente": "🎨 Seu quarto, seu ambiente",
  "<p>Gaming, meditación, streaming, descanso. La Golden Hour se adapta a tu momento.</p>": "<p>Gaming, meditação, streaming, descanso. A Golden Hour se adapta ao seu momento.</p>",
  "🚚 Envío gratis a España": "🚚 Frete grátis",
  "<p>Entrega en 15-25 días. Garantía de satisfacción incluida. Sin riesgos.</p>": "<p>Entrega em 15-25 dias. Garantia de satisfação incluída. Sem riscos.</p>",
  "Elige tu Golden Hour": "Escolha sua Golden Hour",
  "Miles de cuartos transformados": "Milhares de quartos transformados",
  "<p>⭐⭐⭐⭐⭐ +500 clientes &nbsp;|&nbsp; 🚚 Envío gratis &nbsp;|&nbsp; ↩️ Garantía &nbsp;|&nbsp; 🔒 Pago seguro</p>": "<p>⭐⭐⭐⭐⭐ +500 clientes &nbsp;|&nbsp; 🚚 Frete grátis &nbsp;|&nbsp; ↩️ Garantia &nbsp;|&nbsp; 🔒 Pagamento seguro</p>",
  "<p>Productos seleccionados para transformar tu espacio</p>": "<p>Produtos selecionados para transformar seu espaço</p>",
  "Productos seleccionados para transformar tu espacio": "Produtos selecionados para transformar seu espaço",
  "🚚 Envío gratuito a toda España — Garantía de devolución": "🚚 Frete grátis — Garantia de devolução",
  "🚚 Envío gratuito a toda España": "🚚 Frete grátis para todo o Brasil",
  "Transforma tu espacio": "Transforme seu espaço",
  "<p>Productos únicos para hacer de tu habitación un lugar especial. Envío gratis a toda España.</p>": "<p>Produtos únicos para tornar seu quarto um lugar especial. Frete grátis.</p>",
  "Inicio": "Início",
  "Catálogo": "Catálogo",
  // Producto
  "Lámpara Golden Hour™ — Proyector de Ambiente": "Luminária Golden Hour™ — Projetor de Ambiente",
};

function isSpanish(val) {
  if (!val || val.length > 2000) return false;
  return /[áéíóúñ¿¡]|atardecer|cuarto|dorada|Golden|clientes|Env[íi]o|ambiente|Elige|Conseguir|Transforma|Productos|espacio|Inicio|Cat[áa]logo/i.test(val);
}

const THEME_TYPES = [
  'ONLINE_STORE_THEME_JSON_TEMPLATE',
  'ONLINE_STORE_THEME_SETTINGS_DATA_SECTIONS',
  'ONLINE_STORE_THEME_SECTION_GROUP',
  'ONLINE_STORE_THEME_SETTINGS_CATEGORY',
];

const regMutation = `
  mutation r($resourceId: ID!, $translations: [TranslationInput!]!) {
    translationsRegister(resourceId: $resourceId, translations: $translations) {
      userErrors { message } translations { key }
    }
  }
`;

let total = 0;
const unmapped = [];

console.log('\n🔧 Registrando traducciones al portugués...');
for (const type of THEME_TYPES) {
  const res = await graphql(`{
    translatableResources(first: 50, resourceType: ${type}) {
      edges { node { resourceId translatableContent { key value digest } } }
    }
  }`);
  if (res.errors) { console.log(`⚠️  ${type}: ${res.errors[0].message}`); continue; }

  for (const { node } of res.data.translatableResources.edges) {
    const trans = [];
    for (const c of node.translatableContent) {
      if (!c.value) continue;
      if (PT[c.value]) trans.push({ locale: "pt-BR", key: c.key, value: PT[c.value], translatableContentDigest: c.digest });
      else if (isSpanish(c.value)) unmapped.push({ type, value: c.value.substring(0, 60) });
    }
    if (trans.length) {
      const r = await graphql(regMutation, { resourceId: node.resourceId, translations: trans });
      const e = r.data?.translationsRegister?.userErrors;
      if (!e?.length) { total += r.data.translationsRegister.translations.length; console.log(`✅ ${type}: ${trans.length} pt-BR`); }
      else console.log(`⚠️  ${type}: ${e[0].message}`);
    }
  }
}

// Menú (LINK)
console.log('\n🔧 Menú...');
const menuRes = await graphql(`{ translatableResources(first: 50, resourceType: LINK) { edges { node { resourceId translatableContent { key value digest } } } } }`);
for (const { node } of menuRes.data.translatableResources.edges) {
  const trans = [];
  for (const c of node.translatableContent) {
    if (PT[c.value]) trans.push({ locale: "pt-BR", key: c.key, value: PT[c.value], translatableContentDigest: c.digest });
  }
  if (trans.length) {
    const r = await graphql(regMutation, { resourceId: node.resourceId, translations: trans });
    if (!r.data?.translationsRegister?.userErrors?.length) { total += trans.length; console.log(`✅ Menú: ${trans.length} pt-BR`); }
  }
}

// Producto
console.log('\n🛍️  Producto...');
const productGid = `gid://shopify/Product/${PRODUCT_ID}`;
const pr = await graphql(`{ translatableResource(resourceId: "${productGid}") { translatableContent { key value digest } } }`);
const prodTrans = [];
for (const c of pr.data.translatableResource.translatableContent) {
  if (c.key === 'title') {
    prodTrans.push({ locale: "pt-BR", key: "title", value: "Luminária Golden Hour™ — Projetor de Ambiente", translatableContentDigest: c.digest });
  } else if (c.key === 'body_html') {
    prodTrans.push({ locale: "pt-BR", key: "body_html", value: `
<div>
<h2>Transforme qualquer quarto em um pôr do sol infinito</h2>
<p>Porque a hora dourada não deveria durar só alguns minutos.</p>
<p>A <strong>Luminária Golden Hour™</strong> projeta tons quentes de pôr do sol — laranja, vermelho e roxo — em qualquer parede, transformando seu quarto em segundos. Sem janelas. Sem esperar. A qualquer hora do dia.</p>
<h3>✨ Por que você vai amar</h3>
<ul>
  <li>🌅 <strong>Efeito pôr do sol real</strong> — tons do âmbar quente ao roxo profundo</li>
  <li>📐 <strong>Cabeça giratória 180°</strong> — aponte para a parede, teto ou qualquer canto</li>
  <li>🔌 <strong>USB plug & play</strong> — conecte e pronto. Sem pilhas, sem instalação</li>
  <li>🔇 <strong>Silenciosa</strong> — 0.6W, perfeita para dormir com ela ligada</li>
  <li>📸 <strong>Viral no TikTok e Instagram</strong> — o filtro de luz favorito dos criadores</li>
  <li>🎁 <strong>O presente que ninguém espera</strong> — compacta, bonita e diferente</li>
</ul>
<h3>⚡ Especificações</h3>
<ul>
  <li>Alimentação: USB 5V (cabo incluído)</li>
  <li>Potência: 0.6–0.8W</li>
  <li>Vida útil: +50.000 horas</li>
  <li>Rotação: 180° ajustável</li>
</ul>
<p><em>Frete grátis. Garantia de satisfação incluída.</em></p>
</div>`, translatableContentDigest: c.digest });
  }
}
if (prodTrans.length) {
  const r = await graphql(regMutation, { resourceId: productGid, translations: prodTrans });
  const e = r.data?.translationsRegister?.userErrors;
  console.log(e?.length ? `⚠️  ${e[0].message}` : `✅ Producto: ${prodTrans.length} pt-BR`);
  total += prodTrans.length;
}

console.log(`\n📊 Total portugués: ${total} traducciones`);
if (unmapped.length) {
  console.log('\n⚠️  Sin traducir al portugués:');
  [...new Set(unmapped.map(u => u.value))].forEach(v => console.log(`   "${v}"`));
}
console.log('\n🎉 Portugués agregado para Brasil.');
