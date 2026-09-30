import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const thumbsDir = join(root, 'public', 'thumbs');
mkdirSync(thumbsDir, { recursive: true });
const TIMEOUT = 15000;
const CONC = 10;
const UA = { 'User-Agent': 'Mozilla/5.0 GameVaultBot/1.0' };
const HOSTS = new Set(['3kh0.github.io', 'binbashbanana.github.io', 'sz-games.github.io', 'retrogamescenter.ru', 'gn-math.github.io', 'htmlxm.github.io', 'ubg365.github.io', 'class-76.github.io', '1kh0.github.io', '23azostore.github.io', 'lekug.github.io']);

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}
for (const [s, p] of Object.entries(thumbs)) {
  if (p.endsWith('.svg') || !existsSync(join(root, 'public', p.replace(/^\//, '')))) delete thumbs[s];
}

async function getText(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: UA });
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
  ];
  for (const p of pats) {
    const m = html.match(p);
    if (m) {
      try {
        const u = new URL(m[1], pageUrl);
        if (/^https?:$/.test(u.protocol) && !/\.svg(\?|$)/i.test(u.pathname)) return u.href;
      } catch {}
    }
  }
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    const src = m[1];
    if (/logo|favicon|sprite|spinner|loader|blank|pixel|icon[-_]?(16|32)|1x1/i.test(src)) continue;
    try {
      const u = new URL(src, pageUrl);
      if (/^https?:$/.test(u.protocol) && !/\.svg(\?|$)/i.test(u.pathname)) return u.href;
    } catch {}
  }
  return null;
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

const queue = games.filter((g) => {
  if (thumbs[g.slug]) return false;
  try { return HOSTS.has(new URL(g.iframeUrl).hostname); } catch { return false; }
});
console.log(`host-art: todo=${queue.length} have=${Object.keys(thumbs).length}`);
let i = 0, got = 0;
async function worker() {
  while (i < queue.length) {
    const k = i++;
    const g = queue[k];
    const img = pickImage(await getText(g.iframeUrl), g.iframeUrl);
    if (img) {
      const saved = await download(img, g.slug);
      if (saved) { thumbs[g.slug] = saved; got++; }
    }
    if ((k + 1) % 40 === 0) console.log(`host-art: ${k + 1}/${queue.length} got=${got}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`host-art: done got=${got} raster=${Object.keys(thumbs).length}`);
