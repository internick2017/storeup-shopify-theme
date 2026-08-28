# Store Up — archivo del storefront de Shopify

Rescate del trabajo hecho sobre la tienda **storeup.store**, capturado el **2026-08-28**, antes de
que venza la suscripción de Shopify y el sitio salga de línea.

La tienda no generó ventas y no se va a seguir pagando. Cuando la cuenta cierre, el dominio deja de
responder y el tema desaparece con ella. Este repo existe para que el trabajo no se pierda.

---

## ⚠️ Lo que falta y solo podés conseguir vos

**El código fuente `.liquid` del tema NO está acá**, y no se puede bajar desde afuera.

Liquid se renderiza en el servidor de Shopify: lo que sirve el sitio público es HTML ya compilado.
Las plantillas (`.liquid`), la configuración de secciones y los archivos de traducción viven en el
admin y solo salen con acceso autenticado.

### Cómo exportarlo (5 minutos, antes de que venza)

**Opción A, la más simple (sin instalar nada):**

1. Entrá al admin de Shopify.
2. Andá a **Online Store → Themes**.
3. En el tema activo, tocá **⋯ (Actions) → Download theme file**.
4. Shopify te manda un **ZIP por email** con todo el tema.
5. Descomprimilo dentro de este repo, en una carpeta `theme/`, y commiteá.

**Opción B, con Shopify CLI** (si preferís y podés loguearte):

```bash
shopify theme pull --store storeup.store --path ./theme
```

### Lo otro que conviene exportar antes de cerrar

- **Los scripts de automatización de la Admin API** (Node) que usaste para registrar traducciones,
  actualizar políticas y reescribir menús. No están en ningún repo y son la parte más valiosa:
  es código propio, no tema comprado.
- **Export de productos** desde el admin (CSV), si querés conservar el catálogo.

---

## Lo que SÍ quedó rescatado acá

### `assets/` — 44 archivos servidos por el tema

CSS y JS tal como los servía el CDN de Shopify. Incluye el CSS base y los componentes
(carrito, drawer, tarjetas de producto, formulario de localización, buscador predictivo).
Es el resultado compilado, no las fuentes, pero permite ver los estilos reales que tenía la tienda.

### `rendered/` — HTML renderizado de 9 páginas

Snapshots del HTML servido, con los tres idiomas cubiertos:

| Archivo | Página |
|---|---|
| `home-es.html` / `home-en.html` / `home-pt.html` | Home en español, inglés y portugués |
| `catalogo-es.html` / `catalogo-en.html` / `catalogo-pt.html` | Catálogo en los tres idiomas |
| `producto-es.html` | Ficha de producto |
| `blog-es.html` | Blog |
| `politica-privacidad.html` | Política de privacidad |

Sirven como evidencia del marcado real: estructura, `hreflang`, datos estructurados y el texto
traducido de cada idioma.

### `evidence/` — capturas de pantalla

`home-es.png`, `home-en.png` y `catalogo.png`. La de inglés es la más útil: muestra el nav, el
banner y el popup traducidos, o sea el multi-idioma funcionando de verdad.

---

## Lo que quedó verificado en vivo antes del cierre

- **Tres idiomas** con `hreflang` correcto: `en` en `/en`, `es` en la raíz, `pt` en `/pt`, más `x-default`.
- **Multi-moneda** mediante el formulario de localización de Shopify, con precios en EUR.
- **Tema propio**: Dawn personalizado (`/cdn/shop/t/2/`), servido desde el dominio propio.
- Popup de captura de email y barra de anuncios, traducidos por idioma.

---

## Relación con el portfolio

Este trabajo es el respaldo de la card **Store Up** en nickgranados.com, cuyo case study ya está
redactado en pasado ("construida y operada"), así que **sigue siendo cierto con la tienda apagada**.

Cuando `storeup.store` deje de responder, hay que hacer un solo cambio en el portfolio:
en `src/data/projects.ts`, card `store-up`, poner `demo: null`. Un link roto es peor que no tener link.
