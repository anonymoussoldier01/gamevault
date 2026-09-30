import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const thumbsDir = join(root, 'public', 'thumbs');
mkdirSync(thumbsDir, { recursive: true });
const TIMEOUT = 15000;
const CONC = 12;

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}

async function getText(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GameVaultBot/1.0' } });
    if (!r.ok) return '';
    const ct = r.headers.get('content-type') || '';
    if (!/html/i.test(ct)) return '';
    return await r.text();
  } catch { return ''; } finally { clearTimeout(to); }
}

function pickImage(html, pageUrl) {
  if (!html) return null;
  const pats = [
    /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)/i,
  ];
  for (const p of pats) {
    const m = html.match(p);
    if (m) return resolveUrl(m[1], pageUrl);
  }
  // first content <img> (skip pixels/logos/spinners)
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    const src = m[1];
    if (/pixel|spinner|loader|logo|blank|1x1|transparent/i.test(src)) continue;
    const abs = resolveUrl(src, pageUrl);
    if (abs) return abs;
  }
  return null;
}

function resolveUrl(src, pageUrl) {
  if (!src || src.startsWith('data:')) return null;
  try {
    const u = new URL(src, pageUrl);
    if (!/^https?:$/.test(u.protocol)) return null;
    if (/\.svg(\?|$)/i.test(u.pathname)) return null;
    return u.href;
  } catch { return null; }
}

const EXT_BY_CT = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

async function download(imgUrl, slug) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(imgUrl, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GameVaultBot/1.0' } });
    if (!r.ok) return null;
    const ct = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const ext = EXT_BY_CT[ct];
    if (!ext) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1500 || buf.length > 1000000) return null;
    const name = `${slug}.${ext}`;
    writeFileSync(join(thumbsDir, name), buf);
    return `/thumbs/${name}`;
  } catch { return null; } finally { clearTimeout(to); }
}

const queue = games.filter((g) => /^https?:\/\//i.test(g.iframeUrl) && !(thumbs[g.slug] && existsSync(join(root, 'public', thumbs[g.slug].replace(/^\//, '/').slice(1)))));
console.log(`thumbs: todo=${queue.length} already=${Object.keys(thumbs).length}`);
let i = 0, got = 0;
async function worker() {
  while (i < queue.length) {
    const g = queue[i++];
    const html = await getText(g.iframeUrl);
    const img = pickImage(html, g.iframeUrl);
    if (img) {
      const saved = await download(img, g.slug);
      if (saved) { thumbs[g.slug] = saved; got++; }
    }
    if ((i % 50) === 0) console.log(`thumbs: ${i}/${queue.length} got=${got}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`thumbs: done got=${got} total=${Object.keys(thumbs).length}/${games.length}`);
