import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const HOSTS = ['gn-math.github.io','ubg89.github.io','htmlxm.github.io','coolubg2.github.io','ubg98.github.io','23azostore.github.io','lekug.github.io','ubg365.github.io','class-76.github.io','1kh0.github.io','harshulsilverspoon.github.io','harshulgoon.github.io','harshulmoon.github.io','irv77.github.io','genizymath.github.io','macvg-games.github.io','ubg100.github.io','classroom6x.github.io'];

const SKIP = new Set(['category','categories','search','about','contact','privacy','dmca','terms','tags','tag','all','new','hot','top','popular','index','home','play','game','games','assets','static','icons','ports','resources','css','js','img','images','fonts','api']);
const ASSET_RE = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|json|xml|txt|map)$/i;

async function crawl(host) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`https://${host}/`, { redirect: 'follow', signal: ctrl.signal });
    if (!res.ok) return { host, error: `http-${res.status}`, paths: [] };
    const html = await res.text();
    const hrefs = [...html.matchAll(/href="([^"#?]+)"/gi)].map((m) => m[1]);
    const paths = new Set();
    for (let h of hrefs) {
      if (/^(https?:)?\/\//i.test(h)) {
        try {
          const u = new URL(h, `https://${host}/`);
          if (u.hostname !== host) continue;
          h = u.pathname;
        } catch { continue; }
      }
      if (!h.startsWith('/')) h = '/' + h;
      const seg = h.split('/').filter(Boolean)[0];
      if (!seg || SKIP.has(seg.toLowerCase()) || ASSET_RE.test(seg) || seg.length > 80) continue;
      if (!/^[A-Za-z0-9][A-Za-z0-9\-_.]*$/.test(seg)) continue;
      paths.add(seg.toLowerCase());
    }
    return { host, paths: [...paths].sort() };
  } catch (e) {
    return { host, error: String(e.cause?.code || e.name), paths: [] };
  } finally {
    clearTimeout(to);
  }
}

const results = await Promise.all(HOSTS.map(crawl));
const index = {};
for (const r of results) {
  index[r.host] = r.paths;
  console.log(`${r.host}: ${r.paths.length} paths${r.error ? ` (err ${r.error})` : ''}`);
}
writeFileSync(join(root, 'data', 'host-index.json'), JSON.stringify(index, null, 1));
const total = Object.values(index).reduce((n, p) => n + p.length, 0);
console.log(`crawl: ${total} paths across ${HOSTS.length} hosts`);
