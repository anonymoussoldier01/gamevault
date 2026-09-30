import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const thumbsDir = join(root, 'public', 'thumbs');
mkdirSync(thumbsDir, { recursive: true });
const TIMEOUT = 15000;
const CONC = 6;
const UA = { 'User-Agent': 'Mozilla/5.0 GameVaultBot/1.0' };

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}
for (const [s, p] of Object.entries(thumbs)) {
  if (p.endsWith('.svg') || !existsSync(join(root, 'public', p.replace(/^\//, '')))) delete thumbs[s];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function toks(s) {
  return new Set(s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !new Set(['the', 'a', 'an', 'of', 'and', 'game', 'web', 'online', 'hd', '2d', '3d', 'full']).has(w)));
}
function overlap(a, b) {
  const A = toks(a), B = toks(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const t of A) if (B.has(t)) hit++;
  return hit / Math.min(A.size, B.size);
}

async function jget(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; } finally { clearTimeout(to); }
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
console.log(`steam-art: todo=${queue.length} have=${Object.keys(thumbs).length}`);
let i = 0, got = 0, mismatch = 0;
async function worker() {
  while (i < queue.length) {
    const k = i++;
    const g = queue[k];
    const j = await jget(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(g.title)}&cc=US&l=en`);
    const item = j?.items?.[0];
    if (item && overlap(g.title, item.name) >= 0.5) {
      const urls = [
        `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/capsule_616x353.jpg`,
        `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/header.jpg`,
      ];
      for (const u of urls) {
        const saved = await download(u, g.slug);
        if (saved) { thumbs[g.slug] = saved; got++; break; }
      }
    } else if (item) mismatch++;
    if ((k + 1) % 40 === 0) console.log(`steam-art: ${k + 1}/${queue.length} got=${got} mismatch=${mismatch}`);
    await sleep(300);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`steam-art: done got=${got} mismatch=${mismatch} raster=${Object.keys(thumbs).length}`);
