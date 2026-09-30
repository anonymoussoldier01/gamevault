import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const thumbsDir = join(root, 'public', 'thumbs');
mkdirSync(thumbsDir, { recursive: true });
const TIMEOUT = 15000;
const CONC = 16;

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}
for (const [s, p] of Object.entries(thumbs)) {
  if (!existsSync(join(root, 'public', p.replace(/^\//, '')))) delete thumbs[s];
}

const EXT_BY_CT = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

async function tryDownload(imgUrl, slug) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(imgUrl, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 GameVaultBot/1.0' } });
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

function iconCandidates(g) {
  const u = new URL(g.iframeUrl);
  const slug = g.slug;
  const out = [];
  if (/^ubg(89|98|365)\.github\.io$/.test(u.hostname)) {
    out.push(`https://${u.hostname}/assets/img/games/${slug}.png`);
    out.push(`https://${u.hostname}/assets/img/games/${slug}.jpg`);
  }
  if (u.hostname === 'coolubg2.github.io') {
    out.push(`https://coolubg2.github.io/images/games-256/${slug}.png`);
    out.push(`https://coolubg2.github.io/images/games-256/${slug}.jpg`);
  }
  return out;
}

const queue = games.filter((g) => /^https?:\/\//i.test(g.iframeUrl) && !thumbs[g.slug] && iconCandidates(g).length > 0);
console.log(`thumbs2: todo=${queue.length}`);
let i = 0, got = 0;
async function worker() {
  while (i < queue.length) {
    const g = queue[i++];
    for (const u of iconCandidates(g)) {
      const saved = await tryDownload(u, g.slug);
      if (saved) { thumbs[g.slug] = saved; got++; break; }
    }
    if ((i % 50) === 0) console.log(`thumbs2: ${i}/${queue.length} got=${got}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`thumbs2: done got=${got} total=${Object.keys(thumbs).length}/${games.length}`);
