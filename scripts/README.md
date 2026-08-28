# Scripts de automatización de la Shopify Admin API

**109 scripts** en Node (ESM, `.mjs`) escritos para operar la tienda Store Up por API, no a mano
desde el editor visual. Rescatados de `F:\tmp\` el 2026-08-28, antes del cierre de la cuenta.

Esta es la parte **propia** del proyecto: el tema es Dawn personalizado, pero esto es código escrito
desde cero.

## Configuración

Ningún script tiene el token hardcodeado (verificado: cero coincidencias de `shpat_`, `shpca_`,
`shppa_`). Todos leen las credenciales de un archivo de entorno:

```
SHOPIFY_SHOP=tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_...
```

⚠️ **Los scripts apuntan a la ruta absoluta `f:\tmp\shopify.env`.** Para reusarlos hay que crear ese
archivo o buscar y reemplazar la ruta. Ver `.env.example`.

El `.gitignore` excluye todo `*.env`: **nunca commitear el archivo con el token real.**

## Qué cubren

Agrupados por lo que resuelven:

| Grupo | Scripts | Qué hacen |
|---|---|---|
| **Traducciones** | `shopify-translate-*`, `shopify-es-translations`, `shopify-add-portuguese`, `shopify-add-english` | Registrar traducciones de productos, variantes, descripciones, menús, artículos, políticas y strings del tema |
| **Idiomas y mercados** | `shopify-enable-multilang`, `shopify-check-markets`, `shopify-fix-lang`, `shopify-fix-currency` | Publicar locales, configurar mercados y moneda |
| **Navegación** | `shopify-fix-menu`, `shopify-fix-nav*`, `shopify-add-footer-menu-block` | Reescribir menús de cabecera y pie |
| **Políticas** | `shopify-update-policies`, `shopify-fetch-policies`, `shopify-verify-policies` | Crear y verificar las políticas legales de la tienda |
| **Tema** | `shopify-dark-theme`, `shopify-assign-hero`, `shopify-fix-header` | Modificar `settings_data.json` y las secciones por API |
| **Catálogo** | `shopify-add-product`, `shopify-add-premium` | Alta de productos y variantes |
| **Envíos** | `shopify-fix-shipping*`, `shopify-check-shipping-lang` | Zonas y tarifas de envío |
| **Verificación** | `shopify-verify-*`, `shopify-analyze`, `shopify-check-access` | Comprobar contra producción que un cambio quedó aplicado |

Que exista un `verify-*` por cada área es lo más interesante del conjunto: cada cambio se
comprobaba contra la tienda real en vez de darse por hecho.

## Comportamientos de la API que hay que conocer

Estos costaron tiempo de descubrir y no están claros en la documentación:

- **`translationsRegister` exige el `digest` del contenido actual.** Sin el digest correcto, el
  registro se rechaza. Hay que leer el `translatableContent` antes de escribir.
- **`shopPolicyUpdate` falla en silencio si no se le pasa el `type` de política.** Devuelve éxito
  y no cambia nada, que es la peor combinación posible.
- **`menuUpdate` reemplaza el menú entero.** No aplica un patch: hay que mandar todos los ítems,
  incluidos los que no cambian, o se pierden.
- **En dropshipping el inventario va con `tracked=false`**, porque el stock no lo controla la tienda.

## Estado

La tienda cierra. Estos scripts quedan como referencia de trabajo con la Admin API de Shopify y
como respaldo del case study en el portfolio. No dependen de la tienda para leerse, pero sí para
ejecutarse.
