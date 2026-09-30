import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const deadDir = join(iframesDir, '.dead');
mkdirSync(deadDir, { recursive: true });
const TIMEOUT = 12000;
const CONC = 12;

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
const targets = games.filter((g) =>
  /^https?:\/\//i.test(g.iframeUrl) &&
  (g.heavy || /jsdelivr|unity|webgl|\.unityweb/i.test(g.iframeUrl)) &&
  !/gn-math\.dev|coolubg2|ubg(89|98|365)\.github\.io/.test(g.iframeUrl)
);
console.log(`part-audit targets=${targets.length}`);

async function fget(url, asText = true, to = TIMEOUT) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), to);
  try {
    const r = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 GameVaultBot/1.0' } });
    if (!r.ok) return null;
    return asText ? await r.text() : r;
  } catch { return null; } finally { clearTimeout(t); }
}
async function fhead(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    return { ok: r.ok, status: r.status, len: Number(r.headers.get('content-length') || 0) };
  } catch { return { ok: false, status: 0, len: 0 }; } finally { clearTimeout(t); }
}

async function audit(g) {
  const fails = [];
  const html = await fget(g.iframeUrl);
  if (!html) return { slug: g.slug, fails: ['index-unreachable'] };
  if (!/<html|unity|loading|canvas|<script|build\//i.test(html)) return { slug: g.slug, fails: ['index-no-game-markers'] };
  // collect asset refs
  const refs = new Set();
  for (const m of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)) refs.add(m[1]);
  for (const m of html.matchAll(/["']((?:Build|TemplateData|StreamingAssets)\/[^"']+)["']/g)) refs.add(m[1]);
  for (const m of html.matchAll(/getParts\(\s*["']([^"']+)["']/g)) {
    refs.add(m[1] + '.part1'); // unity split pattern: probe first part
  }
  const isUnity = /UnityLoader|unityInstance|UnityProgress|\.unityweb|getParts/i.test(html);
  const cands = [...refs].filter((u) => !/^(data:|#|javascript:)/i.test(u) && !/^https?:\/\//i.test(u) && /\.(js|unityweb|wasm|data|part\d+|json|mem|symbols\.json)$/i.test(u));
  if (isUnity && !cands.length) return { slug: g.slug, fails: ['unity-no-asset-refs'] };
  // probe loader/first-part (max 3)
  const base = g.iframeUrl.slice(0, g.iframeUrl.lastIndexOf('/') + 1);
  let probed = 0;
  // prefer data-ish files first
  cands.sort((a, b) => (/part|data|wasm/i.test(b) ? 1 : 0) - (/part|data|wasm/i.test(a) ? 1 : 0));
  for (const ref of cands.slice(0, 3)) {
    let abs;
    try { abs = new URL(ref, base).href; } catch { continue; }
    if (/^https?:\/\//i.test(ref)) abs = ref;
    // skip absolute third-party libs (google ads etc.)
    if (!abs.includes(new URL(g.iframeUrl).hostname) && !/jsdelivr|gstatic|githubusercontent/i.test(abs)) continue;
    const h = await fhead(abs);
    probed++;
    if (!h.ok) { fails.push(`asset-403:${ref.slice(0, 60)}`); break; }
    if (/cdn\.jsdelivr\.net/i.test(abs) && h.len > 52428800) { fails.push(`asset-oversize:${(h.len / 1048576).toFixed(0)}MB`); break; }
    if (/part1|\.data\.unityweb|\.data$|\.wasm(\.unityweb)?$/i.test(ref)) break; // first data file verified
  }
  if (isUnity && probed === 0) fails.push('unity-no-probeable-assets');
  return { slug: g.slug, fails, unity: isUnity };
}

const out = new Array(targets.length);
let i = 0;
async function worker() {
  while (i < targets.length) {
    const k = i++;
    out[k] = await audit(targets[k]);
    if ((k + 1) % 20 === 0) console.log(`part-audit: ${k + 1}/${targets.length}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
const bad = out.filter((r) => r.fails.length);
console.log(`part-audit: fail=${bad.length}`);
for (const b of bad) console.log(`  FAIL ${b.slug} [${b.fails.join(',')}] unity=${!!b.unity}`);

let qlog = [];
try { qlog = JSON.parse(readFileSync(join(root, 'data', 'quarantine-log.json'), 'utf8')); } catch {}
// REPORT-ONLY: never auto-quarantine (binaries and minimal shells false-positive).
// Quarantine decisions are made per-item after diag-unity.mjs review.
let q = 0;
console.log(`report-only: ${bad.length} flags, quarantined=${q} (manual review required)`);
