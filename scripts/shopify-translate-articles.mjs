// Register EN + pt-BR translations for 3 blog articles via Shopify Translations API.
// Credentials are loaded from f:/tmp/shopify.env (never hardcoded here).
import fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('f:/tmp/shopify.env', 'utf8')
    .split(/\r?\n/).filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP = env.SHOPIFY_SHOP;
if (!TOKEN || !SHOP) throw new Error('Missing credentials in shopify.env');
const GQL = `https://${SHOP}/admin/api/2024-10/graphql.json`;

const PRODUCT = 'lampara-proyectora-de-atardecer-ambiente-aesthetic-para-tu-cuarto';
const P_EN = `/en/products/${PRODUCT}`;
const P_PT = `/pt/products/${PRODUCT}`;

async function gql(query, variables) {
  const r = await fetch(GQL, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const j = await r.json();
  if (j.errors) throw new Error('GraphQL errors: ' + JSON.stringify(j.errors));
  return j.data;
}

// ---------- Translations (hand-written) ----------

const T = {
  // ============ Article 1: ideas-cuarto-aesthetic ============
  'gid://shopify/Article/645853249694': {
    en: {
      title: '10 Ideas to Get an Aesthetic Room Without Spending a Lot',
      meta_title: '10 Aesthetic Room Ideas on a Budget (2026) | Store Up',
      meta_description: 'Turn your bedroom into an aesthetic space on a budget: warm lighting, a sunset lamp, plants, mirrors and more. Practical 2026 guide.',
      body_html: `
<p>You don't need to redecorate your whole bedroom or spend hundreds of euros to get that <strong>aesthetic room</strong> you see on TikTok and Pinterest. The key is light, textures and a few well-chosen details.</p>
<h2>1. Swap white light for warm light</h2>
<p>It's the cheapest change and the one you notice the most. White ceiling light kills any ambiance. Turn it off and use warm light sources at mid height: the room goes from "hospital" to "cozy café" in seconds.</p>
<h2>2. A sunset lamp (the viral trick)</h2>
<p>If you only buy one thing from this list, make it this one. The <a href="${P_EN}">sunset projector lamp</a> casts a circle of golden light on the wall that mimics golden hour. It's the perfect backdrop for photos and the reason half of TikTok has an orange bedroom.</p>
<h2>3. Plants (real or not)</h2>
<p>A hanging pothos, a small monstera or even dried eucalyptus in a vase. Greenery breaks the monotony and adds life effortlessly.</p>
<h2>4. A full-length mirror leaning against the wall</h2>
<p>It visually enlarges the space, bounces light around and is the classic of aesthetic photos. Leaning, not hung: it looks more relaxed.</p>
<h2>5. Textiles with texture</h2>
<p>A chunky knit blanket, linen cushions, a small rug. Textures make a room feel expensive even when it isn't.</p>
<h2>6. Warm string lights</h2>
<p>Around the headboard or on the wall. Combined with the sunset lamp they create layers of light that add depth.</p>
<h2>7. Posters or prints (well placed)</h2>
<p>Better 2-3 large prints than 15 small ones. Earth tones, analog photography or simple typography.</p>
<h2>8. Hide the cables</h2>
<p>Nothing breaks the mood more than a power strip in plain sight. Adhesive cable covers or zip ties: 5 euros and it looks like a different room.</p>
<h2>9. A tray or "pretty" corner</h2>
<p>Perfume, a candle, a book and jewelry on a tray on the dresser. A single tidy, decorative spot elevates everything else.</p>
<h2>10. Fewer things, better chosen</h2>
<p>Real aesthetic is 50% removing. Clear your surfaces and let the things you truly love breathe.</p>
<h2>Start with the light</h2>
<p>If we had to sum this guide up in one sentence: <em>light makes the room</em>. And the fastest way to transform it is to project your own sunset.</p>
<p><a href="${P_EN}"><strong>👉 See the Golden Hour™ Lamp (from €24.99 — free shipping)</strong></a></p>`
    },
    'pt-BR': {
      title: '10 ideias para conseguir um quarto aesthetic sem gastar muito',
      meta_title: '10 Ideias para um Quarto Aesthetic Barato (2026) | Store Up',
      meta_description: 'Transforme seu quarto em um espaço aesthetic gastando pouco: luz quente, lâmpada de pôr do sol, plantas, espelhos e mais. Guia prático 2026.',
      body_html: `
<p>Você não precisa redecorar o quarto inteiro nem gastar centenas de euros para conseguir aquele <strong>quarto aesthetic</strong> que você vê no TikTok e no Pinterest. O segredo está na luz, nas texturas e em poucos detalhes bem escolhidos.</p>
<h2>1. Troque a luz branca por luz quente</h2>
<p>É a mudança mais barata e a que mais faz diferença. A luz branca do teto mata qualquer clima. Apague-a e use fontes de luz quente a meia altura: o quarto passa de "hospital" para "café aconchegante" em segundos.</p>
<h2>2. Uma lâmpada de pôr do sol (o truque viral)</h2>
<p>Se você for comprar só uma coisa desta lista, que seja esta. A <a href="${P_PT}">lâmpada projetora de pôr do sol</a> projeta um círculo de luz dourada na parede que imita a golden hour. É o fundo perfeito para fotos e o motivo pelo qual metade do TikTok tem o quarto laranja.</p>
<h2>3. Plantas (de verdade ou não)</h2>
<p>Uma jiboia pendente, uma costela-de-adão pequena ou até eucalipto seco num vaso. O verde quebra a monotonia e dá vida sem esforço.</p>
<h2>4. Espelho de corpo inteiro apoiado na parede</h2>
<p>Amplia visualmente o espaço, reflete a luz e é o clássico das fotos aesthetic. Apoiado, não pendurado: fica mais descontraído.</p>
<h2>5. Têxteis com textura</h2>
<p>Manta de tricô grosso, almofadas de linho, tapete pequeno. As texturas fazem um quarto parecer caro mesmo quando não é.</p>
<h2>6. Cordões de luzes quentes</h2>
<p>Ao redor da cabeceira ou na parede. Combinados com a lâmpada de pôr do sol, criam camadas de luz que dão profundidade.</p>
<h2>7. Pôsteres ou quadros (bem posicionados)</h2>
<p>Melhor 2-3 quadros grandes do que 15 pequenos. Tons terrosos, fotografia analógica ou tipografia simples.</p>
<h2>8. Esconda os cabos</h2>
<p>Nada quebra mais o clima do que uma régua de tomadas à vista. Canaletas adesivas ou abraçadeiras: 5 euros e parece outro quarto.</p>
<h2>9. Uma bandeja ou cantinho "bonito"</h2>
<p>Perfume, vela, livro e joias numa bandeja sobre a cômoda. Um único ponto organizado e decorativo eleva todo o resto.</p>
<h2>10. Menos coisas, melhor escolhidas</h2>
<p>O aesthetic de verdade é 50% tirar. Libere as superfícies e deixe respirar o que você realmente gosta.</p>
<h2>Comece pela luz</h2>
<p>Se tivéssemos que resumir este guia em uma frase: <em>a luz faz o quarto</em>. E a forma mais rápida de transformá-la é projetar o seu próprio pôr do sol.</p>
<p><a href="${P_PT}"><strong>👉 Ver a Lâmpada Golden Hour™ (a partir de €24,99 — frete grátis)</strong></a></p>`
    }
  },

  // ============ Article 2: que-es-lampara-de-atardecer ============
  'gid://shopify/Article/645853315230': {
    en: {
      title: 'What Is a Sunset Lamp and Why TikTok Is Obsessed With It',
      meta_title: 'What Is a Sunset Lamp? The Complete 2026 Guide',
      meta_description: "We explain TikTok's viral sunset lamp: how it works, the types available and which one to choose for your budget. From €24.99.",
      body_html: `
<p>If you spend time on TikTok or Instagram, you've seen it a thousand times: a room bathed in orange light with a perfect golden circle on the wall. That's a <strong>sunset lamp</strong>, and there are good reasons why it went viral.</p>
<h2>What exactly is it?</h2>
<p>It's a small LED lamp with a special lens that projects a circular beam of warm light onto the wall or ceiling, mimicking the sun during golden hour: that half hour before sunset when everything looks beautiful.</p>
<h2>Why did it go viral?</h2>
<ul>
<li>
<strong>Photos and videos:</strong> orange light is incredibly flattering. It's content creators' favorite "physical filter."</li>
<li>
<strong>Ambiance:</strong> it turns any ordinary room into a warm, cozy space just by plugging it in.</li>
<li>
<strong>Price:</strong> for less than the cost of a dinner out you get a radical change of atmosphere.</li>
</ul>
<h2>Types of sunset lamps</h2>
<h3>1. Classic (single color)</h3>
<p>Projects the classic orange sunset. Turn it on with one button and you're done. Perfect if you just want the sunset effect for photos or to relax. <a href="${P_EN}">The Classic version of Golden Hour™</a> costs €24.99.</p>
<h3>2. Multicolor with remote</h3>
<p>Besides the sunset, you can switch between 16 colors (purple, blue, red...) with a remote control. Ideal if you like changing the mood depending on the day.</p>
<h3>3. App-controlled</h3>
<p>The most complete one: colors, brightness and schedules programmable from your phone (Tuya / Smart Life apps). You can set it to turn on by itself at dusk.</p>
<h2>What to look for before buying</h2>
<ul>
<li>
<strong>Head rotation:</strong> it should rotate 180° to aim at the wall, ceiling or a corner.</li>
<li>
<strong>USB powered:</strong> no batteries — plug it into any charger or laptop.</li>
<li>
<strong>Silent:</strong> if you're going to sleep with it on, it matters.</li>
</ul>
<h2>Verdict</h2>
<p>Few purchases under €30 change a space this much. If you're after warm ambiance, better photos or simply want your room to stop looking like an office, the sunset lamp is one of the few TikTok trends actually worth it.</p>
<p><a href="${P_EN}"><strong>👉 See the Golden Hour™ Lamp (from €24.99 — free shipping)</strong></a></p>`
    },
    'pt-BR': {
      title: 'O que é uma lâmpada de pôr do sol e por que o TikTok está obcecado',
      meta_title: 'O que é uma Lâmpada de Pôr do Sol (Sunset Lamp)? Guia 2026',
      meta_description: 'Explicamos o que é a lâmpada de pôr do sol viral do TikTok, como funciona, quais tipos existem e qual escolher. A partir de €24,99.',
      body_html: `
<p>Se você passa tempo no TikTok ou no Instagram, já viu mil vezes: um quarto banhado em luz laranja com um círculo dourado perfeito na parede. Isso é uma <strong>lâmpada de pôr do sol</strong> (sunset lamp), e há bons motivos para ela ter viralizado.</p>
<h2>O que é exatamente?</h2>
<p>É uma pequena lâmpada LED com uma lente especial que projeta um feixe circular de luz quente na parede ou no teto, imitando o sol durante a golden hour: aquela meia hora antes do pôr do sol em que tudo fica bonito.</p>
<h2>Por que viralizou?</h2>
<ul>
<li>
<strong>Fotos e vídeos:</strong> a luz laranja favorece muito. É o "filtro físico" favorito dos criadores de conteúdo.</li>
<li>
<strong>Clima:</strong> transforma qualquer quarto comum em um espaço quente e aconchegante só de ligar na tomada.</li>
<li>
<strong>Preço:</strong> por menos do que custa um jantar, você consegue uma mudança radical de ambiente.</li>
</ul>
<h2>Tipos de lâmpada de pôr do sol</h2>
<h3>1. Clássica (uma única cor)</h3>
<p>Projeta o pôr do sol laranja de sempre. Liga com um botão e pronto. Perfeita se você só quer o efeito sunset para fotos ou para relaxar. <a href="${P_PT}">A versão Clássica da Golden Hour™</a> custa €24,99.</p>
<h3>2. Multicolorida com controle remoto</h3>
<p>Além do pôr do sol, você pode alternar entre 16 cores (roxo, azul, vermelho...) com controle remoto. Ideal se você gosta de variar o clima conforme o dia.</p>
<h3>3. Com controle por aplicativo</h3>
<p>A mais completa: cores, brilho e horários programáveis pelo celular (apps Tuya / Smart Life). Você pode programá-la para acender sozinha ao anoitecer.</p>
<h2>O que observar antes de comprar?</h2>
<ul>
<li>
<strong>Rotação da cabeça:</strong> que gire 180° para apontar para a parede, o teto ou o canto.</li>
<li>
<strong>Alimentação USB:</strong> sem pilhas, você liga em qualquer carregador ou notebook.</li>
<li>
<strong>Silenciosa:</strong> se você vai dormir com ela ligada, isso importa.</li>
</ul>
<h2>Veredicto</h2>
<p>Poucas compras de menos de €30 mudam tanto um espaço. Se você busca um clima acolhedor, fotos melhores ou simplesmente que seu quarto deixe de parecer um escritório, a lâmpada de pôr do sol é uma das poucas tendências do TikTok que realmente valem a pena.</p>
<p><a href="${P_PT}"><strong>👉 Ver a Lâmpada Golden Hour™ (a partir de €24,99 — frete grátis)</strong></a></p>`
    }
  },

  // ============ Article 3: golden-hour-en-casa ============
  'gid://shopify/Article/645853347998': {
    en: {
      title: 'Golden Hour at Home: The Lighting Trick That Improves Your Photos (and Your Mood)',
      meta_title: 'Golden Hour at Home: How to Recreate It | Store Up',
      meta_description: 'Golden hour lasts 30 minutes... or all day if you project it yourself. How to use warm light for aesthetic photos, videos and a relaxing vibe.',
      body_html: `
<p>Photographers have been obsessed with <strong>golden hour</strong> for decades: that short window after sunrise and before sunset when sunlight is soft, golden and flattering to everyone. The problem is obvious: it lasts half an hour and doesn't always catch you at home.</p>
<h2>Why golden light is so flattering</h2>
<p>Midday light falls vertically and harshly: it creates sharp shadows under the eyes and flattens colors. Golden hour light arrives at a low angle and travels through more atmosphere, which makes it warm and diffuse. The result: even skin, warm tones and that "commercial" glow in any photo.</p>
<h2>How to recreate it in your bedroom</h2>
<p>You can't move the sun, but you can project it. A <a href="${P_EN}">sunset projector lamp</a> recreates exactly that angle and color temperature on your wall. Three ways to use it:</p>
<h3>1. For photos and videos</h3>
<p>Aim the circle of light at a plain wall and stand between the lamp and the wall. Your silhouette gets outlined against the projected sun: TikTok's viral framing. For portraits, aim it from the side at 45° and you get free directional warm light.</p>
<h3>2. For working or studying at night</h3>
<p>Warm indirect light on the wall (not in your eyes) reduces the contrast with your screen and feels far less harsh than the fluorescent ceiling light.</p>
<h3>3. To unwind before bed</h3>
<p>Warm, dim light at night tells your body the day is ending — the opposite of your phone's blue light. Fifteen minutes of "sunset" on the wall is a surprisingly effective end-of-day ritual.</p>
<h2>The detail that makes the difference</h2>
<p>Look for a lamp with a rotating head: the angle is everything. Projected into a corner it creates depth; on the ceiling, a cinema-like mood; on the front wall, the classic perfect circle.</p>
<h2>Golden hour, on demand</h2>
<p>The real golden hour will always be special. But in between, you can have its USB-powered version up and running in two seconds.</p>
<p><a href="${P_EN}"><strong>👉 See the Golden Hour™ Lamp (from €24.99 — free shipping)</strong></a></p>`
    },
    'pt-BR': {
      title: 'Golden hour em casa: o truque de luz que melhora suas fotos (e seu humor)',
      meta_title: 'Golden Hour em Casa: Como Recriar a Hora Dourada | Store Up',
      meta_description: 'A golden hour dura 30 minutos... ou o dia todo se você mesmo a projetar. Como usar luz quente para fotos aesthetic, vídeos e um clima relaxante.',
      body_html: `
<p>Os fotógrafos são obcecados há décadas pela <strong>golden hour</strong>: aquela janela curta depois do amanhecer e antes do pôr do sol em que a luz solar é suave, dourada e favorece todo mundo. O problema é óbvio: dura meia hora e nem sempre te pega em casa.</p>
<h2>Por que a luz dourada favorece tanto</h2>
<p>A luz do meio-dia cai vertical e dura: gera sombras marcadas sob os olhos e achata as cores. A luz da golden hour chega em ângulo baixo e atravessa mais atmosfera, o que a torna quente e difusa. Resultado: pele uniforme, tons quentes e aquele brilho "de comercial" em qualquer foto.</p>
<h2>Como recriá-la no seu quarto</h2>
<p>Você não pode mover o sol, mas pode projetá-lo. Uma <a href="${P_PT}">lâmpada projetora de pôr do sol</a> recria exatamente esse ângulo e temperatura de cor na sua parede. Três formas de usá-la:</p>
<h3>1. Para fotos e vídeos</h3>
<p>Aponte o círculo de luz para uma parede lisa e fique entre a lâmpada e a parede. Sua silhueta fica recortada sobre o sol projetado: o enquadramento viral do TikTok. Para retratos, aponte-a de lado a 45° e você terá luz quente direcional de graça.</p>
<h3>2. Para trabalhar ou estudar à noite</h3>
<p>Luz indireta quente na parede (não nos olhos) reduz o contraste com a tela e parece muito menos agressiva do que a fluorescente do teto.</p>
<h3>3. Para desligar antes de dormir</h3>
<p>A luz quente e suave à noite indica ao seu corpo que o dia está acabando — ao contrário da luz azul do celular. Quinze minutos de "pôr do sol" na parede são um ritual de encerramento do dia surpreendentemente eficaz.</p>
<h2>O detalhe que faz a diferença</h2>
<p>Procure uma lâmpada com cabeça giratória: o ângulo é tudo. Projetada num canto, cria profundidade; no teto, um clima de cinema; na parede da frente, o clássico círculo perfeito.</p>
<h2>A hora dourada, sob demanda</h2>
<p>A golden hour de verdade continuará sendo especial. Mas entre uma e outra, você pode ter a versão dela ligada por USB e pronta em dois segundos.</p>
<p><a href="${P_PT}"><strong>👉 Ver a Lâmpada Golden Hour™ (a partir de €24,99 — frete grátis)</strong></a></p>`
    }
  }
};

// ---------- Main ----------

const HANDLES = {
  'gid://shopify/Article/645853249694': 'ideas-cuarto-aesthetic',
  'gid://shopify/Article/645853315230': 'que-es-lampara-de-atardecer',
  'gid://shopify/Article/645853347998': 'golden-hour-en-casa'
};

// 1) Fetch current translatable content (fresh digests)
const data = await gql(`query {
  translatableResources(first: 50, resourceType: ARTICLE) {
    nodes { resourceId translatableContent { key value digest } }
  }
}`);
const resources = data.translatableResources.nodes.filter(n => T[n.resourceId]);
if (resources.length !== 3) throw new Error(`Expected 3 articles, found ${resources.length}`);

const REGISTER = `mutation reg($id: ID!, $translations: [TranslationInput!]!) {
  translationsRegister(resourceId: $id, translations: $translations) {
    translations { locale key }
    userErrors { message field }
  }
}`;

const summary = [];
for (const res of resources) {
  const handle = HANDLES[res.resourceId];
  const digests = Object.fromEntries(res.translatableContent.map(c => [c.key, c.digest]));
  for (const locale of ['en', 'pt-BR']) {
    const pack = T[res.resourceId][locale];
    const translations = Object.entries(pack)
      .filter(([key]) => digests[key])
      .map(([key, value]) => ({
        locale, key, value,
        translatableContentDigest: digests[key]
      }));
    const out = await gql(REGISTER, { id: res.resourceId, translations });
    const ue = out.translationsRegister.userErrors;
    if (ue.length) {
      console.error(`FAIL ${handle} [${locale}]:`, JSON.stringify(ue));
      summary.push({ handle, locale, ok: false, errors: ue });
    } else {
      const keys = out.translationsRegister.translations.map(t => t.key);
      console.log(`OK ${handle} [${locale}]: registered ${keys.length} keys: ${keys.join(', ')}`);
      summary.push({ handle, locale, ok: true, keys });
    }
  }
}

fs.writeFileSync('f:/tmp/translate-summary.json', JSON.stringify(summary, null, 2));
console.log('\nDone.');
