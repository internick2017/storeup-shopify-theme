import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const PRODUCT_ID = '8737067827358';

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

const body_html = `
<div>
<h2>Convierte cualquier cuarto en un atardecer infinito</h2>
<p>Porque la hora dorada no debería durar solo unos minutos.</p>
<p>La <strong>Lámpara Golden Hour™</strong> proyecta tonos cálidos de atardecer sobre cualquier pared, transformando tu habitación en segundos. Sin ventanas. Sin esperar. A cualquier hora del día.</p>

<h3>✨ Elegí tu versión</h3>
<ul>
  <li><strong>🌅 Clásica — Atardecer:</strong> el efecto sunset cálido de siempre, encendido con un botón. Perfecta para empezar.</li>
  <li><strong>🎨 Golden — 16 Colores:</strong> 16 colores ajustables (rojo, morado, azul, verde y más) <strong>con control remoto</strong> y 4 modos de luz. Cambiá el ambiente sin levantarte.</li>
  <li><strong>📱 Pro — Control por App:</strong> controlá todo <strong>desde tu celular</strong> con la app (Tuya / Smart Life) + control remoto incluido. Programá horarios, colores y brillo a distancia.</li>
</ul>

<h3>🎁 Todas incluyen</h3>
<ul>
  <li>📐 <strong>Cabezal giratorio 180°</strong> — proyectá en pared, techo o rincón</li>
  <li>🔌 <strong>USB plug &amp; play</strong> — sin pilas, sin instalación</li>
  <li>🔇 <strong>Silenciosa</strong> — ideal para dormir con ella encendida</li>
  <li>📸 <strong>Viral en TikTok e Instagram</strong> — el filtro de luz favorito de los creadores</li>
</ul>

<h3>⚡ Especificaciones</h3>
<ul>
  <li>Alimentación: USB 5V (cable incluido)</li>
  <li>Vida útil: +50.000 horas</li>
  <li>Tamaño: compacto, cabe en la mano</li>
  <li>Rotación: 180° ajustable</li>
</ul>

<p><em>Envío gratuito. Garantía de satisfacción incluida.</em></p>
</div>`;

const r = await api('PUT', `/products/${PRODUCT_ID}.json`, {
  product: { id: PRODUCT_ID, body_html }
});
console.log(r.product ? '✅ Descripción ES actualizada (3 versiones honestas)' : `❌ ${JSON.stringify(r.errors)}`);
