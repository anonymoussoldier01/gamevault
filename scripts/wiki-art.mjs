import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const thumbsDir = join(root, 'public', 'thumbs');
mkdirSync(thumbsDir, { recursive: true });
const TIMEOUT = 15000;
const CONC = 6;
const UA = { 'User-Agent': 'GameVaultBot/1.0 (contact: abuse@gamevault.gg)' };
const API = 'https://en.wikipedia.org/w/api.php';

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}
for (const [s, p] of Object.entries(thumbs)) {
  if (p.endsWith('.svg') || !existsSync(join(root, 'public', p.replace(/^\//, '')))) delete thumbs[s];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function toks(s) {
  return new Set(s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !new Set(['the', 'a', 'an', 'of', 'and', 'game', 'web', 'online', 'video', 'hd', '2d', '3d']).has(w)));
}
function overlap(a, b) {
  const A = toks(a), B = toks(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const t of A) if (B.has(t)) hit++;
  return hit / Math.min(A.size, B.size);
}

async function jget(params) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(API + params, { headers: UA });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; } finally { clearTimeout(to); }
}

async function pageImage(title) {
  const j = await jget(`?action=query&format=json&prop=pageimages&piprop=original&pithumbsize=600&titles=${encodeURIComponent(title)}&origin=*`);
  if (!j?.query?.pages) return null;
  const p = Object.values(j.query.pages)[0];
  if (!p || p.missing) return null;
  const src = p.original?.source || p.thumbnail?.source;
  if (!src || /\.svg(\?|$)/i.test(src)) return null;
  return { title: p.title, src };
}

async function download(url, slug) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: UA });
    if (!r.ok) return null;
    const ct = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(ct)) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 4000 || buf.length > 800000) return null;
    const ext = ct === 'image/png' ? 'png' : ct === 'image/webp' ? 'webp' : 'jpg';
    const name = `${slug}.${ext}`;
    writeFileSync(join(thumbsDir, name), buf);
    return `/thumbs/${name}`;
  } catch { return null; } finally { clearTimeout(to); }
}

const queue = games.filter((g) => !thumbs[g.slug]);
console.log(`wiki-art: todo=${queue.length} have=${Object.keys(thumbs).length}`);
let i = 0, got = 0;
async function worker() {
  while (i < queue.length) {
    const k = i++;
    const g = queue[k];
    let hit = await pageImage(g.title);
    if (!hit) {
      const s = await jget(`?action=query&format=json&list=search&srsearch=${encodeURIComponent(g.title + ' video game')}&srlimit=3&origin=*`);
      const cands = (s?.query?.search || []).map((x) => x.title);
      for (const c of cands) {
        if (overlap(g.title, c) >= 0.5) { hit = await pageImage(c); break; }
      }
    }
    if (hit) {
      const saved = await download(hit.src, g.slug);
      if (saved) { thumbs[g.slug] = saved; got++; }
    }
    if ((k + 1) % 40 === 0) console.log(`wiki-art: ${k + 1}/${queue.length} got=${got}`);
    await sleep(200);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`wiki-art: done got=${got} raster=${Object.keys(thumbs).length}`);
