import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
mkdirSync(join(root, 'public', 'thumbs'), { recursive: true });

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}
for (const [s, p] of Object.entries(thumbs)) {
  if (p.endsWith('.svg') || !existsSync(join(root, 'public', p.replace(/^\//, '')))) delete thumbs[s];
}
function nospace(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}
const donors = games.filter((g) => thumbs[g.slug]).map((g) => ({ g, n: nospace(g.title) }));
let got = 0;
for (const g of games) {
  if (thumbs[g.slug]) continue;
  const cn = nospace(g.title);
  if (cn.length < 5) continue;
  let best = null, bestScore = 0;
  for (const d of donors) {
    if (d.g.slug === g.slug || d.n.length < 5) continue;
    if (!(cn.includes(d.n) || d.n.includes(cn))) continue;
    const score = Math.min(cn.length, d.n.length) * 100 + Math.min(d.g.plays, 9999999) / 1000000;
    if (score > bestScore) { bestScore = score; best = d.g; }
  }
  if (best) {
    const src = thumbs[best.slug];
    const ext = src.slice(src.lastIndexOf('.'));
    const name = `/thumbs/${g.slug}${ext}`;
    copyFileSync(join(root, 'public', src.replace(/^\//, '')), join(root, 'public', name.replace(/^\//, '')));
    thumbs[g.slug] = name;
    got++;
  }
}
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`sibling-art: got=${got} raster=${Object.keys(thumbs).length}/${games.length}`);
