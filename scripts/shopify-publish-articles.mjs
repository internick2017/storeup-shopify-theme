import fs from 'fs';
const env = fs.readFileSync('f:/tmp/shopify.env','utf8');
const TOKEN=(env.match(/SHOPIFY_ACCESS_TOKEN=(\S+)/)||[])[1];
const SHOP=(env.match(/SHOPIFY_SHOP=(\S+)/)||[])[1]||'yxx05u-wr.myshopify.com';
const API='2025-01';
const BLOG_ID='100378542238';
const IMG='https://cdn.shopify.com/s/files/1/0776/4423/4910/files/S1340eec44f034fb7a83d22237dd92a51l.webp?v=1780403720';
const PH='lampara-proyectora-de-atardecer-ambiente-aesthetic-para-tu-cuarto';
const P_ES=`/products/${PH}`, P_EN=`/en/products/${PH}`, P_PT=`/pt/products/${PH}`;

async function rest(path, method, body){
  const r=await fetch(`https://${SHOP}/admin/api/${API}/${path}`,{method,headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  return {status:r.status, json:await r.json().catch(()=>({}))};
}
async function gql(query,variables){const r=await fetch(`https://${SHOP}/admin/api/${API}/graphql.json`,{method:'POST',headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query,variables})});return r.json();}

const A=[
{
 handle:'lampara-atardecer-fotos-instagram', tags:'fotografia, instagram, aesthetic, golden hour',
 es:{title:'Lámpara de atardecer para fotos de Instagram: guía completa',
  mt:'Lámpara de atardecer para fotos de Instagram | Store Up',
  md:'Aprende a usar una lámpara de atardecer para conseguir fotos con luz golden hour en Instagram a cualquier hora. Trucos de ángulo, distancia y ajustes.',
  body:`<p>El secreto detrás de muchas fotos "perfectas" de Instagram no es un filtro: es la luz. La famosa <strong>golden hour</strong> —esos minutos al atardecer en los que todo se ve cálido y favorecedor— dura poco y no siempre coincide con tu tiempo libre. Una <a href="${P_ES}">lámpara proyectora de atardecer</a> te da ese mismo halo de luz cuando quieras, dentro de casa.</p>
<h2>Por qué funciona tan bien para fotos</h2>
<p>La luz cálida y difusa de una lámpara de atardecer suaviza la piel, elimina sombras duras y crea un degradado naranja-rojo de fondo que da profundidad. Es el mismo motivo por el que los fotógrafos aman la golden hour: la luz es envolvente, no agresiva.</p>
<h2>Cómo colocarla para la mejor foto</h2>
<ul>
<li><strong>Apunta a una pared lisa</strong> a 1-2 metros para conseguir el círculo de luz completo.</li>
<li><strong>Ubícate entre la lámpara y la pared</strong>, ligeramente de lado, para que el halo quede detrás de ti.</li>
<li><strong>Juega con la distancia</strong>: más cerca = círculo pequeño e intenso; más lejos = degradado amplio y suave.</li>
<li><strong>Apaga las luces blancas del techo</strong> para que no "ensucien" el tono cálido.</li>
</ul>
<h2>Ideas de fotos que puedes hacer</h2>
<p>Selfies con el halo detrás, fotos de outfit del día, bodegones de productos (ideal si vendes algo), o un simple rincón aesthetic para tus stories. El efecto también queda increíble en video corto para Reels y TikTok.</p>
<h2>Ajustes del móvil</h2>
<p>Baja un poco el brillo de la cámara para no quemar el centro del círculo, <strong>nunca uses flash</strong> (rompe el ambiente) y dispara en modo retrato para separar el sujeto del fondo. Edita poco: la luz ya hace el trabajo.</p>
<p>¿Quieres recrear la golden hour cuando quieras? Mira la <a href="${P_ES}">Lámpara Golden Hour™</a> y empieza a crear contenido con esa luz cálida que tanto gusta.</p>`},
 en:{title:'Sunset Lamp for Instagram Photos: The Complete Guide',
  mt:'Sunset Lamp for Instagram Photos | Store Up',
  md:'Learn how to use a sunset lamp to get golden-hour light in your Instagram photos any time of day. Angle, distance and camera tips.',
  body:`<p>The secret behind many "perfect" Instagram photos isn't a filter — it's the light. The famous <strong>golden hour</strong> only lasts minutes and rarely matches your free time. A <a href="${P_EN}">sunset projector lamp</a> gives you that same warm glow indoors, whenever you want.</p>
<h2>Why it works so well for photos</h2>
<p>The warm, diffused light of a sunset lamp softens skin, removes harsh shadows and creates an orange-red gradient backdrop with depth — the same reason photographers love golden hour: the light wraps around you instead of hitting you hard.</p>
<h2>How to position it for the best shot</h2>
<ul>
<li><strong>Aim it at a smooth wall</strong> 1-2 meters away for the full light circle.</li>
<li><strong>Stand between the lamp and the wall</strong>, slightly to the side, so the halo is behind you.</li>
<li><strong>Play with distance</strong>: closer = small, intense circle; farther = wide, soft gradient.</li>
<li><strong>Turn off white ceiling lights</strong> so they don't pollute the warm tone.</li>
</ul>
<h2>Photo ideas to try</h2>
<p>Selfies with the halo behind you, outfit-of-the-day shots, product flat-lays, or a simple aesthetic corner for your stories. The effect also looks amazing in short video for Reels and TikTok.</p>
<h2>Phone settings</h2>
<p>Lower the camera brightness a touch so the center doesn't blow out, <strong>never use flash</strong>, and shoot in portrait mode to separate subject from background. Edit lightly — the light already did the work.</p>
<p>Want to recreate golden hour anytime? Check out the <a href="${P_EN}">Golden Hour™ Lamp</a> and start making content with that warm light everyone loves.</p>`},
 pt:{title:'Luminária de pôr do sol para fotos no Instagram: guia completo',
  mt:'Luminária de pôr do sol para fotos no Instagram | Store Up',
  md:'Aprenda a usar uma luminária de pôr do sol para conseguir luz golden hour nas suas fotos do Instagram a qualquer hora. Dicas de ângulo e câmera.',
  body:`<p>O segredo de muitas fotos "perfeitas" do Instagram não é um filtro: é a luz. A famosa <strong>golden hour</strong> dura poucos minutos e raramente bate com o seu tempo livre. Uma <a href="${P_PT}">luminária projetora de pôr do sol</a> te dá esse mesmo brilho quente em casa, quando você quiser.</p>
<h2>Por que funciona tão bem para fotos</h2>
<p>A luz quente e difusa suaviza a pele, elimina sombras duras e cria um degradê laranja-vermelho de fundo com profundidade — o mesmo motivo pelo qual fotógrafos amam a golden hour: a luz envolve em vez de bater forte.</p>
<h2>Como posicionar para a melhor foto</h2>
<ul>
<li><strong>Aponte para uma parede lisa</strong> a 1-2 metros para o círculo de luz completo.</li>
<li><strong>Fique entre a luminária e a parede</strong>, levemente de lado, com o halo atrás de você.</li>
<li><strong>Brinque com a distância</strong>: mais perto = círculo pequeno e intenso; mais longe = degradê amplo e suave.</li>
<li><strong>Apague as luzes brancas do teto</strong> para não sujar o tom quente.</li>
</ul>
<h2>Ideias de fotos</h2>
<p>Selfies com o halo atrás, fotos do look do dia, bodegón de produtos, ou um cantinho aesthetic para os stories. O efeito também fica incrível em vídeo curto para Reels e TikTok.</p>
<h2>Ajustes do celular</h2>
<p>Diminua um pouco o brilho da câmera para não estourar o centro, <strong>nunca use flash</strong> e fotografe em modo retrato. Edite pouco: a luz já fez o trabalho.</p>
<p>Quer recriar a golden hour quando quiser? Veja a <a href="${P_PT}">Luminária Golden Hour™</a> e comece a criar conteúdo com essa luz quente.</p>`}
},
{
 handle:'lampara-atardecer-vs-tira-led', tags:'comparativa, decoracion, led, aesthetic',
 es:{title:'Lámpara de atardecer vs tira LED: cuál elegir para tu cuarto',
  mt:'Lámpara de atardecer vs tira LED: cuál elegir | Store Up',
  md:'Comparamos la lámpara de atardecer y las tiras LED para decorar tu cuarto: ambiente, fotos, instalación y precio. Descubre cuál te conviene.',
  body:`<p>Si estás armando un cuarto aesthetic, seguro dudaste entre una <a href="${P_ES}">lámpara de atardecer</a> y unas tiras LED. Las dos son tendencia, pero hacen cosas distintas. Aquí te ayudamos a elegir.</p>
<h2>Qué hace cada una</h2>
<p>La <strong>lámpara de atardecer</strong> proyecta un círculo de luz cálida (como un sol) sobre la pared: crea un punto focal envolvente, perfecto para fotos y para relajarte. Las <strong>tiras LED</strong> marcan el contorno del cuarto (detrás de la cama, el escritorio o el techo) con luz de colores: dan un efecto "gamer/neón" más disperso.</p>
<h2>Comparativa rápida</h2>
<ul>
<li><strong>Ambiente:</strong> la lámpara crea un foco cálido y acogedor; las LED, un baño de color general.</li>
<li><strong>Fotos/contenido:</strong> la lámpara gana por goleada (efecto golden hour); las LED quedan mejor como fondo de fondo.</li>
<li><strong>Instalación:</strong> la lámpara se enchufa y listo; las tiras requieren pegarlas y esconder cables.</li>
<li><strong>Movilidad:</strong> la lámpara la mueves donde quieras; las LED quedan fijas.</li>
</ul>
<h2>¿Cuál elegir?</h2>
<p>Si buscas <strong>un punto focal cálido, fotos increíbles y algo plug-and-play</strong>, la lámpara de atardecer es tu opción. Si quieres <strong>iluminar todo el contorno del cuarto con colores</strong>, las tiras LED. No son excluyentes.</p>
<h2>Y si las combinas…</h2>
<p>El combo favorito de muchos: tiras LED suaves de fondo + la lámpara de atardecer como protagonista. Capas de luz = cuarto con más profundidad y carácter.</p>
<p>¿Te decantas por el efecto sol? Echa un vistazo a la <a href="${P_ES}">Lámpara Golden Hour™</a>, lista para enchufar y empezar.</p>`},
 en:{title:'Sunset Lamp vs LED Strip: Which to Choose for Your Room',
  mt:'Sunset Lamp vs LED Strip: Which to Choose | Store Up',
  md:'We compare the sunset lamp and LED strips for decorating your room: ambiance, photos, setup and price. Find out which one is right for you.',
  body:`<p>Building an aesthetic room? You've probably hesitated between a <a href="${P_EN}">sunset lamp</a> and LED strips. Both are trending, but they do different things. Here's how to choose.</p>
<h2>What each one does</h2>
<p>The <strong>sunset lamp</strong> projects a warm circle of light (like a sun) onto the wall: a wrapping focal point, perfect for photos and relaxing. <strong>LED strips</strong> outline the room (behind the bed, desk or ceiling) with colored light: a more scattered "gamer/neon" effect.</p>
<h2>Quick comparison</h2>
<ul>
<li><strong>Ambiance:</strong> the lamp creates a warm, cozy focal point; LEDs, a general color wash.</li>
<li><strong>Photos/content:</strong> the lamp wins big (golden-hour effect); LEDs work better as a background.</li>
<li><strong>Setup:</strong> the lamp plugs in and you're done; strips need sticking and cable hiding.</li>
<li><strong>Mobility:</strong> move the lamp anywhere; LEDs stay fixed.</li>
</ul>
<h2>Which to choose?</h2>
<p>If you want <strong>a warm focal point, amazing photos and something plug-and-play</strong>, the sunset lamp is your pick. If you want to <strong>light the whole room outline with colors</strong>, go LED strips. They're not mutually exclusive.</p>
<h2>And if you combine them…</h2>
<p>A favorite combo: soft LED strips in the background + the sunset lamp as the star. Layers of light = a room with more depth and character.</p>
<p>Leaning toward the sun effect? Take a look at the <a href="${P_EN}">Golden Hour™ Lamp</a>, ready to plug in.</p>`},
 pt:{title:'Luminária de pôr do sol vs fita LED: qual escolher para o quarto',
  mt:'Luminária de pôr do sol vs fita LED: qual escolher | Store Up',
  md:'Comparamos a luminária de pôr do sol e as fitas LED para decorar o quarto: ambiente, fotos, instalação e preço. Descubra qual combina com você.',
  body:`<p>Montando um quarto aesthetic? Você provavelmente ficou em dúvida entre uma <a href="${P_PT}">luminária de pôr do sol</a> e fitas LED. As duas são tendência, mas fazem coisas diferentes. Veja como escolher.</p>
<h2>O que cada uma faz</h2>
<p>A <strong>luminária de pôr do sol</strong> projeta um círculo de luz quente (como um sol) na parede: um ponto focal envolvente, perfeito para fotos e relaxar. As <strong>fitas LED</strong> marcam o contorno do quarto (atrás da cama, mesa ou teto) com luz colorida: um efeito "gamer/neon" mais disperso.</p>
<h2>Comparação rápida</h2>
<ul>
<li><strong>Ambiente:</strong> a luminária cria um foco quente e aconchegante; as LED, um banho de cor geral.</li>
<li><strong>Fotos/conteúdo:</strong> a luminária ganha disparado (efeito golden hour); as LED ficam melhor como fundo.</li>
<li><strong>Instalação:</strong> a luminária liga na tomada e pronto; as fitas precisam ser coladas e esconder fios.</li>
<li><strong>Mobilidade:</strong> a luminária você move onde quiser; as LED ficam fixas.</li>
</ul>
<h2>Qual escolher?</h2>
<p>Se você quer <strong>um ponto focal quente, fotos incríveis e algo plug-and-play</strong>, a luminária de pôr do sol é a escolha. Se quer <strong>iluminar todo o contorno do quarto com cores</strong>, vá de fitas LED. Não são excludentes.</p>
<h2>E se combinar…</h2>
<p>Combo favorito: fitas LED suaves no fundo + a luminária de pôr do sol como protagonista. Camadas de luz = quarto com mais profundidade.</p>
<p>Curtiu o efeito sol? Veja a <a href="${P_PT}">Luminária Golden Hour™</a>, pronta para ligar.</p>`}
},
{
 handle:'regalos-aesthetic-originales', tags:'regalos, aesthetic, ideas, decoracion',
 es:{title:'Regalos aesthetic originales: ideas que sorprenden',
  mt:'Regalos aesthetic originales que sorprenden | Store Up',
  md:'Ideas de regalos aesthetic originales y económicos para sorprender: lámpara de atardecer, velas, polaroid y más. Para cumpleaños, parejas y amigas.',
  body:`<p>Acertar con un regalo aesthetic no es cuestión de gastar mucho, sino de elegir algo <strong>bonito, útil y "fotografiable"</strong>. Aquí van ideas originales que casi siempre arrancan un "¡me encanta!".</p>
<h2>Qué hace especial a un regalo aesthetic</h2>
<p>Que combine con la decoración de quien lo recibe, que se vea bien en su cuarto y en fotos, y que tenga un toque de experiencia (luz, aroma, recuerdo). Lo visual conecta.</p>
<h2>Ideas que sorprenden</h2>
<ul>
<li><strong>Lámpara de atardecer:</strong> nuestra favorita. Crea un ambiente golden hour, queda increíble en fotos y es un regalo "wow" por poco dinero. <a href="${P_ES}">Verla aquí</a>.</li>
<li><strong>Velas aromáticas en frasco:</strong> aroma + estética, siempre acierto.</li>
<li><strong>Cámara o impresora tipo polaroid:</strong> para los que aman los recuerdos físicos.</li>
<li><strong>Set de plantas pequeñas:</strong> vida y verde para el escritorio.</li>
<li><strong>Marco digital o cuadro minimalista:</strong> personalizable y elegante.</li>
</ul>
<h2>Para quién es ideal cada uno</h2>
<p>Para <strong>parejas y amigas</strong> que aman las fotos y su cuarto: la lámpara de atardecer. Para quien disfruta relajarse: velas. Para los nostálgicos: la polaroid. La clave es pensar en su estética, no en la tuya.</p>
<p>Si quieres un regalo que destaque sin gastar de más, la <a href="${P_ES}">Lámpara Golden Hour™</a> es de esos detalles que la gente recuerda (y publica en sus stories).</p>`},
 en:{title:'Original Aesthetic Gifts: Ideas That Wow',
  mt:'Original Aesthetic Gifts That Wow | Store Up',
  md:'Original, affordable aesthetic gift ideas to surprise anyone: sunset lamp, candles, polaroid and more. For birthdays, partners and friends.',
  body:`<p>Nailing an aesthetic gift isn't about spending a lot — it's about choosing something <strong>beautiful, useful and "photographable"</strong>. Here are original ideas that almost always get a "I love it!".</p>
<h2>What makes an aesthetic gift special</h2>
<p>It matches the recipient's decor, looks great in their room and in photos, and has a touch of experience (light, scent, memory). The visual is what connects.</p>
<h2>Ideas that wow</h2>
<ul>
<li><strong>Sunset lamp:</strong> our favorite. Creates a golden-hour vibe, looks amazing in photos and is a "wow" gift for little money. <a href="${P_EN}">See it here</a>.</li>
<li><strong>Scented jar candles:</strong> scent + aesthetics, always a hit.</li>
<li><strong>Polaroid-style camera or printer:</strong> for those who love physical memories.</li>
<li><strong>Small plant set:</strong> life and green for the desk.</li>
<li><strong>Digital frame or minimalist print:</strong> customizable and elegant.</li>
</ul>
<h2>Who each is ideal for</h2>
<p>For <strong>partners and friends</strong> who love photos and their room: the sunset lamp. For those who love to relax: candles. For the nostalgic: the polaroid. The key is thinking about their aesthetic, not yours.</p>
<p>If you want a gift that stands out without overspending, the <a href="${P_EN}">Golden Hour™ Lamp</a> is one of those details people remember (and post in their stories).</p>`},
 pt:{title:'Presentes aesthetic originais: ideias que surpreendem',
  mt:'Presentes aesthetic originais que surpreendem | Store Up',
  md:'Ideias de presentes aesthetic originais e econômicos para surpreender: luminária de pôr do sol, velas, polaroid e mais. Para aniversários e namorados.',
  body:`<p>Acertar num presente aesthetic não é gastar muito, é escolher algo <strong>bonito, útil e "fotografável"</strong>. Aqui vão ideias originais que quase sempre arrancam um "amei!".</p>
<h2>O que torna um presente aesthetic especial</h2>
<p>Combinar com a decoração de quem recebe, ficar bem no quarto e nas fotos, e ter um toque de experiência (luz, aroma, memória). O visual conecta.</p>
<h2>Ideias que surpreendem</h2>
<ul>
<li><strong>Luminária de pôr do sol:</strong> nossa favorita. Cria um clima golden hour, fica incrível em fotos e é um presente "uau" por pouco dinheiro. <a href="${P_PT}">Veja aqui</a>.</li>
<li><strong>Velas aromáticas em pote:</strong> aroma + estética, sempre acerto.</li>
<li><strong>Câmera ou impressora tipo polaroid:</strong> para quem ama memórias físicas.</li>
<li><strong>Kit de plantas pequenas:</strong> vida e verde para a mesa.</li>
<li><strong>Porta-retrato digital ou quadro minimalista:</strong> personalizável e elegante.</li>
</ul>
<h2>Para quem cada um é ideal</h2>
<p>Para <strong>namorados e amigas</strong> que amam fotos e o quarto: a luminária de pôr do sol. Para quem gosta de relaxar: velas. Para os nostálgicos: a polaroid. A chave é pensar na estética da pessoa, não na sua.</p>
<p>Se você quer um presente que se destaca sem gastar demais, a <a href="${P_PT}">Luminária Golden Hour™</a> é um daqueles detalhes que as pessoas lembram (e postam nos stories).</p>`}
}
];

const created=[];
for(const art of A){
  // crear en español (REST), publicado, con imagen de portada, tags, metafields SEO
  const payload={article:{title:art.es.title, author:'Store Up', handle:art.handle, tags:art.tags, body_html:art.es.body, published:true, image:{src:IMG},
    metafields:[
      {namespace:'global',key:'title_tag',type:'single_line_text_field',value:art.es.mt},
      {namespace:'global',key:'description_tag',type:'single_line_text_field',value:art.es.md}
    ]}};
  const r=await rest(`blogs/${BLOG_ID}/articles.json`,'POST',payload);
  const id=r.json?.article?.id;
  console.log(`\n[${art.handle}] create ES -> status ${r.status} id ${id||'ERR '+JSON.stringify(r.json).slice(0,200)}`);
  if(!id) continue;
  const gid=`gid://shopify/Article/${id}`;
  created.push({handle:art.handle,id});
  // traducciones en + pt-BR
  const tc=await gql(`{ translatableResource(resourceId:"${gid}"){ translatableContent{ key digest } } }`);
  const dig=Object.fromEntries((tc.data?.translatableResource?.translatableContent||[]).map(c=>[c.key,c.digest]));
  const map={title:'title', body_html:'body_html', meta_title:'mt', meta_description:'md'};
  for(const [loc,L] of [['en',art.en],['pt-BR',art.pt]]){
    const trs=[];
    for(const [key,src] of Object.entries(map)){
      const val = key==='title'?L.title : key==='body_html'?L.body : key==='meta_title'?L.mt : L.md;
      if(dig[key]) trs.push({locale:loc,key,value:val,translatableContentDigest:dig[key]});
    }
    const reg=await gql(`mutation($id:ID!,$tr:[TranslationInput!]!){ translationsRegister(resourceId:$id,translations:$tr){ userErrors{field message} } }`,{id:gid,tr:trs});
    const e=reg.errors||reg.data?.translationsRegister?.userErrors;
    console.log(`  ${loc}: keys[${trs.map(t=>t.key).join(',')}] -> ${e&&e.length?'ERROR '+JSON.stringify(e):'OK'}`);
  }
}
console.log('\nCREADOS:', created.map(c=>`${c.handle}(${c.id})`).join(', '));
