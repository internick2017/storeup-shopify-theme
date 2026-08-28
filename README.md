# Store Up — archivo del storefront de Shopify

Rescate completo del trabajo hecho sobre la tienda **storeup.store**, capturado el **2026-08-28**,
antes de que venza la suscripción de Shopify y el sitio salga de línea.

La tienda no generó ventas y no se va a seguir pagando. Cuando la cuenta cierre, el dominio deja de
responder y todo desaparece con ella. Este repo existe para que el trabajo no se pierda.

---

## Contenido

### `theme/` — código fuente completo del tema ✅

Exportado desde el admin de Shopify (**Online Store → Themes → Actions → Download theme file**).
Es Dawn personalizado, **352 archivos**:

| Carpeta | Contenido |
|---|---|
| `sections/` | 54 secciones Liquid |
| `snippets/` | 38 snippets |
| `templates/` | 14 plantillas (home, producto, colección, carrito, blog, contacto, 404, password) |
| `layout/` | 2 layouts base |
| `locales/` | 51 archivos de traducción, incluidos `es`, `en.default`, `pt-BR` y `pt-PT` |
| `assets/` | 185 archivos (CSS, JS, imágenes) |
| `config/` | `settings_data.json` con **121 ajustes** y `settings_schema.json` |

**Dónde está la personalización real** (no hay secciones fuera del set estándar de Dawn, el trabajo
está en la configuración y la composición):

- **`config/settings_data.json`** — 5 esquemas de color propios, tipografías **Playfair Display**
  para títulos y **Assistant** para el cuerpo, y el titular de marca "Transforma tu espacio".
- **`templates/index.json`** — la home compuesta con secciones **nombradas a mano**
  (`hero`, `features`, `featured_collection`, `trust_badges`), no con ids autogenerados por el
  editor visual. Es la huella de haberla armado por API y no a mano.
- **`locales/`** — las traducciones a español y portugués del contenido de interfaz.

### `data/` — catálogo

`products_export.csv`: export completo de productos (1 producto, 5 variantes, 64 columnas).
Era una tienda de producto único: la *Lámpara Golden Hour, proyector de ambiente*.

### `rendered/` — HTML renderizado de 9 páginas

Snapshots del HTML que servía la tienda, con los tres idiomas cubiertos: home, catálogo y producto
en `es`/`en`/`pt`, más blog y política de privacidad. Sirven como evidencia del marcado real:
estructura, `hreflang`, datos estructurados y el texto traducido de cada idioma.

### `assets/` — assets servidos por el CDN

Los 44 CSS/JS tal como los entregaba el CDN de Shopify. Redundante con `theme/assets/`, pero
muestra el resultado compilado y con los parámetros de versión reales.

### `evidence/` — capturas

`home-es.png`, `home-en.png`, `catalogo.png`. La de inglés es la más útil: muestra el nav, el banner
y el popup traducidos, o sea el multi-idioma funcionando de verdad.

---

## 🔴 Lo único que falta

**Los scripts Node de automatización de la Admin API.** No están en Shopify (viven en el disco de
Nick) y no aparecieron en `E:\dev`. Son el código que registraba traducciones, actualizaba las
políticas de la tienda y reescribía los menús de navegación.

Es la parte **más valiosa** del proyecto, porque es código propio: el tema es Dawn personalizado,
pero esos scripts los escribió él. Si aparecen (probar en Descargas o fuera de `E:\dev`), van a
`scripts/` de este repo.

Los gotchas de esa automatización, que valen por sí solos:
- `translationsRegister` exige el **digest del contenido actual** o falla.
- `shopPolicyUpdate` **falla en silencio** si no se le pasa el `type` de política.
- `menuUpdate` **reemplaza el menú entero**, no aplica un patch.
- En dropshipping, el inventario va con `tracked=false`.

---

## Lo que quedó verificado en vivo antes del cierre

- **Tres idiomas** con `hreflang` correcto: `en` en `/en`, `es` en la raíz, `pt` en `/pt`, más `x-default`.
- **Multi-moneda** mediante el formulario de localización de Shopify, con precios en EUR.
- **Tema propio**: Dawn personalizado (`/cdn/shop/t/2/`), servido desde el dominio propio.
- Popup de captura de email y barra de anuncios, traducidos por idioma.

---

## Relación con el portfolio

Este repo respalda la card **Store Up** en nickgranados.com. El case study ya está redactado en
pasado ("construida y operada", "sirvió tres idiomas"), así que **sigue siendo cierto con la tienda
apagada y no hay que reescribir nada**.

Cuando `storeup.store` deje de responder, un solo cambio en el portfolio: en `src/data/projects.ts`,
card `store-up`, poner `demo: null`. Un link roto es peor que no tener link.

Con el tema adentro, este repo ya tiene contenido propio suficiente como para **pasarlo a público**
y linkearlo desde la card, si Nick quiere. Se creó privado cuando solo tenía assets compilados de
Shopify.
