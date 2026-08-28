import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;
const THEME_ID = '156532670622';

function shopifyPut(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: SHOP,
      path: `/admin/api/2024-10${path}`,
      method: 'PUT',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

// ── 1. SETTINGS_DATA — Colores, tipografía, estilo ──────────────
const settings = {
  current: "Dawn",
  presets: {
    Dawn: {
      logo_width: 120,
      color_schemes: {
        "scheme-1": { settings: {
          background: "#FAFAF8",
          background_gradient: "",
          text: "#1A1A2E",
          button: "#E8610A",
          button_label: "#FFFFFF",
          secondary_button_label: "#E8610A",
          shadow: "#1A1A2E"
        }},
        "scheme-2": { settings: {
          background: "#F5F0EB",
          background_gradient: "",
          text: "#1A1A2E",
          button: "#E8610A",
          button_label: "#FFFFFF",
          secondary_button_label: "#1A1A2E",
          shadow: "#1A1A2E"
        }},
        "scheme-3": { settings: {
          background: "#1A1A2E",
          background_gradient: "linear-gradient(135deg, #1A1A2E 0%, #2D1B4E 100%)",
          text: "#FFFFFF",
          button: "#E8610A",
          button_label: "#FFFFFF",
          secondary_button_label: "#FFFFFF",
          shadow: "#000000"
        }},
        "scheme-4": { settings: {
          background: "#121212",
          background_gradient: "",
          text: "#FFFFFF",
          button: "#E8610A",
          button_label: "#FFFFFF",
          secondary_button_label: "#FFFFFF",
          shadow: "#000000"
        }},
        "scheme-5": { settings: {
          background: "#E8610A",
          background_gradient: "",
          text: "#FFFFFF",
          button: "#1A1A2E",
          button_label: "#FFFFFF",
          secondary_button_label: "#FFFFFF",
          shadow: "#000000"
        }}
      },
      type_header_font: "playfair_display_n4",
      heading_scale: 110,
      type_body_font: "assistant_n4",
      body_scale: 100,
      page_width: 1200,
      spacing_sections: 0,
      spacing_grid_horizontal: 12,
      spacing_grid_vertical: 12,
      animations_reveal_on_scroll: true,
      animations_hover_elements: "image",
      buttons_border_thickness: 0,
      buttons_border_opacity: 0,
      buttons_radius: 6,
      buttons_shadow_opacity: 10,
      buttons_shadow_horizontal_offset: 0,
      buttons_shadow_vertical_offset: 4,
      buttons_shadow_blur: 5,
      variant_pills_border_thickness: 1,
      variant_pills_border_opacity: 55,
      variant_pills_radius: 40,
      variant_pills_shadow_opacity: 0,
      variant_pills_shadow_horizontal_offset: 0,
      variant_pills_shadow_vertical_offset: 4,
      variant_pills_shadow_blur: 5,
      inputs_border_thickness: 1,
      inputs_border_opacity: 30,
      inputs_radius: 6,
      inputs_shadow_opacity: 0,
      inputs_shadow_horizontal_offset: 0,
      inputs_shadow_vertical_offset: 4,
      inputs_shadow_blur: 5,
      card_style: "standard",
      card_image_padding: 0,
      card_text_alignment: "left",
      card_color_scheme: "scheme-1",
      card_border_thickness: 0,
      card_border_opacity: 10,
      card_corner_radius: 8,
      card_shadow_opacity: 5,
      card_shadow_horizontal_offset: 0,
      card_shadow_vertical_offset: 4,
      card_shadow_blur: 5,
      collection_card_style: "standard",
      collection_card_image_padding: 0,
      collection_card_text_alignment: "left",
      collection_card_color_scheme: "scheme-2",
      collection_card_border_thickness: 0,
      collection_card_border_opacity: 10,
      collection_card_corner_radius: 8,
      collection_card_shadow_opacity: 0,
      collection_card_shadow_horizontal_offset: 0,
      collection_card_shadow_vertical_offset: 4,
      collection_card_shadow_blur: 5,
      blog_card_style: "standard",
      blog_card_image_padding: 0,
      blog_card_text_alignment: "left",
      blog_card_color_scheme: "scheme-2",
      blog_card_border_thickness: 0,
      blog_card_border_opacity: 10,
      blog_card_corner_radius: 8,
      blog_card_shadow_opacity: 5,
      blog_card_shadow_horizontal_offset: 0,
      blog_card_shadow_vertical_offset: 4,
      blog_card_shadow_blur: 5,
      text_boxes_border_thickness: 0,
      text_boxes_border_opacity: 10,
      text_boxes_radius: 8,
      text_boxes_shadow_opacity: 0,
      text_boxes_shadow_horizontal_offset: 0,
      text_boxes_shadow_vertical_offset: 4,
      text_boxes_shadow_blur: 5,
      media_border_thickness: 0,
      media_border_opacity: 5,
      media_radius: 8,
      media_shadow_opacity: 0,
      media_shadow_horizontal_offset: 0,
      media_shadow_vertical_offset: 4,
      media_shadow_blur: 5,
      popup_border_thickness: 0,
      popup_border_opacity: 10,
      popup_corner_radius: 12,
      popup_shadow_opacity: 15,
      popup_shadow_horizontal_offset: 0,
      popup_shadow_vertical_offset: 4,
      popup_shadow_blur: 20,
      drawer_border_thickness: 0,
      drawer_border_opacity: 10,
      drawer_shadow_opacity: 10,
      drawer_shadow_horizontal_offset: 0,
      drawer_shadow_vertical_offset: 4,
      drawer_shadow_blur: 5,
      badge_position: "bottom left",
      badge_corner_radius: 40,
      sale_badge_color_scheme: "scheme-5",
      sold_out_badge_color_scheme: "scheme-4",
      brand_headline: "Transforma tu espacio",
      brand_description: "<p>Productos únicos para hacer de tu habitación un lugar especial. Envío gratis a toda España.</p>",
      brand_image_width: 100,
      social_twitter_link: "",
      social_facebook_link: "",
      social_pinterest_link: "",
      social_instagram_link: "",
      social_tiktok_link: "",
      social_tumblr_link: "",
      social_snapchat_link: "",
      social_youtube_link: "",
      social_vimeo_link: "",
      predictive_search_enabled: true,
      predictive_search_show_vendor: false,
      predictive_search_show_price: true,
      currency_code_enabled: false,
      cart_type: "drawer",
      show_vendor: false,
      show_cart_note: true,
      cart_drawer_collection: "",
      cart_color_scheme: "scheme-1",
      sections: {
        "main-password-header": { type: "main-password-header", settings: { color_scheme: "scheme-1" } },
        "main-password-footer": { type: "main-password-footer", settings: { color_scheme: "scheme-1" } }
      }
    }
  }
};

// ── 2. INDEX TEMPLATE — Homepage con copy en español ────────────
const indexTemplate = {
  sections: {
    hero: {
      type: "image-banner",
      blocks: {
        heading: {
          type: "heading",
          settings: {
            heading: "Transforma tu habitación al instante ✨",
            heading_size: "h1"
          }
        },
        subheading: {
          type: "text",
          settings: {
            text: "Ambiente aesthetic • Envío gratis a España • Más de 500 clientes felices"
          }
        },
        button: {
          type: "buttons",
          settings: {
            button_label_1: "Ver producto",
            button_link_1: "shopify://collections/all",
            button_style_secondary_1: false,
            button_label_2: "",
            button_link_2: "",
            button_style_secondary_2: false
          }
        }
      },
      block_order: ["heading", "subheading", "button"],
      settings: {
        image_overlay_opacity: 50,
        image_height: "large",
        desktop_content_position: "middle-center",
        show_text_box: true,
        image_behavior: "none",
        desktop_content_alignment: "center",
        color_scheme: "scheme-3",
        mobile_content_alignment: "center",
        stack_images_on_mobile: false,
        show_text_below: false
      }
    },
    features: {
      type: "multicolumn",
      blocks: {
        col1: {
          type: "column",
          settings: {
            title: "🌅 Ambiente en segundos",
            text: "<p>Proyecta tonos cálidos de atardecer en cualquier pared. Sin instalación.</p>",
            link_label: "",
            link: ""
          }
        },
        col2: {
          type: "column",
          settings: {
            title: "🚚 Envío gratis",
            text: "<p>Envío gratuito a toda España. Recibirás tu pedido en 15-25 días hábiles.</p>",
            link_label: "",
            link: ""
          }
        },
        col3: {
          type: "column",
          settings: {
            title: "⭐ Garantía de satisfacción",
            text: "<p>Si no queda como esperabas, te devolvemos el dinero. Sin preguntas.</p>",
            link_label: "",
            link: ""
          }
        }
      },
      block_order: ["col1", "col2", "col3"],
      settings: {
        title: "",
        heading_size: "h2",
        image_width: "full",
        image_ratio: "adapt",
        columns_desktop: 3,
        column_alignment: "center",
        background_style: "none",
        button_label: "",
        button_link: "",
        color_scheme: "scheme-2",
        columns_mobile: "1",
        swipe_on_mobile: false,
        padding_top: 36,
        padding_bottom: 36
      }
    },
    featured_collection: {
      type: "featured-collection",
      settings: {
        title: "Nuestros Productos",
        heading_size: "h2",
        description: "<p>Productos seleccionados para transformar tu espacio</p>",
        show_description: true,
        description_style: "body",
        collection: "all",
        products_to_show: 8,
        columns_desktop: 4,
        color_scheme: "scheme-1",
        full_width: false,
        show_view_all: true,
        view_all_style: "solid",
        enable_desktop_slider: false,
        swipe_on_mobile: true,
        image_ratio: "adapt",
        image_shape: "default",
        show_secondary_image: true,
        show_vendor: false,
        show_rating: false,
        quick_add: "standard",
        columns_mobile: "2",
        padding_top: 44,
        padding_bottom: 36
      }
    },
    trust_badges: {
      type: "rich-text",
      blocks: {
        heading: {
          type: "heading",
          settings: { heading: "¿Por qué elegirnos?", heading_size: "h2" }
        },
        text: {
          type: "text",
          settings: {
            text: "<p>🔒 <strong>Pago 100% seguro</strong> &nbsp;|&nbsp; 🚚 <strong>Envío gratis a España</strong> &nbsp;|&nbsp; ↩️ <strong>Devolución garantizada</strong> &nbsp;|&nbsp; 💬 <strong>Soporte en español</strong></p>"
          }
        }
      },
      block_order: ["heading", "text"],
      settings: {
        desktop_content_position: "center",
        content_alignment: "center",
        color_scheme: "scheme-3",
        full_width: true,
        padding_top: 40,
        padding_bottom: 40
      }
    }
  },
  order: ["hero", "features", "featured_collection", "trust_badges"]
};

console.log('🎨 Aplicando mejoras al tema Dawn...\n');

// Subir settings_data.json
const r1 = await shopifyPut(`/themes/${THEME_ID}/assets.json`, {
  asset: { key: "config/settings_data.json", value: JSON.stringify(settings) }
});
if (r1.errors) { console.error('❌ settings_data:', r1.errors); }
else { console.log('✅ Colores y tipografía actualizados'); }

// Subir index template
const r2 = await shopifyPut(`/themes/${THEME_ID}/assets.json`, {
  asset: { key: "templates/index.json", value: JSON.stringify(indexTemplate) }
});
if (r2.errors) { console.error('❌ index template:', r2.errors); }
else { console.log('✅ Homepage actualizada con copy en español'); }

console.log('\n🎉 Tema actualizado. Cambios aplicados:');
console.log('   → Colores: paleta sunset (naranja #E8610A + navy #1A1A2E)');
console.log('   → Tipografía: Playfair Display (headings) + Assistant (body)');
console.log('   → Botones: bordes redondeados + sombra');
console.log('   → Homepage: hero + beneficios + productos + trust badges');
console.log('   → Copy 100% en español');
console.log('\n   Ver tienda: https://storeup.store');
