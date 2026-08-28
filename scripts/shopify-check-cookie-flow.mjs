const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36' };
const H = 'lampara-proyectora-de-atardecer-ambiente-aesthetic-para-tu-cuarto';

async function session(rootUrl, productUrl) {
  console.log('\n== root:', rootUrl);
  const r1 = await fetch(rootUrl, { redirect: 'manual', headers: UA });
  let cookies = (r1.headers.getSetCookie?.() || []).map(c => c.split(';')[0]).join('; ');
  console.log('root status', r1.status, '| cookies:', cookies.slice(0, 80) + '...');
  const r2 = await fetch(productUrl, { redirect: 'manual', headers: { ...UA, Cookie: cookies, Referer: rootUrl } });
  console.log('product status', r2.status, r2.headers.get('location') || '');
  if (r2.status === 200) {
    const t = await r2.text();
    return t;
  }
  return null;
}

const pt = await session('https://storeup.store/pt/', `https://storeup.store/pt/products/${H}`);
if (pt) {
  for (const n of ['Adicionar ao carrinho', '16 Cores', 'Clássica — Pôr do Sol', 'Pro — Controle por App']) {
    console.log(`  [${pt.includes(n) ? 'PASS' : 'FAIL'}] ${n}`);
  }
}
const en = await session('https://storeup.store/en/', `https://storeup.store/en/products/${H}`);
if (en) {
  for (const n of ['Golden — 16 Colors', 'Classic — Sunset', 'Pro — App Control', 'Add to cart']) {
    console.log(`  [${en.includes(n) ? 'PASS' : 'FAIL'}] ${n}`);
  }
}
