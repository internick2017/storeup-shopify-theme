import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);

const THEME_ID = 156532670622;

async function getAsset(key) {
  const r = await fetch(`https://${env.SHOPIFY_SHOP}/admin/api/2024-10/themes/${THEME_ID}/assets.json?asset[key]=${encodeURIComponent(key)}`, {
    headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN },
  });
  return r.json();
}

function flatten(o, p, out) {
  for (const k in o) {
    const v = o[k];
    const np = p ? p + '.' + k : k;
    if (typeof v === 'string') out[np] = v;
    else if (v && typeof v === 'object') flatten(v, np, out);
  }
  return out;
}

const spanish = /añadir|carrito|env[ií]o gratis|tu compra|cantidad|b[úu]squeda|cerrar|precio de oferta|agotado|tu pedido|iniciar sesi[óo]n|suscr[íi]bete|correo electr[óo]nico|de descuento|pagar pedido/i;

for (const key of ['locales/pt-BR.json', 'locales/en.default.json', 'locales/es.json']) {
  const j = await getAsset(key);
  if (!j.asset) { console.log(`${key}: NO EXISTE (${JSON.stringify(j).slice(0, 120)})`); continue; }
  const flat = flatten(JSON.parse(j.asset.value), '', {});
  const leaks = Object.entries(flat).filter(([k, v]) => spanish.test(v));
  console.log(`\n=== ${key} === total=${Object.keys(flat).length} | sospechosas de ESPAÑOL=${leaks.length}`);
  leaks.slice(0, 50).forEach(([k, v]) => console.log(`  ${k} = ${v.slice(0, 80)}`));
}
