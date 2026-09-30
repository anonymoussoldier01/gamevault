import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));

const CONC = 24;
const TIMEOUT = 12000;

async function check(g) {
  const t0 = Date.now();
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    let res = await fetch(g.iframeUrl, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(g.iframeUrl, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
      try { await res.arrayBuffer(); } catch {}
    }
    const ms = Date.now() - t0;
    const xfo = (res.headers.get('x-frame-options') || '').toUpperCase();
    const csp = res.headers.get('content-security-policy') || '';
    const dead = !(res.status >= 200 && res.status < 400);
    let blocked = false;
    if (xfo.includes('DENY') || xfo.includes('SAMEORIGIN')) blocked = true;
    const fa = csp.split(';').map((s) => s.trim()).find((s) => s.toLowerCase().startsWith('frame-ancestors'));
    if (fa && !/\*/.test(fa) && !/gamevault/i.test(fa)) blocked = true;
    return { slug: g.slug, url: g.iframeUrl, cat: g.category, heavy: !!g.heavy, status: res.status, dead, blocked, xfo, cspFa: fa || '', ms };
  } catch (e) {
    return { slug: g.slug, url: g.iframeUrl, cat: g.category, heavy: !!g.heavy, status: 0, dead: true, blocked: false, xfo: '', cspFa: '', ms: Date.now() - t0, error: String(e.cause?.code || e.name) };
  } finally {
    clearTimeout(to);
  }
}

const out = new Array(games.length);
let i = 0;
async function worker() {
  while (i < games.length) {
    const k = i++;
    out[k] = await check(games[k]);
    if ((k + 1) % 100 === 0) console.log(`sweep1: ${k + 1}/${games.length}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));

const dead = out.filter((r) => r.dead);
const blocked = out.filter((r) => !r.dead && r.blocked);
const ok = out.filter((r) => !r.dead && !r.blocked);
writeFileSync(join(root, 'data', 'sweep1.json'), JSON.stringify(out, null, 1));
console.log(`sweep1: total=${out.length} ok=${ok.length} blocked=${blocked.length} dead=${dead.length}`);
console.log(`blocked: ${blocked.slice(0, 20).map((r) => r.slug).join(', ')}${blocked.length > 20 ? ' ...' : ''}`);
console.log(`dead: ${dead.slice(0, 40).map((r) => r.slug).join(', ')}${dead.length > 40 ? ' ...' : ''}`);
