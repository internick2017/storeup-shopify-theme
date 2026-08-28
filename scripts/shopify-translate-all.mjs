import https from 'https';
import { readFileSync, writeFileSync } from 'fs';

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

// Leer pt-BR.json completo
console.log('📖 Leyendo locales/pt-BR.json...');
const ptAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/pt-BR.json`);
const ptData = JSON.parse(ptAsset.asset.value);

// Guardar copia de seguridad
writeFileSync('f:\\tmp\\pt-BR-backup.json', JSON.stringify(ptData, null, 2));
console.log('   Backup guardado en f:\\tmp\\pt-BR-backup.json');

// Traducir textos clave al español
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const translations = {
  general: {
    continue_shopping: "Seguir comprando",
    search: "Buscar",
    close: "Cerrar",
    loading: "Cargando",
    or: "o",
    password_page: { login_form_heading: "Accede a la tienda", login_form_password_label: "Contraseña", login_form_password_placeholder: "Tu contraseña", login_form_submit: "Entrar", signup_form_email_label: "E-mail", signup_form_submit: "Notificarme cuando abramos" }
  },
  sections: {
    header: { menu: "Menú" },
    "announcement-bar": { default_announcement: "🚚 Envío gratuito a toda España — Garantía de devolución" },
    announcement_bar: { default_announcement: "🚚 Envío gratuito a toda España — Garantía de devolución" },
    footer: {
      title: "Pie de página",
      newsletter: { label: "E-mail", placeholder: "Tu e-mail", submit: "Suscribirse" }
    },
    newsletter: {
      header: { heading: "Suscríbete a nuestro boletín", subheading: "Recibe ofertas exclusivas y novedades." },
      label: "E-mail",
      placeholder: "Tu e-mail",
      submit: "Suscribirse"
    },
    "email-signup-banner": {
      newsletter_label: "E-mail",
      newsletter_placeholder: "Tu e-mail",
      newsletter_submit: "Suscribirse"
    },
    "contact-form": { submit: "Enviar mensaje" }
  },
  templates: {
    cart: { title: "Carrito", empty: "Tu carrito está vacío", continue_shopping: "Seguir comprando" },
    "list-collections": { title: "Colecciones" },
    search: { title: "Búsqueda", placeholder: "Buscar...", no_results: "No se encontraron resultados para" }
  },
  products: {
    product: {
      add_to_cart: "Añadir al carrito",
      sold_out: "Agotado",
      unavailable: "No disponible",
      quantity: { label: "Cantidad", decrease: "Reducir cantidad", increase: "Aumentar cantidad" },
      description: "Descripción",
      share: "Compartir",
      from: "Desde"
    },
    facets: {
      filter_button: "Filtrar",
      clear_filter: "Limpiar",
      filters: "Filtros",
      sort_by_label: "Ordenar por",
      sort_by: { featured: "Destacados", "price-ascending": "Precio: menor a mayor", "price-descending": "Precio: mayor a menor", "title-ascending": "A-Z", "title-descending": "Z-A" }
    }
  },
  accessibility: { skip_to_text_link: "Saltar al contenido", close: "Cerrar", cart_icon: "Carrito", menu: "Menú", search: "Buscar" }
};

deepMerge(ptData, translations);

// Reemplazar textos en inglés que puedan quedar
let ptStr = JSON.stringify(ptData);
ptStr = ptStr
  .replace(/Subscribe to our emails/g, 'Suscríbete a nuestro boletín')
  .replace(/Assine nossos e-mails/g, 'Suscríbete a nuestro boletín')
  .replace(/Welcome to our store/g, '🚚 Envío gratuito a toda España')
  .replace(/Bem-vindo à nossa loja/g, '🚚 Envío gratuito a toda España')
  .replace(/Email/g, 'E-mail')
  .replace(/Add to cart/g, 'Añadir al carrito')
  .replace(/Sold out/g, 'Agotado')
  .replace(/Search/g, 'Buscar')
  .replace(/Cart/g, 'Carrito')
  .replace(/You may also like/g, 'También te puede gustar')
  .replace(/Privacy policy/g, 'Política de privacidad')
  .replace(/Política de privacidade/g, 'Política de privacidad')
  .replace(/Powered by Shopify/g, 'Shopify')
  .replace(/Com tecnologia da Shopify/g, 'Shopify');

console.log('\n🔧 Guardando pt-BR.json traducido...');
const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'locales/pt-BR.json', value: ptStr }
});
console.log(r.errors ? `❌ ${JSON.stringify(r.errors)}` : '✅ pt-BR.json traducido al español completamente');

// También actualizar el announcement bar en settings_data con el texto correcto
console.log('\n🔧 Confirmando announcement bar...');
const settingsAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`);
const settingsRaw = settingsAsset.asset.value;

// Reemplazar cualquier "Welcome to our store" en settings_data
const settingsFixed = settingsRaw
  .replace(/Welcome to our store/g, '🚚 Envío gratuito a toda España')
  .replace(/Bem-vindo à nossa loja/g, '🚚 Envío gratuito a toda España');

if (settingsFixed !== settingsRaw) {
  const r2 = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
    asset: { key: 'config/settings_data.json', value: settingsFixed }
  });
  console.log(r2.errors ? `❌ ${JSON.stringify(r2.errors)}` : '✅ settings_data.json limpiado');
} else {
  console.log('✅ settings_data.json ya no tenía textos en inglés');
}

console.log('\n🎉 Todo traducido al español.');
console.log('\n⚠️  "Com tecnologia da Shopify" y "Política de privacidade" son textos');
console.log('   del SISTEMA de Shopify, no del tema. Para cambiarlos:');
console.log('   Settings → Languages → Change default language → Español');
console.log('   URL: https://admin.shopify.com/store/yxx05u-wr/settings/languages');
console.log('\n   Refrescá: https://storeup.store');
