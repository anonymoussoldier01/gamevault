import { readFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const deadDir = join(iframesDir, '.dead');
mkdirSync(deadDir, { recursive: true });
const TIMEOUT = 15000;

const report = JSON.parse(readFileSync(join(root, 'data', 'sweep1.json'), 'utf8'));
const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
const bySlug = Object.fromEntries(games.map((g) => [g.slug, g]));

// Sweep 3a: quarantine dead + blocked (wrappers kept in .dead for retry)
const condemned = new Set(report.filter((r) => r.dead || r.blocked).map((r) => r.slug));
console.log(`condemned(dead/blocked)=${condemned.size}`);

// Sweep 2: boot-check heavy ok games past loader text (local /ports/ always live — skip)
const heavies = report.filter((r) => !r.dead && !r.blocked && bySlug[r.slug]?.heavy && /^https?:\/\//i.test(r.url));
console.log(`heavies to boot-check=${heavies.length}`);
async function bootCheck(r) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(r.url, { redirect: 'follow', signal: ctrl.signal });
    const t = await res.text();
    const ok = res.ok && t.length > 1500 && /<html|unity|loading|canvas|<script|build\//i.test(t);
    return { slug: r.slug, ok, len: t.length };
  } catch {
    return { slug: r.slug, ok: false, len: 0 };
  } finally { clearTimeout(to); }
}
let bi = 0;
const bootFails = [];
const CONC = 16;
async function worker() {
  while (bi < heavies.length) {
    const r = heavies[bi++];
    const b = await bootCheck(r);
    if (!b.ok) bootFails.push(b.slug);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`boot-check: fails=${bootFails.length}${bootFails.length ? ' ' + bootFails.slice(0, 20).join(',') : ''}`);
for (const s of bootFails) condemned.add(s);

let q = 0;
for (const slug of condemned) {
  const p = join(iframesDir, `${slug}.html`);
  if (existsSync(p)) { try { renameSync(p, join(deadDir, `${slug}.html`)); q++; } catch {} }
}
console.log(`quarantined=${q} (kept in iframes/.dead for retry)`);
