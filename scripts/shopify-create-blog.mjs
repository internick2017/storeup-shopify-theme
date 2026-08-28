import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function rest(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: SHOP,
      path: `/admin/api/2024-10${path}`,
      method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: d ? JSON.parse(d) : {} }));
    });
    req.on('error', (e) => resolve({ status: 0, body: { error: String(e) } }));
    if (data) req.write(data);
    req.end();
  });
}

const PRODUCT_URL = '/products/lampara-proyectora-de-atardecer-ambiente-aesthetic-para-tu-cuarto';
const CTA = `<p><a href="${PRODUCT_URL}"><strong>👉 Ver la Lámpara Golden Hour™ (desde 24,99 € — envío gratis a España)</strong></a></p>`;

// Get product images to reuse as article covers
const prod = await rest('GET', '/products/8737067827358.json');
const imgs = prod.body.product.images.map(i => i.src);
console.log(`Imágenes del producto disponibles: ${imgs.length}`);

// 1) Find or create the blog
const blogs = await rest('GET', '/blogs.json');
console.log('Blogs existentes:', blogs.body.blogs.map(b => `${b.id}:${b.handle}`).join(', ') || '(ninguno)');
let blog = blogs.body.blogs.find(b => b.handle === 'blog') || blogs.body.blogs[0];
if (!blog) {
  const created = await rest('POST', '/blogs.json', { blog: { title: 'Blog', handle: 'blog', commentable: 'no' } });
  if (created.status !== 201) { console.error('❌ No se pudo crear el blog:', JSON.stringify(created.body)); process.exit(1); }
  blog = created.body.blog;
  console.log(`✅ Blog creado: ${blog.id} (${blog.handle})`);
} else {
  console.log(`Usando blog existente: ${blog.id} (${blog.handle})`);
}

const ARTICLES = [
  {
    title: '10 ideas para conseguir un cuarto aesthetic sin gastar mucho',
    handle: 'ideas-cuarto-aesthetic',
    tags: 'cuarto aesthetic, decoracion, ideas, low cost',
    image: imgs[3] || imgs[0],
    seoTitle: '10 Ideas para un Cuarto Aesthetic Barato (2026) | Store Up',
    seoDesc: 'Transforma tu habitación en un espacio aesthetic con poco presupuesto: luz cálida, lámpara de atardecer, plantas, espejos y más. Guía práctica 2026.',
    body: `
<p>No necesitas redecorar toda tu habitación ni gastarte cientos de euros para conseguir ese <strong>cuarto aesthetic</strong> que ves en TikTok y Pinterest. La clave está en la luz, las texturas y unos pocos detalles bien elegidos.</p>
<h2>1. Cambia la luz blanca por luz cálida</h2>
<p>Es el cambio más barato y el que más se nota. La luz blanca de techo mata cualquier ambiente. Apágala y usa fuentes de luz cálida a media altura: el cuarto pasa de "hospital" a "café acogedor" en segundos.</p>
<h2>2. Una lámpara de atardecer (el truco viral)</h2>
<p>Si solo vas a comprar una cosa de esta lista, que sea esta. La <a href="${PRODUCT_URL}">lámpara proyectora de atardecer</a> proyecta un círculo de luz dorada en la pared que imita la golden hour. Es el fondo perfecto para fotos y el motivo por el que medio TikTok tiene la habitación naranja.</p>
<h2>3. Plantas (de verdad o no)</h2>
<p>Una pothos colgante, una monstera pequeña o incluso eucalipto seco en un jarrón. El verde rompe la monotonía y da vida sin esfuerzo.</p>
<h2>4. Espejo de cuerpo entero apoyado en la pared</h2>
<p>Amplía visualmente el espacio, rebota la luz y es el clásico de las fotos aesthetic. Apoyado, no colgado: queda más relajado.</p>
<h2>5. Textiles con textura</h2>
<p>Manta de punto grueso, cojines de lino, alfombra pequeña. Las texturas hacen que un cuarto se sienta caro aunque no lo sea.</p>
<h2>6. Guirnaldas de luces cálidas</h2>
<p>Alrededor del cabecero o en la pared. Combinadas con la lámpara de atardecer crean capas de luz que dan profundidad.</p>
<h2>7. Pósters o láminas (bien colocados)</h2>
<p>Mejor 2-3 láminas grandes que 15 pequeñas. Tonos tierra, fotografía analógica o tipografía simple.</p>
<h2>8. Esconde los cables</h2>
<p>Nada rompe más el ambiente que una regleta a la vista. Canaletas adhesivas o bridas: 5 euros y parece otro cuarto.</p>
<h2>9. Una bandeja o rincón "bonito"</h2>
<p>Perfume, vela, libro y joyas en una bandeja sobre la cómoda. Un solo punto ordenado y decorativo eleva todo lo demás.</p>
<h2>10. Menos cosas, mejor elegidas</h2>
<p>El aesthetic real es 50% quitar. Despeja superficies y deja respirar lo que de verdad te gusta.</p>
<h2>Empieza por la luz</h2>
<p>Si tuviéramos que resumir esta guía en una frase: <em>la luz hace el cuarto</em>. Y la forma más rápida de transformarla es proyectar tu propio atardecer.</p>
${CTA}`,
  },
  {
    title: 'Qué es una lámpara de atardecer y por qué TikTok está obsesionado',
    handle: 'que-es-lampara-de-atardecer',
    tags: 'lampara de atardecer, sunset lamp, tiktok, guia',
    image: imgs[0],
    seoTitle: '¿Qué es una Lámpara de Atardecer (Sunset Lamp)? Guía 2026',
    seoDesc: 'Te explicamos qué es la lámpara de atardecer viral de TikTok, cómo funciona, qué tipos existen y cuál elegir según tu presupuesto. Desde 24,99 €.',
    body: `
<p>Si pasas tiempo en TikTok o Instagram, la has visto mil veces: una habitación bañada en luz naranja con un círculo dorado perfecto en la pared. Eso es una <strong>lámpara de atardecer</strong> (sunset lamp), y hay buenas razones por las que se ha vuelto viral.</p>
<h2>¿Qué es exactamente?</h2>
<p>Es una pequeña lámpara LED con una lente especial que proyecta un haz circular de luz cálida sobre la pared o el techo, imitando el sol durante la golden hour: esa media hora antes del atardecer en la que todo se ve bonito.</p>
<h2>¿Por qué se hizo viral?</h2>
<ul>
<li><strong>Fotos y vídeos:</strong> la luz naranja favorece muchísimo. Es el "filtro físico" favorito de los creadores de contenido.</li>
<li><strong>Ambiente:</strong> convierte cualquier cuarto normal en un espacio cálido y acogedor con solo enchufarla.</li>
<li><strong>Precio:</strong> por menos de lo que cuesta una cena consigues un cambio radical de ambiente.</li>
</ul>
<h2>Tipos de lámpara de atardecer</h2>
<h3>1. Clásica (un solo color)</h3>
<p>Proyecta el atardecer naranja de siempre. Se enciende con un botón y listo. Perfecta si solo quieres el efecto sunset para fotos o para relajarte. <a href="${PRODUCT_URL}">La versión Clásica de Golden Hour™</a> cuesta 24,99 €.</p>
<h3>2. Multicolor con mando</h3>
<p>Además del atardecer, puedes cambiar entre 16 colores (morado, azul, rojo...) con control remoto. Ideal si te gusta variar el ambiente según el día.</p>
<h3>3. Con control por app</h3>
<p>La más completa: colores, brillo y horarios programables desde el móvil (apps Tuya / Smart Life). Puedes programarla para que se encienda sola al anochecer.</p>
<h2>¿En qué fijarse antes de comprar?</h2>
<ul>
<li><strong>Rotación del cabezal:</strong> que gire 180° para apuntar a pared, techo o esquina.</li>
<li><strong>Alimentación USB:</strong> sin pilas, la enchufas a cualquier cargador o portátil.</li>
<li><strong>Silenciosa:</strong> si vas a dormir con ella encendida, importa.</li>
</ul>
<h2>Veredicto</h2>
<p>Pocas compras de menos de 30 € cambian tanto un espacio. Si buscas ambiente cálido, fotos mejores o simplemente que tu cuarto deje de parecer una oficina, la lámpara de atardecer es de las pocas tendencias de TikTok que valen la pena.</p>
${CTA}`,
  },
  {
    title: 'Golden hour en casa: el truco de luz que mejora tus fotos (y tu ánimo)',
    handle: 'golden-hour-en-casa',
    tags: 'golden hour, fotografia, luz calida, bienestar',
    image: imgs[4] || imgs[1],
    seoTitle: 'Golden Hour en Casa: Cómo Recrear la Hora Dorada | Store Up',
    seoDesc: 'La golden hour dura 30 minutos... o todo el día si la proyectas tú. Cómo usar luz cálida para fotos aesthetic, vídeos y un ambiente que relaja.',
    body: `
<p>Los fotógrafos llevan décadas obsesionados con la <strong>golden hour</strong>: esa franja corta después del amanecer y antes del atardecer en la que la luz del sol es suave, dorada y favorece a todo el mundo. El problema es obvio: dura media hora y no siempre te pilla en casa.</p>
<h2>Por qué la luz dorada favorece tanto</h2>
<p>La luz de mediodía cae vertical y dura: genera sombras marcadas bajo los ojos y aplana los colores. La luz de golden hour llega en ángulo bajo y atraviesa más atmósfera, lo que la vuelve cálida y difusa. Resultado: piel uniforme, tonos cálidos y ese brillo "de anuncio" en cualquier foto.</p>
<h2>Cómo recrearla en tu habitación</h2>
<p>No puedes mover el sol, pero puedes proyectarlo. Una <a href="${PRODUCT_URL}">lámpara proyectora de atardecer</a> recrea exactamente ese ángulo y temperatura de color sobre tu pared. Tres formas de usarla:</p>
<h3>1. Para fotos y vídeos</h3>
<p>Apunta el círculo de luz a una pared lisa y colócate entre la lámpara y la pared. Tu silueta queda recortada sobre el sol proyectado: el encuadre viral de TikTok. Para retratos, apúntala de lado a 45° y tendrás luz cálida direccional gratis.</p>
<h3>2. Para trabajar o estudiar de noche</h3>
<p>Luz indirecta cálida en la pared (no en los ojos) reduce el contraste con la pantalla y se siente mucho menos agresiva que el fluorescente del techo.</p>
<h3>3. Para desconectar antes de dormir</h3>
<p>La luz cálida y tenue por la noche le indica a tu cuerpo que el día se acaba — al contrario que la luz azul del móvil. Quince minutos de "atardecer" en la pared es un ritual de cierre del día sorprendentemente efectivo.</p>
<h2>El detalle que marca la diferencia</h2>
<p>Busca una lámpara con cabezal giratorio: el ángulo lo es todo. Proyectada en una esquina crea profundidad; en el techo, un ambiente tipo cine; en la pared frontal, el clásico círculo perfecto.</p>
<h2>La hora dorada, a demanda</h2>
<p>La golden hour real seguirá siendo especial. Pero entre una y otra, puedes tener su versión enchufada por USB y lista en dos segundos.</p>
${CTA}`,
  },
];

for (const a of ARTICLES) {
  const existing = await rest('GET', `/blogs/${blog.id}/articles.json?handle=${a.handle}`);
  if (existing.body.articles && existing.body.articles.length) {
    console.log(`⏭️ Ya existe: ${a.handle}`);
    continue;
  }
  const payload = {
    article: {
      title: a.title,
      handle: a.handle,
      author: 'Store Up',
      tags: a.tags,
      body_html: a.body,
      published: true,
      image: a.image ? { src: a.image, alt: a.title } : undefined,
      metafields: [
        { namespace: 'global', key: 'title_tag', value: a.seoTitle, type: 'single_line_text_field' },
        { namespace: 'global', key: 'description_tag', value: a.seoDesc, type: 'single_line_text_field' },
      ],
    },
  };
  const res = await rest('POST', `/blogs/${blog.id}/articles.json`, payload);
  if (res.status === 201) console.log(`✅ Artículo creado: ${a.title} → /blogs/${blog.handle}/${res.body.article.handle}`);
  else console.error(`❌ Error en "${a.title}":`, res.status, JSON.stringify(res.body).slice(0, 400));
}

console.log('\n🎉 Blog listo.');
