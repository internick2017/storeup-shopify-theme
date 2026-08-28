const r = await fetch('https://storeup.store/products/lampara-proyectora-de-atardecer-ambiente-aesthetic-para-tu-cuarto', { headers: { 'User-Agent': 'Mozilla/5.0' } });
const t = await r.text();
const links = t.match(/<link[^>]*hreflang[^>]*>/g) || [];
links.forEach(l => console.log(l));
const canon = t.match(/<link[^>]*rel="canonical"[^>]*>/g) || [];
canon.forEach(l => console.log(l));
