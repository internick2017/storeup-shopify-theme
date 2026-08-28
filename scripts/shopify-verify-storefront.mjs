const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36' };
const HANDLE = 'lampara-proyectora-de-atardecer-ambiente-aesthetic-para-tu-cuarto';

async function fetchWithCookies(url, extraHeaders = {}) {
  let cookies = '';
  let cur = url;
  for (let hop = 0; hop < 6; hop++) {
    const r = await fetch(cur, { redirect: 'manual', headers: { ...UA, ...extraHeaders, ...(cookies ? { Cookie: cookies } : {}) } });
    const setCookies = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
    for (const sc of setCookies) {
      const pair = sc.split(';')[0];
      cookies = cookies ? cookies + '; ' + pair : pair;
    }
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get('location');
      console.log(`  hop: ${cur} -> ${r.status} ${loc}`);
      cur = new URL(loc, cur).href;
      continue;
    }
    console.log(`  final: ${cur} -> ${r.status}`);
    return r.text();
  }
  throw new Error('too many redirects');
}

const checks = [
  {
    name: 'PT page',
    url: `https://storeup.store/pt/products/${HANDLE}`,
    lang: 'pt-BR',
    needles: ['Adicionar ao carrinho', '16 Cores', 'Clássica — Pôr do Sol', 'Pro — Controle por App'],
  },
  {
    name: 'EN page',
    url: `https://storeup.store/en/products/${HANDLE}`,
    lang: 'en',
    needles: ['Golden — 16 Colors', 'Classic — Sunset', 'Pro — App Control'],
  },
];

let fails = 0;
for (const c of checks) {
  console.log(`\n== ${c.name}: ${c.url}`);
  const html = await fetchWithCookies(c.url, { 'Accept-Language': c.lang });
  for (const n of c.needles) {
    const found = html.includes(n);
    if (!found) fails++;
    console.log(`  [${found ? 'PASS' : 'FAIL'}] contains ${JSON.stringify(n)}`);
  }
}
process.exit(fails ? 1 : 0);
