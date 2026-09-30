import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const thumbsDir = join(root, 'public', 'thumbs');
mkdirSync(thumbsDir, { recursive: true });
const TIMEOUT = 15000;
const CONC = 4;
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36' };

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}
for (const [s, p] of Object.entries(thumbs)) {
  if (p.endsWith('.svg') || !existsSync(join(root, 'public', p.replace(/^\//, '')))) delete thumbs[s];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function toks(s) {
  return new Set(s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !new Set(['the', 'a', 'an', 'of', 'and', 'game', 'web', 'online', 'demo', 'hd', '2d', '3d', 'port', 'webport']).has(w)));
}
function overlap(a, b) {
  const A = toks(a), B = toks(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const t of A) if (B.has(t)) hit++;
  return hit / Math.min(A.size, B.size);
}

async function getText(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) return '';
    return await r.text();
  } catch { return ''; } finally { clearTimeout(to); }
}

function parseCells(html) {
  const out = [];
  const blocks = html.split('game_cell ');
  for (const b of blocks.slice(1)) {
    const tm = b.match(/game_title"[^>]*>\s*<a[^>]*>([^<]{1,80})</);
    const im = b.match(/data-lazy_src="(https:\/\/img\.itch\.zone\/[^"]+)"|src="(https:\/\/img\.itch\.zone\/[^"]+)"/);
    if (tm && im) out.push({ title: tm[1].trim(), img: (im[1] || im[2]).replace(/100x80%23c|50x40%23c|210x167%23c/, '315x250%23c') });
    if (out.length >= 12) break;
  }
  return out;
}

const EXT = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
async function download(imgUrl, slug) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(imgUrl, { redirect: 'follow', signal: ctrl.signal, headers: UA });
    if (!r.ok) return null;
    const ct = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const ext = EXT[ct];
    if (!ext) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 2500 || buf.length > 800000) return null;
    const name = `${slug}.${ext}`;
    writeFileSync(join(thumbsDir, name), buf);
    return `/thumbs/${name}`;
  } catch { return null; } finally { clearTimeout(to); }
}

const queue = games.filter((g) => !thumbs[g.slug]);
console.log(`itch-art: todo=${queue.length} have=${Object.keys(thumbs).length}`);
let i = 0, got = 0;
async function worker() {
  while (i < queue.length) {
    const k = i++;
    const g = queue[k];
    const html = await getText(`https://itch.io/search?q=${encodeURIComponent(g.title)}`);
    let best = null, bestScore = 0;
    for (const c of parseCells(html)) {
      const s = overlap(g.title, c.title);
      if (s > bestScore) { bestScore = s; best = c; }
    }
    if (best && bestScore >= 0.5) {
      const saved = await download(best.img, g.slug);
      if (saved) { thumbs[g.slug] = saved; got++; }
    }
    if ((k + 1) % 40 === 0) console.log(`itch-art: ${k + 1}/${queue.length} got=${got}`);
    await sleep(800);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`itch-art: done got=${got} raster=${Object.keys(thumbs).length}`);
