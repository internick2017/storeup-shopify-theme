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

const CSS = `

/* ===== Judge.me dark theme overrides (Store Up) ===== */
.jdgm-rev-widg,
.jdgm-rev-widg__title,
.jdgm-rev-widg__summary-text,
.jdgm-rev__author,
.jdgm-rev__title,
.jdgm-rev__body,
.jdgm-rev__timestamp,
.jdgm-histogram__label,
.jdgm-histogram__percentage,
.jdgm-rev__rating,
.jdgm-widget-actions-wrapper,
.jdgm-all-reviews-rating-wrapper,
.jdgm-rev-widg__header,
.jdgm-paginate__page,
.jdgm-rev__prod-link {
  color: #F5F5F0 !important;
}

.jdgm-rev-widg__summary-stars,
.jdgm-rev__rating,
.jdgm-star,
.jdgm-star.jdgm--on {
  color: #E8610A !important;
}

.jdgm-histogram__bar-content {
  background-color: #E8610A !important;
}

.jdgm-rev,
.jdgm-rev-widg__reviews {
  border-color: rgba(245,245,240,0.15) !important;
}

.jdgm-write-rev-link,
.jdgm-paginate__page {
  color: #E8610A !important;
  border-color: #E8610A !important;
}

.jdgm-rev__pic-img,
.jdgm-rev__pics {
  border-radius: 8px;
}
/* ===== end Judge.me overrides ===== */
`;

// Append a base.css
console.log('🎨 Leyendo base.css...');
const asset = await api('GET', `/themes/${THEME_ID}/assets.json?asset[key]=assets/base.css`);
let css = asset.asset?.value || '';

if (css.includes('Judge.me dark theme overrides')) {
  console.log('ℹ️  CSS de Judge.me ya estaba. Reemplazando...');
  css = css.split('/* ===== Judge.me dark theme overrides')[0].trimEnd();
}

css += CSS;

const r = await api('PUT', `/themes/${THEME_ID}/assets.json`, {
  asset: { key: 'assets/base.css', value: css }
});
console.log(r.errors ? `❌ ${JSON.stringify(r.errors)}` : '✅ CSS de Judge.me aplicado (texto claro + estrellas naranjas)');
