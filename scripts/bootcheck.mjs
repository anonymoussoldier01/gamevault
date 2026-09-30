import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const TIMEOUT = 15000;
const CONC = 20;

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
const targets = games.filter((g) => /^https?:\/\//i.test(g.iframeUrl));
let COOLUBG_NAMES = null;
try { COOLUBG_NAMES = new Set(JSON.parse(readFileSync(join(root, 'data', 'coolubg-names.json'), 'utf8'))); } catch {}

async function boot(g) {
  // coolubg2 player pages are identical shells — validate slug against their pages.js catalog
  try {
    const u = new URL(g.iframeUrl);
    if (u.hostname === 'coolubg2.github.io' && u.pathname === '/games/' && COOLUBG_NAMES) {
      const name = decodeURIComponent(u.search.replace(/^\?/, ''));
      if (name && !COOLUBG_NAMES.has(name)) return { slug: g.slug, status: 200, len: 0, fails: [`not-in-catalog:${name}`] };
      return { slug: g.slug, status: 200, len: 7161, fails: [] };
    }
  } catch {}
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(g.iframeUrl, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 GameVaultBot/1.0' } });
    const ct = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const declared = Number(res.headers.get('content-length') || 0);
    // Non-HTML binaries (ROMs, SWFs): verify via HEAD, never download bulk
    if (!/html|text/i.test(ct)) {
      try {
        const c2 = new AbortController();
        const t2 = setTimeout(() => c2.abort(), TIMEOUT);
        const h = await fetch(g.iframeUrl, { method: 'HEAD', redirect: 'follow', signal: c2.signal });
        clearTimeout(t2);
        const dl = Number(h.headers.get('content-length') || declared || 0);
        const ok = h.ok && (dl === 0 || dl > 5000);
        return { slug: g.slug, status: h.status, len: dl, fails: ok ? [] : [`bin-${h.status}-${dl}`] };
      } catch {
        // HEAD unsupported — fall through to bounded GET below
      }
      if (declared > 20000000) {
        return { slug: g.slug, status: res.status, len: declared, fails: res.ok ? [] : [`http-${res.status}`] };
      }
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const t = /html|text/i.test(ct) ? buf.toString('utf8') : '';
    const fails = [];
    if (!(res.status >= 200 && res.status < 400)) fails.push(`http-${res.status}`);
    if (/html|text/i.test(ct)) {
      // minimal legit shells (canvas + bundled loader) can be <800 bytes
      const hasLoader = /<canvas|<script|<iframe|<embed|bundle\.js|loader\.js/i.test(t);
      if (buf.length < (hasLoader ? 300 : 800)) fails.push(`tiny-${buf.length}`);
      const title = (t.match(/<title[^>]*>([^<]{0,120})/i) || [])[1] || '';
      if (/404|not found|file not found|site not found|does not exist/i.test(title)) fails.push(`title:${title.slice(0, 40)}`);
      if (/there isn't a github pages site here/i.test(t)) fails.push('gh-missing');
    } else {
      if (buf.length < 5000) fails.push(`bin-tiny-${buf.length}`);
    }
    return { slug: g.slug, status: res.status, len: buf.length, fails };
  } catch (e) {
    return { slug: g.slug, status: 0, len: 0, fails: [String(e.cause?.code || e.name)] };
  } finally { clearTimeout(to); }
}

const out = new Array(targets.length);
let i = 0;
async function worker() {
  while (i < targets.length) {
    const k = i++;
    out[k] = await boot(targets[k]);
    if ((k + 1) % 100 === 0) console.log(`bootcheck: ${k + 1}/${targets.length}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
const fails = out.filter((r) => r.fails.length > 0);
writeFileSync(join(root, 'data', 'bootcheck.json'), JSON.stringify(out, null, 1));
console.log(`bootcheck: total=${out.length} pass=${out.length - fails.length} fail=${fails.length}`);
for (const f of fails) console.log(`  FAIL ${f.slug} [${f.fails.join(',')}] status=${f.status} len=${f.len}`);
