import { readFileSync, writeFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const BASE = `https://${env.SHOPIFY_SHOP}/admin/api/2024-10`;
const HDR = { 'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' };
const THEME = 156532670622;

async function gql(query, variables) {
  const r = await fetch(`${BASE}/graphql.json`, { method: 'POST', headers: HDR, body: JSON.stringify({ query, variables }) });
  return r.json();
}

// 1) Read current footer-group.json, back it up, add link_list block
const cur = await (await fetch(`${BASE}/themes/${THEME}/assets.json?asset[key]=sections/footer-group.json`, { headers: HDR })).json();
const data = JSON.parse(cur.asset.value);
writeFileSync('f:\\tmp\\footer-group.json.bak', cur.asset.value);

const footer = data.sections.footer;
if (footer.blocks && Object.values(footer.blocks).some(b => b.type === 'link_list')) {
  console.log('⏭️ El footer ya tiene bloque link_list.');
} else {
  footer.blocks = footer.blocks || {};
  footer.blocks['link_list_enlaces'] = {
    type: 'link_list',
    settings: { heading: 'Enlaces', menu: 'footer' },
  };
  footer.block_order = Object.keys(footer.blocks);
  const put = await fetch(`${BASE}/themes/${THEME}/assets.json`, {
    method: 'PUT', headers: HDR,
    body: JSON.stringify({ asset: { key: 'sections/footer-group.json', value: JSON.stringify(data, null, 2) } }),
  });
  console.log(put.status === 200 ? '✅ Bloque link_list añadido al footer (backup: footer-group.json.bak)' : `❌ PUT ${put.status}: ${(await put.text()).slice(0, 300)}`);
}

// 2) Translate the new heading "Enlaces" (footer section group content)
console.log('\nTraduciendo encabezado "Enlaces"...');
const HEADING_T = { en: 'Quick links', 'pt-BR': 'Links rápidos' };
const res = await gql(`query { translatableResources(first: 50, resourceType: ONLINE_STORE_THEME_SECTION_GROUP) { nodes { resourceId translatableContent { key value digest } } } }`);
let done = 0;
for (const node of res.data.translatableResources.nodes) {
  for (const c of node.translatableContent) {
    if (c.value !== 'Enlaces') continue;
    for (const locale of ['en', 'pt-BR']) {
      const reg = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) {
        translationsRegister(resourceId: $id, translations: $t) {
          translations { locale key } userErrors { field message }
        } }`, { id: node.resourceId, t: [{ locale, key: c.key, value: HEADING_T[locale], translatableContentDigest: c.digest }] });
      if (reg.errors || (reg.data && reg.data.translationsRegister.userErrors.length)) {
        console.error(`❌ ${locale}:`, JSON.stringify(reg.errors || reg.data.translationsRegister.userErrors).slice(0, 200));
      } else done++;
    }
  }
}
console.log(done ? `✅ ${done} traducciones del encabezado` : '⚠️ No encontré "Enlaces" como contenido traducible aún (puede tardar en indexar — re-correr este script si el heading sale sin traducir)');
