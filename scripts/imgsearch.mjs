import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const thumbsDir = join(root, 'public', 'thumbs');
mkdirSync(thumbsDir, { recursive: true });
const TIMEOUT = 15000;
const CONC = 4;
const PAUSE_MS = 1200;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}
for (const [s, p] of Object.entries(thumbs)) {
  if (p.endsWith('.svg') || !existsSync(join(root, 'public', p.replace(/^\//, '')))) delete thumbs[s];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, headers = {}) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; } finally { clearTimeout(to); }
}

async function vqdFor(query) {
  const html = await fetchText(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`);
  if (!html) return null;
  const m = html.match(/vqd\s*=\s*['"]([^'"]+)['"]/) || html.match(/vqd=([^&'"]+)/);
  return m ? m[1] : null;
}

async function imageResults(query, vqd) {
  const url = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${encodeURIComponent(vqd)}&o=json&p=1&s=0`;
  const t = await fetchText(url, { Referer: 'https://duckduckgo.com/', 'Accept': 'application/json' });
  if (!t) return [];
  try {
    const j = JSON.parse(t);
    return j.results || [];
  } catch { return []; }
}

const EXT_BY_CT = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

async function download(imgUrl, slug) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(imgUrl, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA, Referer: 'https://duckduckgo.com/' } });
    if (!r.ok) return null;
    const ct = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const ext = EXT_BY_CT[ct];
    if (!ext) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 3000 || buf.length > 800000) return null;
    const name = `${slug}.${ext}`;
    writeFileSync(join(thumbsDir, name), buf);
    return `/thumbs/${name}`;
  } catch { return null; } finally { clearTimeout(to); }
}

function pickUrl(results) {
  for (const r of results) {
    const u = r.image || '';
    if (!/^https?:\/\//i.test(u)) continue;
    if (/\.svg(\?|$)/i.test(u)) continue;
    if (r.width && r.width < 150) continue;
    if (/logo|icon-|favicon|sprite/i.test(u) && results.length > 3) continue;
    return u;
  }
  return null;
}

const queue = games.filter((g) => !thumbs[g.slug]);
console.log(`imgsearch: todo=${queue.length} have-raster=${Object.keys(thumbs).length}`);
let i = 0, got = 0, noVqd = 0;
async function worker() {
  while (i < queue.length) {
    const k = i++;
    const g = queue[k];
    const query = `${g.title} online game`;
    const vqd = await vqdFor(query);
    if (!vqd) { noVqd++; }
    else {
      const results = await imageResults(query, vqd);
      const url = pickUrl(results);
      if (url) {
        const saved = await download(url, g.slug);
        if (saved) { thumbs[g.slug] = saved; got++; }
      }
    }
    if ((k + 1) % 25 === 0) console.log(`imgsearch: ${k + 1}/${queue.length} got=${got} noVqd=${noVqd}`);
    await sleep(PAUSE_MS);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`imgsearch: done got=${got} noVqd=${noVqd} raster=${Object.keys(thumbs).length}`);
