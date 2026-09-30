import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const thumbsDir = join(root, 'public', 'thumbs');
mkdirSync(thumbsDir, { recursive: true });

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
let thumbs = {};
try { thumbs = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}
for (const [s, p] of Object.entries(thumbs)) {
  if (!existsSync(join(root, 'public', p.replace(/^\//, '')))) delete thumbs[s];
}

const PALETTES = [['#7c3aed','#06b6d4'],['#db2777','#7c3aed'],['#059669','#22d3ee'],['#ea580c','#db2777'],['#4f46e5','#a855f7'],['#0d9488','#84cc16'],['#dc2626','#f59e0b'],['#0891b2','#6366f1']];
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }

function svgFor(game) {
  const h = hash(game.slug);
  const [from, to] = PALETTES[h % PALETTES.length];
  const initial = (game.title || game.slug).charAt(0).toUpperCase();
  let circles = '';
  let seed = h;
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let k = 0; k < 14; k++) {
    const cx = (rnd() * 640).toFixed(0), cy = (rnd() * 360).toFixed(0), r = (18 + rnd() * 70).toFixed(0);
    const op = (0.05 + rnd() * 0.12).toFixed(2);
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="${op}"/>`;
  }
  const rot = (h % 60) - 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">`
    + `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>`
    + `<rect width="640" height="360" fill="url(#g)"/>${circles}`
    + `<g transform="rotate(${rot} 320 180)" font-family="Arial,sans-serif" font-weight="bold" text-anchor="middle">`
    + `<text x="320" y="252" font-size="190" fill="#ffffff" opacity="0.92">${initial}</text></g></svg>`;
}

let made = 0;
for (const g of games) {
  if (thumbs[g.slug]) continue;
  writeFileSync(join(thumbsDir, `${g.slug}.svg`), svgFor(g));
  thumbs[g.slug] = `/thumbs/${g.slug}.svg`;
  made++;
}
writeFileSync(join(root, 'data', 'thumbs.json'), JSON.stringify(thumbs, null, 1));
console.log(`thumbs-svg: made=${made} total=${Object.keys(thumbs).length}/${games.length}`);
