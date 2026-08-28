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

const EN = `
<div>
<h2>Turn any room into an endless golden hour</h2>
<p>Because the golden hour shouldn't last just a few minutes.</p>
<p>The <strong>Golden Hour Lamp™</strong> projects warm sunset tones on any wall, transforming your room in seconds. No windows. No waiting. Any hour of the day.</p>
<h3>✨ Choose your version</h3>
<ul>
  <li><strong>🌅 Classic — Sunset:</strong> the classic warm sunset effect, one-button on. Perfect to start.</li>
  <li><strong>🎨 Golden — 16 Colors:</strong> 16 adjustable colors (red, purple, blue, green and more) <strong>with remote control</strong> and 4 light modes. Change the mood without getting up.</li>
  <li><strong>📱 Pro — App Control:</strong> control everything <strong>from your phone</strong> via app (Tuya / Smart Life) + remote included. Schedule timers, colors and brightness remotely.</li>
</ul>
<h3>🎁 All include</h3>
<ul>
  <li>📐 <strong>180° rotating head</strong> — project on wall, ceiling or corner</li>
  <li>🔌 <strong>USB plug & play</strong> — no batteries, no setup</li>
  <li>🔇 <strong>Silent</strong> — perfect to sleep with it on</li>
  <li>📸 <strong>Viral on TikTok & Instagram</strong> — creators' favourite light filter</li>
</ul>
<h3>⚡ Specs</h3>
<ul>
  <li>Power: USB 5V (cable included)</li>
  <li>Lifespan: +50,000 hours</li>
  <li>Rotation: 180° adjustable</li>
</ul>
<p><em>Free shipping. Satisfaction guarantee included.</em></p>
</div>`;

const PT = `
<div>
<h2>Transforme qualquer quarto em um pôr do sol infinito</h2>
<p>Porque a hora dourada não deveria durar só alguns minutos.</p>
<p>A <strong>Luminária Golden Hour™</strong> projeta tons quentes de pôr do sol em qualquer parede, transformando seu quarto em segundos. Sem janelas. Sem esperar. A qualquer hora do dia.</p>
<h3>✨ Escolha sua versão</h3>
<ul>
  <li><strong>🌅 Clássica — Pôr do sol:</strong> o efeito sunset quente de sempre, liga com um botão. Perfeita para começar.</li>
  <li><strong>🎨 Golden — 16 Cores:</strong> 16 cores ajustáveis (vermelho, roxo, azul, verde e mais) <strong>com controle remoto</strong> e 4 modos de luz. Mude o ambiente sem levantar.</li>
  <li><strong>📱 Pro — Controle por App:</strong> controle tudo <strong>pelo celular</strong> com o app (Tuya / Smart Life) + controle remoto incluído. Programe horários, cores e brilho à distância.</li>
</ul>
<h3>🎁 Todas incluem</h3>
<ul>
  <li>📐 <strong>Cabeça giratória 180°</strong> — projete na parede, teto ou canto</li>
  <li>🔌 <strong>USB plug & play</strong> — sem pilhas, sem instalação</li>
  <li>🔇 <strong>Silenciosa</strong> — ideal para dormir com ela ligada</li>
  <li>📸 <strong>Viral no TikTok e Instagram</strong> — o filtro de luz favorito dos criadores</li>
</ul>
<h3>⚡ Especificações</h3>
<ul>
  <li>Alimentação: USB 5V (cabo incluído)</li>
  <li>Vida útil: +50.000 horas</li>
  <li>Rotação: 180° ajustável</li>
</ul>
<p><em>Frete grátis. Garantia de satisfação incluída.</em></p>
</div>`;

const productGid = `gid://shopify/Product/${PRODUCT_ID}`;
const tr = await graphql(`{ translatableResource(resourceId: "${productGid}") { translatableContent { key digest } } }`);
const bodyDigest = tr.data.translatableResource.translatableContent.find(c => c.key === 'body_html')?.digest;

const r = await graphql(`
  mutation r($resourceId: ID!, $translations: [TranslationInput!]!) {
    translationsRegister(resourceId: $resourceId, translations: $translations) {
      userErrors { message } translations { locale }
    }
  }
`, {
  resourceId: productGid,
  translations: [
    { locale: "en", key: "body_html", value: EN, translatableContentDigest: bodyDigest },
    { locale: "pt-BR", key: "body_html", value: PT, translatableContentDigest: bodyDigest }
  ]
});
const e = r.data?.translationsRegister?.userErrors;
console.log(e?.length ? `❌ ${e[0].message}` : '✅ Descripción traducida a EN + PT (3 versiones honestas)');
