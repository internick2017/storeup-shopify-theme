import https from 'https';
import { readFileSync } from 'fs';

// Leer token guardado
const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => l.split('='))
);

const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function shopifyRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: SHOP,
      path: `/admin/api/2024-10${path}`,
      method,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => { responseData += chunk; });
      res.on('end', () => resolve(JSON.parse(responseData)));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const product = {
  product: {
    title: "Lámpara Proyectora de Atardecer — Ambiente Aesthetic para tu Cuarto",
    body_html: `
      <h2>Transforma tu habitación en segundos ✨</h2>
      <p>¿Alguna vez quisiste tener ese efecto de puesta de sol en tu cuarto sin esperar que llegue la noche perfecta? Con nuestra <strong>Lámpara Proyectora de Atardecer</strong> lo conseguirás al instante.</p>

      <h3>¿Por qué la necesitas?</h3>
      <ul>
        <li>🌅 <strong>Proyecta tonos cálidos</strong> de naranja, rojo y morado sobre cualquier pared</li>
        <li>📸 <strong>Perfecta para fotos y vídeos</strong> — el efecto favorito de TikTok e Instagram</li>
        <li>🔌 <strong>Plug & Play vía USB</strong> — sin instalación, sin pilas</li>
        <li>🔇 <strong>Completamente silenciosa</strong> — 0.6W de consumo, ideal para dormir encendida</li>
        <li>🎯 <strong>Ángulo ajustable</strong> — proyecta en techo, pared o rincones</li>
        <li>📦 <strong>Compacta</strong> — cabe en la palma de tu mano, ideal para escritorios y mesitas</li>
      </ul>

      <h3>¿Para quién es?</h3>
      <p>Para gamers, streamers, estudiantes, fotógrafos, o cualquier persona que quiera darle un toque especial a su espacio. Viral en TikTok por una razón: <strong>el resultado habla por sí solo</strong>.</p>

      <h3>Especificaciones técnicas</h3>
      <ul>
        <li>Alimentación: USB 5V</li>
        <li>Potencia: 0.6–0.8W</li>
        <li>Colores: Naranja cálido, rojo, morado</li>
        <li>Vida útil: +50.000 horas</li>
        <li>Tamaño: Compacto (cabe en la mano)</li>
      </ul>

      <p><strong>⚡ Oferta por tiempo limitado</strong> — Existencias limitadas.</p>
    `,
    vendor: "Store Up",
    product_type: "Decoración del Hogar",
    tags: ["lampara", "aesthetic", "habitacion", "atardecer", "proyector", "tiktok", "decoracion", "regalo", "ambient"],
    status: "active",
    variants: [
      {
        price: "24.99",
        compare_at_price: "39.99",
        inventory_management: null,
        fulfillment_service: "manual",
        inventory_policy: "continue",
        requires_shipping: true,
        weight: 0.2,
        weight_unit: "kg",
      }
    ],
    images: [
      { src: "https://ae01.alicdn.com/kf/S8a1b2f3e4d5c6a7b8e9f0a1b2c3d4e5f6.jpg", alt: "Lámpara Proyectora Atardecer - ambiente aesthetic" }
    ],
  }
};

console.log('🛍️  Creando producto en Store Up...\n');

const result = await shopifyRequest('POST', '/products.json', product);

if (result.product) {
  console.log('✅ Producto creado exitosamente!');
  console.log(`\nID:     ${result.product.id}`);
  console.log(`Título: ${result.product.title}`);
  console.log(`Precio: €${result.product.variants[0].price}`);
  console.log(`Antes:  €${result.product.variants[0].compare_at_price}`);
  console.log(`\n🔗 Ver en admin:`);
  console.log(`https://admin.shopify.com/store/yxx05u-wr/products/${result.product.id}`);
} else {
  console.error('❌ Error:', JSON.stringify(result, null, 2));
}
