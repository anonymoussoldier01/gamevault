import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const deadDir = join(iframesDir, '.dead');
mkdirSync(deadDir, { recursive: true });

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
const TIMEOUT = 10000;

async function fetchInfo(url, wantBody = false) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    if (res.status === 405 || res.status === 501) res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
    const xfo = (res.headers.get('x-frame-options') || '').toUpperCase();
    const csp = res.headers.get('content-security-policy') || '';
    let blocked = false;
    if (xfo.includes('DENY') || xfo.includes('SAMEORIGIN')) blocked = true;
    const fa = csp.split(';').map((s) => s.trim()).find((s) => s.toLowerCase().startsWith('frame-ancestors'));
    if (fa && !/\*/.test(fa) && !/gamevault/i.test(fa)) blocked = true;
    const live = res.status >= 200 && res.status < 400;
    let bodySig = '';
    if (wantBody && live && !blocked) {
      const r2 = await fetch(url, { redirect: 'follow', signal: ctrl.signal });
      const t = await r2.text();
      bodySig = `${t.length}:${t.slice(0, 200)}`;
    }
    return { url, status: res.status, live, blocked, bodySig };
  } catch {
    return { url, status: 0, live: false, blocked: false, bodySig: '' };
  } finally {
    clearTimeout(to);
  }
}

// SPA-fallback signatures: host index bodies that impostor-200s would match
const PROBE_HOSTS = ['ubg89.github.io', 'ubg98.github.io', 'ubg365.github.io', 'classroom6x.github.io', 'harshulsilverspoon.github.io', 'harshulgoon.github.io', 'harshulmoon.github.io', 'gn-math.github.io', 'htmlxm.github.io', 'coolubg2.github.io', '23azostore.github.io', 'lekug.github.io', 'class-76.github.io', '1kh0.github.io'];
const sigs = {};
await Promise.all(PROBE_HOSTS.map(async (h) => {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), TIMEOUT);
    const r = await fetch(`https://${h}/`, { redirect: 'follow', signal: ctrl.signal });
    const t = await r.text();
    clearTimeout(to);
    sigs[h] = `${t.length}:${t.slice(0, 200)}`;
  } catch { sigs[h] = ''; }
}));

function templatesFor(slug) {
  return [
    `https://ubg89.github.io/${slug}-unblocked.html`,
    `https://ubg98.github.io/${slug}-unblocked.html`,
    `https://ubg365.github.io/${slug}-unblocked.html`,
    `https://classroom6x.github.io/go/${slug}/`,
    `https://harshulsilverspoon.github.io/${slug}/`,
    `https://harshulsilverspoon.github.io/iframes/${slug}`,
    `https://harshulgoon.github.io/${slug}/`,
    `https://harshulmoon.github.io/${slug}/`,
    `https://gn-math.github.io/${slug}/`,
    `https://htmlxm.github.io/${slug}/`,
    `https://coolubg2.github.io/${slug}/`,
    `https://23azostore.github.io/${slug}/`,
    `https://lekug.github.io/${slug}/`,
    `https://class-76.github.io/${slug}/`,
    `https://1kh0.github.io/${slug}/`,
  ];
}

async function runPool(items, conc, fn, label) {
  const out = new Array(items.length);
  let i = 0, done = 0;
  await Promise.all(Array.from({ length: conc }, async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k], k);
      done++;
      if (done % 200 === 0) console.log(`${label}: ${done}/${items.length}`);
    }
  }));
  return out;
}

// Phase 1: verify current URLs
const phase1 = await runPool(games, 24, (g) => fetchInfo(g.iframeUrl), 'verify');
const liveIdx = new Set();
phase1.forEach((r, k) => { if (r.live && !r.blocked) liveIdx.add(k); });
console.log(`verify: live=${liveIdx.size} needs-remap=${games.length - liveIdx.size}`);

// Phase 2: probe alternates for the rest
const deadGames = games.map((g, k) => ({ g, k })).filter(({ k }) => !liveIdx.has(k));
const phase2 = await runPool(deadGames, 32, async ({ g }) => {
  for (const u of templatesFor(g.slug)) {
    if (u === g.iframeUrl) continue;
    const r = await fetchInfo(u, true);
    if (!r.live || r.blocked) continue;
    const host = new URL(u).hostname;
    if (sigs[host] && r.bodySig && sigs[host] === r.bodySig) continue; // SPA impostor
    if (!r.bodySig || r.bodySig.startsWith('0:')) continue;
    return { slug: g.slug, url: u, status: r.status };
  }
  return { slug: g.slug, url: null };
}, 'probe');

const remapped = new Map(phase2.filter((r) => r.url).map((r) => [r.slug, r.url]));
console.log(`probe: remapped=${remapped.size} still-dead=${phase2.length - remapped.size}`);

// Phase 3: apply — rewrite wrappers, update sources.tsv, quarantine dead
let applied = 0;
for (const [slug, url] of remapped) {
  const p = join(iframesDir, `${slug}.html`);
  if (!existsSync(p)) continue;
  const raw = readFileSync(p, 'utf8');
  const next = raw.replace(/<iframe[^>]*src="[^"]+"/i, (m) => m.replace(/src="[^"]+"/i, `src="${url}"`));
  if (next !== raw) { writeFileSync(p, next); applied++; }
}
const tsvLines = readFileSync(join(root, 'data', 'sources.tsv'), 'utf8').split('\n');
for (let li = 1; li < tsvLines.length; li++) {
  const cols = tsvLines[li].split('\t');
  if (cols[0] && remapped.has(cols[0])) cols[2] = remapped.get(cols[0]);
  tsvLines[li] = cols.join('\t');
}
writeFileSync(join(root, 'data', 'sources.tsv'), tsvLines.join('\n'));

const stillDead = phase2.filter((r) => !r.url).map((r) => r.slug);
let quarantined = 0;
for (const slug of stillDead) {
  const p = join(iframesDir, `${slug}.html`);
  if (existsSync(p)) { try { renameSync(p, join(deadDir, `${slug}.html`)); quarantined++; } catch {} }
}
writeFileSync(join(root, 'data', 'remap-report.json'), JSON.stringify({ remapped: [...remapped.entries()].map(([slug, url]) => ({ slug, url })), quarantined: stillDead }, null, 1));
console.log(`apply: wrappers-rewritten=${applied} quarantined=${quarantined}`);
