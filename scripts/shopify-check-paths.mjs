const H = 'lampara-proyectora-de-atardecer-ambiente-aesthetic-para-tu-cuarto';
const paths = [
  '/pt/collections/all',
  '/pt/search',
  '/pt/cart',
  `/pt/products/${H}`,
  `/pt/products/${H}/`,
  `/pt/products/${H}?variant=`,
  `/pt/collections/all/products/${H}`,
  `/en/products/${H}`,
];
for (const p of paths) {
  const r = await fetch('https://storeup.store' + p, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(p, '->', r.status, r.headers.get('location') || '');
}
