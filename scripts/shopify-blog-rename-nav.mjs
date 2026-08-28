import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function rest(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: SHOP,
      path: `/admin/api/2024-10${path}`,
      method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: d ? JSON.parse(d) : {} }));
    });
    req.on('error', (e) => resolve({ status: 0, body: { error: String(e) } }));
    if (data) req.write(data);
    req.end();
  });
}

function gql(query, variables) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ query, variables });
    const options = {
      hostname: SHOP,
      path: '/admin/api/2024-10/graphql.json',
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', (e) => resolve({ errors: [String(e)] }));
    req.write(data);
    req.end();
  });
}

// 1) Rename blog "Notícias" -> "Blog"
console.log('1️⃣ Renombrando blog a "Blog"...');
const ren = await rest('PUT', '/blogs/100378542238.json', { blog: { id: 100378542238, title: 'Blog' } });
if (ren.status === 200) console.log(`   ✅ título="${ren.body.blog.title}" handle="${ren.body.blog.handle}" (URL sin cambios)`);
else { console.error('   ❌', ren.status, JSON.stringify(ren.body).slice(0, 300)); }

// 2) Inspect menus
console.log('\n2️⃣ Leyendo menús...');
const menus = await gql(`
  query {
    menus(first: 10) {
      nodes {
        id handle title isDefault
        items { id title type url resourceId items { id title } }
      }
    }
  }`);
if (menus.errors) { console.error('❌', JSON.stringify(menus.errors)); process.exit(1); }
for (const m of menus.data.menus.nodes) {
  console.log(`   ${m.handle} (${m.title}) -> [${m.items.map(i => i.title).join(' | ')}]`);
}

const main = menus.data.menus.nodes.find(m => m.handle === 'main-menu');
if (!main) { console.error('❌ No encontré main-menu'); process.exit(1); }
if (main.items.some(i => i.type === 'BLOG' || /blog/i.test(i.title))) {
  console.log('⏭️ El menú ya tiene un enlace al blog. Nada que hacer.');
  process.exit(0);
}

// 3) Append Blog item (menuUpdate replaces full items list — re-send existing + new)
console.log('\n3️⃣ Añadiendo "Blog" al menú principal...');
const toInput = (i) => {
  const inp = { id: i.id, title: i.title, type: i.type };
  if (i.resourceId) inp.resourceId = i.resourceId;
  else if (i.url) inp.url = i.url;
  if (i.items && i.items.length) inp.items = i.items.map(toInput);
  return inp;
};
const items = main.items.map(toInput);
items.push({ title: 'Blog', type: 'BLOG', resourceId: 'gid://shopify/Blog/100378542238' });

const upd = await gql(`
  mutation($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) {
      menu { handle items { title type url } }
      userErrors { field message }
    }
  }`, { id: main.id, title: main.title, items });

if (upd.errors) { console.error('❌ errors:', JSON.stringify(upd.errors)); process.exit(1); }
const ue = upd.data.menuUpdate.userErrors;
if (ue.length) { console.error('❌ userErrors:', JSON.stringify(ue)); process.exit(1); }
console.log('   ✅ Menú ahora:', upd.data.menuUpdate.menu.items.map(i => `${i.title} (${i.url || i.type})`).join(' | '));

console.log('\n🎉 Listo: blog renombrado y enlazado en el menú.');
