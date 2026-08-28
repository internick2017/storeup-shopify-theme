for (const u of ['https://storeup.store/pt/', 'https://storeup.store/en/', 'https://storeup.store/']) {
  const r = await fetch(u, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
  const t = await r.text();
  const lang = (t.match(/<html[^>]*lang="([^"]+)"/) || [])[1];
  console.log(u, r.status, 'lang=', lang,
    '| Adicionar ao carrinho:', t.includes('Adicionar ao carrinho'),
    '| Assine nossa newsletter:', t.includes('Assine nossa newsletter'),
    '| carrito:', t.toLowerCase().includes('carrito'));
}
