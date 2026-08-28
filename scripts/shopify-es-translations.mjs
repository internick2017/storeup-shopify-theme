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

// Leer el locale en.default.json como base y el es.json actual
console.log('📖 Leyendo locales...');
const enAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/en.default.json`);
const esAsset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=locales/es.json`);

const enData = JSON.parse(enAsset.asset.value);
let esData = JSON.parse(esAsset.asset.value);

// Traducciones completas al español
const esTranslations = {
  general: {
    continue_shopping: "Seguir comprando",
    search: "Buscar",
    close: "Cerrar",
    loading: "Cargando",
    or: "o",
    page_not_found: "Página no encontrada",
    password_page: {
      login_form_heading: "Accede a la tienda",
      login_form_password_label: "Contraseña",
      login_form_password_placeholder: "Tu contraseña",
      login_form_submit: "Entrar",
      signup_form_email_label: "E-mail",
      signup_form_submit: "Notificarme"
    }
  },
  sections: {
    header: { menu: "Menú" },
    "announcement-bar": {
      default_announcement: "🚚 Envío gratuito a toda España"
    },
    announcement_bar: {
      default_announcement: "🚚 Envío gratuito a toda España"
    },
    newsletter: {
      header: {
        heading: "Suscríbete a nuestro boletín",
        subheading: "Recibe novedades y ofertas exclusivas."
      },
      label: "E-mail",
      placeholder: "Tu e-mail",
      submit: "Suscribirse"
    },
    "email-signup-banner": {
      newsletter_label: "E-mail",
      newsletter_placeholder: "Tu e-mail",
      newsletter_submit: "Suscribirse",
      heading: "Suscríbete a nuestro boletín"
    },
    footer: {
      title: "Pie de página",
      newsletter: {
        label: "E-mail",
        placeholder: "Tu e-mail",
        submit: "Suscribirse"
      }
    },
    "featured-collection": { view_all: "Ver todos" },
    "image-banner": { placeholder_title: "Transforma tu espacio" },
    "contact-form": { submit: "Enviar mensaje" },
    "main-cart-items": { title: "Carrito" },
    "main-search": { title: "Búsqueda" }
  },
  products: {
    product: {
      add_to_cart: "Añadir al carrito",
      sold_out: "Agotado",
      unavailable: "No disponible",
      on_sale: "Oferta",
      quantity: {
        label: "Cantidad",
        decrease: "Reducir",
        increase: "Aumentar",
        input_label: "Cantidad del producto"
      },
      description: "Descripción",
      share: "Compartir",
      share_on: {
        facebook: "Compartir en Facebook",
        twitter: "Tuitear",
        pinterest: "Guardar en Pinterest"
      },
      from: "Desde",
      unit_price_label: "Precio unitario",
      pickup_availability: {
        pick_up_available: "Disponible",
        pick_up_unavailable: "No disponible",
        view_store_info: "Ver info de la tienda",
        check_availability: "Comprobar disponibilidad"
      }
    },
    facets: {
      filter_button: "Filtrar",
      clear_filter: "Limpiar",
      filters: "Filtros",
      filter_by_label: "Filtrar por",
      sort_by_label: "Ordenar por",
      results: "resultados",
      sort_by: {
        featured: "Destacados",
        "price-ascending": "Precio: menor a mayor",
        "price-descending": "Precio: mayor a menor",
        "title-ascending": "A-Z",
        "title-descending": "Z-A",
        "best-selling": "Más vendidos",
        "created-ascending": "Más antiguos",
        "created-descending": "Más recientes"
      }
    }
  },
  templates: {
    cart: {
      title: "Carrito",
      empty: "Tu carrito está vacío",
      continue_shopping: "Seguir comprando",
      note: "Nota del pedido",
      cookies_required: "Activa las cookies para usar el carrito",
      taxes_and_shipping_policy_at_checkout: "Impuestos e info de envío al checkout"
    },
    "list-collections": { title: "Colecciones" },
    search: {
      title: "Búsqueda",
      placeholder: "Buscar...",
      no_results: "No se encontraron resultados para"
    },
    customers: { account: { title: "Mi cuenta" }, login: { title: "Acceder" }, register: { title: "Crear cuenta" }, order: { title: "Pedido" }, addresses: { title: "Mis direcciones" } }
  },
  accessibility: {
    skip_to_text_link: "Saltar al contenido",
    close: "Cerrar",
    cart_icon: "Carrito",
    menu: "Menú",
    search: "Buscar",
    open_media: "Abrir media"
  },
  layout: {
    footer: {
      "payment-methods": "Métodos de pago aceptados"
    }
  }
};

// Merge con el es.json existente
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

deepMerge(esData, esTranslations);

console.log('🔧 Subiendo traducciones completas al español...');
const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'locales/es.json', value: JSON.stringify(esData) }
});

console.log(r.errors ? `❌ ${JSON.stringify(r.errors)}` : '✅ locales/es.json — traducciones completas al español');
console.log('\n✅ Ahora en Languages podés definir Español como idioma principal.');
console.log('   Clic en ··· → "Definir como padrão" en la fila de Espanhol');
