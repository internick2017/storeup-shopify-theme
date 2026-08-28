import https from 'https';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('f:\\tmp\\shopify.env', 'utf8')
    .split('\n').filter(Boolean).map(l => l.split('='))
);
const TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOP  = env.SHOPIFY_SHOP;

function graphql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const options = {
      hostname: SHOP, path: '/admin/api/2024-10/graphql.json', method: 'POST',
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let d = ''; res.on('data', c => { d += c; }); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(data); req.end();
  });
}

const menusRes = await graphql(`{
  menus(first: 10) {
    edges { node { id title handle items { id title url type } } }
  }
}`);

const mainMenu = menusRes.data?.menus?.edges?.find(e => e.node.handle === 'main-menu')?.node;
console.log('Items actuales:', mainMenu?.items?.map(i => `${i.title} (${i.type})`).join(', '));

// Actualizar con tipos correctos — sin página de contacto que no existe
const r = await graphql(`
  mutation menuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) {
      menu { id items { title url type } }
      userErrors { field message }
    }
  }
`, {
  id: mainMenu.id,
  title: "Menú principal",
  items: [
    { title: "Inicio", url: "/", type: "FRONTPAGE" },
    { title: "Catálogo", url: "/collections/all", type: "CATALOG" },
  ]
});

if (r.data?.menuUpdate?.userErrors?.length) {
  console.log('❌', r.data.menuUpdate.userErrors[0].message);
} else {
  const items = r.data.menuUpdate.menu.items.map(i => i.title).join(' | ');
  console.log('✅ Menú actualizado:', items);
}
