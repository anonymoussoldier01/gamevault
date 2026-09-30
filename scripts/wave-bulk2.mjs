import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const deadDir = join(iframesDir, '.dead');
mkdirSync(deadDir, { recursive: true });
const TIMEOUT = 12000;
const CONC = 16;
const UA = { 'User-Agent': 'Mozilla/5.0 GameVaultBot/1.0' };

function slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function titleOf(slug) { return slug.split('-').map((w) => /^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' '); }
function catOf(slug, title) {
  const s = (slug + ' ' + title).toLowerCase();
  if (/fnaf|fnac|freddy|granny|baldi|slend|horror|scary|haunted|bendy|amanda|banban|poppy|rainbow|doors|pressure|fears|window|backrooms|exit|mouth|kindergarten|hello-neighbor|friendly|andys|night|dead|blood|tattletail|schoolboy|yandere|precinct|mutilate|nun|shrek|look-outside|saihate|touhou|witch|mad-father|corpse|ao-oni|milk|yume|deadseat|dontakethis|grudge|momo|exorcist|frickbear|fear|hunger|buckshot|zombie|mist|dark|dead|killer|murder|ghost|vampire|wolf|alien-hominid|abobo|motherload|neverball|zombocalypse/.test(s)) return 'horror';
  if (/(^|\-)io($|\-)|openfront|repuls|kirka|kour|hordes|goons|florr|taming|venge|bonk|mope|krunker|shockers|diep|arras|slither|agar|hole|paper|splix|defly|evowars|worm|starblast|zombs|surviv|miniroyale|tetr|gartic|warfront|frontwars|stumble|bonk|taming|apes|fused|starblast|gats|brutal|slay-one|powerline|lordz|wings|starve|kour|kirka/.test(s)) return 'io';
  if (/slope|moto|drive|drift|madalin|parking|bike|trial|stunt|rac|kart|tunnel|subway|temple|ski|snow|surf|rolling|traffic|rider|derby|burnout|hill-climb|outrun|road|speed|f1|formula|nascar|truck|bus|taxi|monster|demolition|tow|police|chase|traffic-racer|running-fred|marbles|helicopter|e-scooter|park-out|adventure-drivers|car-rush|crazy-cars|drift-boss|moto-x3m|temple-run|slope|tunnel-rush|vex|snow-rider|ball-surfer|rolling-sky|skiing-fred|burnin|burnout|car-eats|earn-to-die|road-fighter|madalin|top-speed|super-bike|trials|blocky|hover-racer|derive|race|drive-mad/.test(s)) return 'racing';
  if (/fnf|friday|osu|melody|beat|danc|rhythm|guitar|ddr|geometry|jsab|sprunki|piano|drum|heaven|popstar|music|beatblock|friday-night|funkin|miku|rap|fighter-omega|fire-truck|wood-block/.test(s)) return 'rhythm-action';
  if (/minecraft|eagler|voxel|sandbox|melon|grindcraft|powder|townscaper|worldbox|alchemy|terraria|raft|slime|goat|powerwash|farm|city-build|planet|settlement|web-fishing|fungiman|case-clicker|minecraft-case|idle|clicker|burgeria|monkey-mart/.test(s)) return 'sandbox';
  if (/pokemon|mario|sonic|zelda|metroid|kirby|donkey|banjo|star-fox|f-zero|paper-|party|goldeneye|smash|earthbound|chrono|advance|emblem|wario|dkc|yoshi|tennis|metal-slug|castlevania|pac-man|tetris|galaga|frogger|contra|megaman|street-fighter|cave-story|descent|duke|dune|wolfenstein|castlewolf|heretic|hexen|quak|unreal|turok|monkey-ball|xrick|rocksndiamonds|bomberman|blobs|obby|parkour|speedrun/.test(s)) return 'retro';
  if (/box|soccer|football|basket|baseball|tennis|golf|pool|snooker|hockey|cricket|badminton|volley|wrestl|thumb|touchdown|bumper|mini-battle|rooftop|olympic|archery|bowl|darts|ball|penalty|kick|tap-tap|basketball|soccer-heads|football-legends|boxing|wrestle|snooker|air-hockey|golf-battle|retro-bowl|touchdowners|bumper-balls|beach-volleyball|badminton-legends|stick-cricket|boxing-stars|pool-party|golf-orbit/.test(s)) return 'sports-action';
  if (/clicker|idle|tycoon|miner|papa|bloon|kingdom|tower|castle|siege|warfare|age-of|duck|learn-to-fly|tabs|paperclip|trimps|candy-box|bearbarian|empire|business|restaurant|shop|hotel|airport|command|defen[cs]e|caesar|colony|anno|freeserf|der-clou|doge-miner|doge|cookie|hexgl|cell-machine|champion|stick-merge|breaking-the-bank|particle|fish|fishing|tiny-fishing/.test(s)) return 'strategy';
  return 'action';
}

async function jget(url, timeout = TIMEOUT) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; } finally { clearTimeout(to); }
}
async function headOk(url, timeout = TIMEOUT) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeout);
  try {
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: UA });
    if (r.status === 405 || r.status === 501) r = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: UA });
    const xfo = (r.headers.get('x-frame-options') || '').toUpperCase();
    const csp = r.headers.get('content-security-policy') || '';
    const fa = csp.split(';').map((s) => s.trim()).find((s) => s.toLowerCase().startsWith('frame-ancestors'));
    const blocked = xfo.includes('DENY') || xfo.includes('SAMEORIGIN') || (!!fa && !/\*/.test(fa));
    return { ok: r.ok && !blocked, status: r.status, len: Number(r.headers.get('content-length') || 0) };
  } catch { return { ok: false, status: 0, len: 0 }; } finally { clearTimeout(to); }
}

const found = new Map(); // slug -> {title, url, kind}
// A. 3kh0
{
  const t = await jget('https://3kh0.github.io/projects.html');
  if (t) {
    for (const m of t.matchAll(/href="(projects\/([A-Za-z0-9][A-Za-z0-9\-_.]*)\/index\.html)"/g)) {
      const slug = slugify(m[2]);
      if (!slug || slug.length > 60) continue;
      found.set(slug, { title: titleOf(slug), url: `https://3kh0.github.io/${m[1]}`, kind: 'iframe' });
    }
  }
  console.log(`3kh0: ${found.size}`);
}
// B. BinBash html5 dirs
{
  const t = await jget('https://api.github.com/repos/BinBashBanana/gfiles/git/trees/master?recursive=1', 30000);
  if (t) {
    try {
      const j = JSON.parse(t);
      const dirs = new Set();
      for (const x of j.tree || []) {
        const m = String(x.path).match(/^gfiles\/html5\/([^/]+)\/index\.html$/);
        if (m) dirs.add(m[1]);
      }
      for (const d of dirs) {
        const slug = slugify(d);
        if (!slug || slug.length > 60 || found.has(slug)) continue;
        found.set(slug, { title: titleOf(slug), url: `https://binbashbanana.github.io/gfiles/html5/${d}/`, kind: 'iframe' });
      }
    } catch {}
  }
  console.log(`total after binbash: ${found.size}`);
}
// C. selenite flasharchive swf
{
  const t = await jget('https://api.github.com/repos/selenite-cc/flasharchive/git/trees/main?recursive=1', 30000);
  if (t) {
    try {
      const j = JSON.parse(t);
      for (const x of j.tree || []) {
        const p = String(x.path);
        if (!/\.swf$/i.test(p) || p.includes('/')) continue;
        const base = p.replace(/\.swf$/i, '');
        const slug = slugify(base);
        if (!slug || slug.length > 60 || found.has(slug)) continue;
        found.set(slug, { title: titleOf(slug), url: `https://cdn.jsdelivr.net/gh/selenite-cc/flasharchive@main/${encodeURIComponent(p)}`, kind: 'ruffle' });
      }
    } catch {}
  }
  console.log(`total after flasharchive: ${found.size}`);
}
// D. sz-games FNF page
{
  const t = await jget('https://sz-games.github.io/FNF.html');
  if (t) {
    let n = 0;
    for (const m of t.matchAll(/href="(\/games\/[A-Za-z0-9][A-Za-z0-9\-_/]*)"/g)) {
      const parts = m[1].split('/').filter(Boolean);
      const slug = slugify(parts[parts.length - 1]);
      if (!slug || slug.length > 60 || found.has(slug)) continue;
      found.set(slug, { title: titleOf(slug), url: `https://sz-games.github.io${m[1]}`, kind: 'iframe' });
      n++;
    }
    console.log(`sz-games adopted=${n}`);
  } else console.log('sz-games: no list page, skipped');
}

// dedupe vs live + dead + tsv + near-dupes
const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
const have = new Set(games.map((g) => g.slug));
const haveTitles = games.map((g) => g.title.toLowerCase());
try { for (const f of readdirSync(join(root, 'iframes', '.dead'))) if (f.endsWith('.html')) have.add(f.replace(/\.html$/, '')); } catch {}
const STOP = new Set(['the', 'a', 'an', 'of', 'and', 's', 'vs']);
function toks(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !STOP.has(w)); }
function nearDupe(title) {
  const a = new Set(toks(title));
  if (!a.size) return false;
  for (const t of haveTitles) {
    const b = new Set(toks(t));
    const small = a.size <= b.size ? a : b, big = a.size <= b.size ? b : a;
    let hit = 0;
    for (const x of small) if (big.has(x)) hit++;
    if (hit / small.size < 1) continue;
    const diff = [...big].filter((x) => !small.has(x)).concat([...small].filter((x) => !big.has(x)));
    if (diff.length && diff.every((x) => /^\d+$/.test(x))) continue;
    return true;
  }
  return false;
}
const cands = [...found.entries()].filter(([slug, g]) => !have.has(slug) && !nearDupe(g.title));
console.log(`candidates after dedupe=${cands.length} (raw=${found.size})`);

// verify
const wins = [];
let ii = 0;
async function worker() {
  while (ii < cands.length) {
    const [slug, g] = cands[ii++];
    const h = await headOk(g.url);
    if (!h.ok) continue;
    if (g.kind === 'ruffle' && h.len > 0 && h.len < 5000) continue;
    wins.push([slug, g]);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`verified wins=${wins.length}`);

function iframeWrapper(slug, title, url, cat, heavy) {
  return `<html>
  <link id="dynamic-favicon" rel="icon" type="image/png" href="resources/download.png">
      <title class="p1">Home | Compass</title>
<!-- gv:slug=${slug} gv:title=${title} gv:category=${cat} gv:heavy=${heavy} -->
     <script>
function applyBrandMode() {
    const mode = localStorage.getItem("brandMode") || "normal";
    const favicon = document.getElementById("dynamic-favicon");

    if (mode === "alt") {
        document.title = "Dashboard";
        favicon.href = "resources/canvas.png?v=1";
    } else {
        document.title = "Home | Compass";
        favicon.href = "resources/download.png?v=1";
    }
}
applyBrandMode();
</script>
  <style type="text/css"> 
        html { overflow: auto; } 
        html, body, div, iframe { margin: 0px; padding: 0px; height: 100%; border: none; } 
        iframe { display: block; width: 100%; border: none; overflow-y: auto; overflow-x: hidden; } 
    </style> 
  <iframe src="${url}" width="100%" height="100%" allowfullscreen frameborder="0"></iframe>
</html>
`;
}
function ruffleWrapper(slug, title, url, cat) {
  return `<html>
<script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
  <link id="dynamic-favicon" rel="icon" href="resources/download.png">
      <title class="p1">Home | Compass</title>
<!-- gv:slug=${slug} gv:title=${title} gv:category=${cat} gv:heavy=false -->
     <script>
function applyBrandMode() {
    const mode = localStorage.getItem("brandMode") || "normal";
    const favicon = document.getElementById("dynamic-favicon");

    if (mode === "alt") {
        document.title = "Dashboard";
        favicon.href = "resources/canvas.png?v=1";
    } else {
        document.title = "Home | Compass";
        favicon.href = "resources/download.png?v=1";
    }
}
applyBrandMode();
</script>
  <style type="text/css"> 
        html { overflow: auto; background-color: #2D4D4F; } 
        html, body, div, embed { margin: 0px; padding: 0px; height: 100%; border: #2D4D4F; background-color: #2D4D4F; } 
        embed { display: block; width: 100%; border: #2D4D4F; overflow-y: auto; overflow-x: hidden; } 
    </style> 
<embed src="${url}" width="100%" height="100%">
</html>
`;
}

const tsvSlugs = new Set(readFileSync(join(root, 'data', 'sources.tsv'), 'utf8').split('\n').slice(1).map((l) => (l.split('\t')[0] || '').trim()).filter(Boolean));
let added = 0;
const rows = [];
for (const [slug, g] of wins) {
  const p = join(iframesDir, `${slug}.html`);
  if (existsSync(p) || existsSync(join(deadDir, `${slug}.html`))) continue;
  const cat = catOf(slug, g.title);
  if (g.kind === 'ruffle') {
    writeFileSync(p, ruffleWrapper(slug, g.title, g.url, cat));
    if (!tsvSlugs.has(slug)) rows.push(`${slug}\t${g.title}\t${g.url}\t${cat}\truffle\tfalse`);
  } else {
    writeFileSync(p, iframeWrapper(slug, g.title, g.url, cat, 'false'));
    if (!tsvSlugs.has(slug)) rows.push(`${slug}\t${g.title}\t${g.url}\t${cat}\tiframe\tfalse`);
  }
  tsvSlugs.add(slug);
  added++;
}
if (rows.length) appendFileSync(join(root, 'data', 'sources.tsv'), rows.join('\n') + '\n');
console.log(`wave-bulk2: added=${added}`);
