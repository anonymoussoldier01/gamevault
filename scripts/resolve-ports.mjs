import { readFileSync, writeFileSync, appendFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const TIMEOUT = 10000;
const CONC = 20;

const cands = JSON.parse(readFileSync(join(root, 'data', 'catalog-candidates.json'), 'utf8'));
const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
const STOP = new Set(['the', 'a', 'an', 'of', 'and', 's', 'vs', 'web', 'online', 'game', 'full', 'hd', '2d', '3d']);
function toks(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !STOP.has(w) && !(w.length <= 1 && /^\d+$/.test(w) === false));
}
function isNearDupe(candTitle, existTitle) {
  const a = new Set(toks(candTitle));
  const b = new Set(toks(existTitle));
  if (!a.size || !b.size) return false;
  const small = a.size <= b.size ? a : b;
  const big = a.size <= b.size ? b : a;
  let hit = 0;
  for (const t of small) if (big.has(t)) hit++;
  if (hit / small.size < 1) return false; // all small tokens must appear
  // distinguish sequels: difference is only trailing numbers
  const diff = [...big].filter((t) => !small.has(t)).concat([...small].filter((t) => !big.has(t)));
  if (diff.length > 0 && diff.every((t) => /^\d+$/.test(t) || /^(ii|iii|iv|2|3|4|5)$/.test(t))) return false;
  return true;
}
const existTitles = games.map((g) => g.title);
let dupes = 0;
const fresh = cands.filter((c) => {
  for (const t of existTitles) {
    if (isNearDupe(c.title, t)) { dupes++; return false; }
  }
  return true;
});
console.log(`near-dupe skip=${dupes} probing=${fresh.length}`);

async function jget(url, asText = true) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 GameVaultBot/1.0' } });
    if (!r.ok) return null;
    return asText ? await r.text() : r;
  } catch { return null; } finally { clearTimeout(to); }
}
async function headOk(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    if (r.status === 405 || r.status === 501) r = await fetch(url, { redirect: 'follow', signal: ctrl.signal });
    const xfo = (r.headers.get('x-frame-options') || '').toUpperCase();
    const csp = r.headers.get('content-security-policy') || '';
    const fa = csp.split(';').map((s) => s.trim()).find((s) => s.toLowerCase().startsWith('frame-ancestors'));
    const blocked = xfo.includes('DENY') || xfo.includes('SAMEORIGIN') || (!!fa && !/\*/.test(fa));
    return { ok: r.ok && !blocked, status: r.status, len: Number(r.headers.get('content-length') || 0), blocked };
  } catch { return { ok: false, status: 0, len: 0 }; } finally { clearTimeout(to); }
}
function ghParts(repoUrl) {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\/$/, '') };
}
async function jsdelivrTree(owner, repo) {
  for (const br of ['main', 'master']) {
    const t = await jget(`https://data.jsdelivr.com/v1/packages/gh/${owner}/${repo}@${br}?structure=flat`);
    if (!t) continue;
    try {
      const j = JSON.parse(t);
      const files = j.files || (j.default ? null : null);
      if (files && files.length) return { branch: br, files: files.map((f) => f.name || f) };
    } catch {}
  }
  return null;
}
function pickEntry(files) {
  const names = files.map((f) => String(f));
  const ix = names.find((n) => /(^|\/)index\.html?$/i.test(n) && !/node_modules/i.test(n));
  if (ix) return ix;
  const any = names.find((n) => /\.html?$/i.test(n) && !/node_modules|test|example|docs/i.test(n));
  return any || null;
}

const wins = [];
const reasons = {};
async function resolve(c) {
  const mark = (r) => { reasons[r] = (reasons[r] || 0) + 1; };
  // Tier 1 retro + t2-demo direct URLs
  const direct = [...c.demos.filter((u) => !/gn-math\.dev|gn-math\.github\.io\/web-port|itch\.io/.test(u))];
  for (const u of direct) {
    const h = await headOk(u);
    if (h.ok) { wins.push({ ...c, url: u, via: 'direct', heavy: /unity|webgl|wasm/i.test(u) }); return; }
  }
  // Repo-backed: jsdelivr tree
  for (const ru of c.repos) {
    const p = ghParts(ru);
    if (!p) continue;
    // monorepo subpath? e.g. genizy/web-port/tree/main/<slug>
    const subm = ru.match(/\/tree\/[^/]+\/(.+)$/);
    const tree = await jsdelivrTree(p.owner, p.repo);
    if (!tree) continue;
    let files = tree.files;
    let prefix = '';
    if (subm) {
      const sub = subm[1].replace(/\/$/, '');
      const scoped = files.filter((f) => f === sub || f.startsWith(sub + '/'));
      if (!scoped.length) continue;
      prefix = sub + '/';
      files = scoped.map((f) => f.slice(prefix.length));
    }
    const entry = pickEntry(files);
    if (!entry) { mark('no-web-entry'); continue; }
    const base = `https://cdn.jsdelivr.net/gh/${p.owner}/${p.repo}@${tree.branch}/${prefix}${entry}`;
    const h = await headOk(base);
    if (!h.ok) {
      // try owner github pages mirror
      const alt = subm
        ? `https://${p.owner}.github.io/${p.repo}/${prefix}${entry}`
        : `https://${p.owner}.github.io/${p.repo}/${entry}`;
      const h2 = await headOk(alt);
      if (h2.ok) { wins.push({ ...c, url: alt, via: 'gh-pages', heavy: /unity|build/i.test(entry) }); return; }
      mark('entry-dead'); continue;
    }
    // Unity part probe: find data parts in tree
    const parts = tree.files.filter((f) => /\.part\d+$|\.data\.unityweb|\.wasm\.unityweb|\.data$|\.wasm$/i.test(f) && /build/i.test(f));
    if (parts.length) {
      const probe = await headOk(`https://cdn.jsdelivr.net/gh/${p.owner}/${p.repo}@${tree.branch}/${parts[0]}`);
      if (!probe.ok || probe.len > 52428800) { mark('parts-unshippable'); continue; }
      wins.push({ ...c, url: base, via: 'jsdelivr-unity', heavy: true }); return;
    }
    wins.push({ ...c, url: base, via: 'jsdelivr', heavy: /unity|build|wasm/i.test(entry + tree.files.slice(0, 20).join(',')) }); return;
  }
  // gn-math.dev?id= fallback (hub with #embed game-only mode)
  const gid = (c.demos.find((u) => /gn-math\.dev\/\?id=/.test(u)) || '').match(/id=(\d+)/);
  if (gid) {
    const t = await jget(`https://gn-math.dev/?id=${gid[1]}`);
    if (t && /zoneFrame|pagesData|openZone/i.test(t)) { wins.push({ ...c, url: `https://gn-math.dev/?id=${gid[1]}#embed`, via: 'gnmath-embed', heavy: false }); return; }
  }
  mark('unresolved');
}

let ii = Number(process.env.RESUME || 0);
const prior = ii > 0 ? JSON.parse(readFileSync(join(root, 'data', 'catalog-wins.json'), 'utf8')) : [];
const seenW = new Set(prior.map((w) => w.slug));
async function worker() {
  while (ii < fresh.length) {
    const c = fresh[ii++];
    if (seenW.has(c.slug)) continue;
    await resolve(c);
    if ((ii % 25) === 0) console.log(`resolve: ${ii}/${fresh.length} wins=${wins.length}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
const byVia = {};
for (const w of wins) byVia[w.via] = (byVia[w.via] || 0) + 1;
console.log(`resolved wins=${wins.length}`, JSON.stringify(byVia), 'reasons:', JSON.stringify(reasons));
const merged = [...prior, ...wins.filter((w) => !seenW.has(w.slug))];
writeFileSync(join(root, 'data', 'catalog-wins.json'), JSON.stringify(merged, null, 1));
console.log(`total wins banked=${merged.length}`);
