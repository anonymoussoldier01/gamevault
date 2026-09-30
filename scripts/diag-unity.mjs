import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const TIMEOUT = 12000;
const CONC = 12;
const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
const targets = games.filter((g) =>
  /^https?:\/\//i.test(g.iframeUrl) &&
  (g.heavy || /jsdelivr|unity|webgl|\.unityweb/i.test(g.iframeUrl)) &&
  !/gn-math\.dev|coolubg2|ubg(89|98|365)\.github\.io/.test(g.iframeUrl)
);
console.log(`targets=${targets.length}`);

async function probe(g) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(g.iframeUrl, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 GameVaultBot/1.0' } });
    const ct = (r.headers.get('content-type') || '').split(';')[0].trim();
    const cl = r.headers.get('content-length') || '?';
    if (!/html|text/i.test(ct)) return `${g.slug} | BIN ct=${ct} cl=${cl} status=${r.status}`;
    const txt = await r.text();
    const marks = [];
    if (/<canvas/i.test(txt)) marks.push('canvas');
    if (/<script/i.test(txt)) marks.push('script');
    if (/<iframe/i.test(txt)) marks.push('iframe');
    if (/<embed/i.test(txt)) marks.push('embed');
    if (/UnityLoader|unityInstance|\.unityweb/i.test(txt)) marks.push('UNITY');
    if (/ruffle|\\.swf/i.test(txt)) marks.push('ruffle/swf-ref');
    const title = (txt.match(/<title[^>]*>([^<]{0,60})/i) || [])[1] || '(no-title)';
    return `${g.slug} | HTML len=${txt.length} marks=[${marks.join(',')}] title="${title}" url=${g.iframeUrl.slice(0, 70)}`;
  } catch (e) {
    return `${g.slug} | ERR ${e.cause?.code || e.name}`;
  } finally { clearTimeout(t); }
}
const out = new Array(targets.length);
let i = 0;
async function worker() {
  while (i < targets.length) {
    const k = i++;
    out[k] = await probe(targets[k]);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
for (const line of out) console.log(line);
