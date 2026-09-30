import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const TIMEOUT = 15000;
const CONC = 8;
const UA = { 'User-Agent': 'Mozilla/5.0 GameVaultBot/1.0' };

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}
for (const [s, p] of Object.entries(thumbs)) {
  if (p.endsWith('.svg') || !existsSync(join(root, 'public', p.replace(/^\//, '')))) delete thumbs[s];
}

async function jget(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 30000);
  try {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; } finally { clearTimeout(to); }
}

// all icon-ish files in repo
const tree = await jget('https://api.github.com/repos/BinBashBanana/gfiles/git/trees/master?recursive=1');
const byDir = new Map();
for (const x of tree?.tree || []) {
  const p = String(x.path);
  if (!/^gfiles\/html5\/[^/]+\//.test(p)) continue;
  if (!/\.(png|jpe?g)$/i.test(p)) continue;
  if (/fonts|startup-image|eot|woff/i.test(p)) continue;
  const dir = p.split('/')[2];
  if (!byDir.has(dir)) byDir.set(dir, []);
  byDir.get(dir).push(p);
}
function scoreIcon(p) {
  const n = p.toLowerCase();
  if (/16x16|32x32|favicon.*16|favicon.*32|-16\.|-32\./.test(n)) return -100;
  if (/\/icons\//.test(n) && /(play|stop|forward|backward|skip|reverse|help|go-|arrow|button)/.test(n)) return -100;
  let s = 0;
  const dim = n.match(/(\d{2,4})x(\d{2,4})|@2x|-180|ios-180|-144|-192|-512/);
  if (dim) { const d = parseInt(dim[1] || '0'); s += isNaN(d) ? 60 : Math.min(d, 512); }
  if (/logo|icon\.png|apple-touch-icon\.png|favicon\.png/.test(n)) s += 40;
  if (/favicon\.ico/.test(n)) s += 5;
  return s;
}
const bestByDir = new Map();
for (const [dir, files] of byDir) {
  const ranked = files.map((f) => [scoreIcon(f), f]).sort((a, b) => b[0] - a[0]);
  if (ranked[0][0] > 0) bestByDir.set(dir, ranked[0][1]);
}
console.log(`dirs with usable icon: ${bestByDir.size}`);

async function download(imgUrl, slug) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(imgUrl, { redirect: 'follow', signal: ctrl.signal, headers: UA });
    if (!r.ok) return null;
    const ct = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(ct)) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 2500 || buf.length > 800000) return null;
    const ext = ct === 'image/png' ? 'png' : ct === 'image/webp' ? 'webp' : 'jpg';
    const name = `${slug}.${ext}`;
    writeFileSync(join(root, 'public', 'thumbs', name), buf);
    return `/thumbs/${name}`;
  } catch { return null; } finally { clearTimeout(to); }
}

const queue = games.filter((g) => {
  if (thumbs[g.slug]) return false;
  try {
    const u = new URL(g.iframeUrl);
    if (u.hostname !== 'binbashbanana.github.io') return false;
    const m = u.pathname.match(/html5\/([^/]+)/);
    return !!(m && bestByDir.has(m[1]));
  } catch { return false; }
});
console.log(`binbash-art: todo=${queue.length}`);
let i = 0, got = 0;
async function worker() {
  while (i < queue.length) {
    const k = i++;
    const g = queue[k];
    const dir = new URL(g.iframeUrl).pathname.match(/html5\/([^/]+)/)[1];
    const saved = await download(`https://binbashbanana.github.io/gfiles/${bestByDir.get(dir)}`, g.slug);
    if (saved) { thumbs[g.slug] = saved; got++; }
    if ((k + 1) % 20 === 0) console.log(`binbash-art: ${k + 1}/${queue.length} got=${got}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`binbash-art: done got=${got} raster=${Object.keys(thumbs).length}`);
