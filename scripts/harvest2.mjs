import { readFileSync, writeFileSync, appendFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const deadDir = join(iframesDir, '.dead');
mkdirSync(deadDir, { recursive: true });
const TIMEOUT = 15000;

async function getText(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { redirect: 'follow', signal: ctrl.signal });
    if (!r.ok) return '';
    return await r.text();
  } catch { return ''; } finally { clearTimeout(to); }
}
function slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function titleOf(slug) { return slug.split('-').map((w) => /^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' '); }
function inferCat(s) {
  s = s.toLowerCase();
  if (/fnaf|fnae|fnac|granny|baldi|buckshot|slend|eyes|meat|ice-scream|piggy|puppet|corpse|mad-father|witchs|ao-oni|dead-plate|milk|yume|bendy|amanda|banban|poppy|rainbow|doors|pressure|forsaken|fears|window|backrooms|exit-8|mouthwashing|kindergarten|hello-neighbor|friendly|andys|dandys|night-security|crooked|zombie|horror|scary|haunted|slender|freddy|mutilate|exorcist|nun|grudge|momo|shrek|amanda|garden-of/.test(s)) return 'horror';
  if (/(^|\-)io($|\-)|openfront|repuls|kirka|kour|hordes|goons|florr|taming|venge|bonk|mope|krunker|shockers|diep|arras|slither|agar|hole|paper|splix|defly|evowars|worm|starblast|zombs|surviv|miniroyale|tetr|gartic|warfront|frontwars|stumble|fall-guys/.test(s)) return 'io';
  if (/slope|moto|drive|drift|madalin|parking|bike|trial|stunt|rac|car|kart|run|tunnel|subway|temple|ski|snow|surf|rolling|traffic|rider|derby|burnout|hill-climb|outrun|road|speed|f1|formula|nascar|truck|bus|taxi|monster|demolition|bridge|tow|police|chase/.test(s)) return 'racing';
  if (/fnf|friday|osu|melody|beat|danc|rhythm|guitar|ddr|geometry|jsab|sprunki|piano|drum|heaven|popstar|music/.test(s)) return 'rhythm-action';
  if (/minecraft|eagler|voxel|sandbox|melon|grindcraft|powder|townscaper|worldbox|alchemy|terraria|raft|slime|r sim|goat|powerwash|farm|farming|city-build|planet|settlement/.test(s)) return 'sandbox';
  if (/pokemon|mario|sonic|zelda|metroid|kirby|donkey|banjo|star-fox|f-zero|paper-|party|goldeneye|smash|earthbound|chrono|advance|emblem|wario|dkc|yoshi|mario-tennis|metal-slug|castlevania|pac-man|tetris|galaga|donkey|frogger|contra|megaman|street-fighter/.test(s)) return 'retro';
  if (/box|soccer|football|basket|baseball|tennis|golf|pool|snooker|hockey|cricket|badminton|volley|wrestl|thumb|touchdown|bumper|mini-battle|rooftop|olympic|archery|bowl|darts|wwe|ball/.test(s) && !/ball-sort|balls|red-ball|ball-surfer|slope-ball/.test(s)) return 'sports-action';
  if (/clicker|idle|tycoon|miner|papa|bloon|kingdom|tower|castle|siege|warfare|age-of|duck|learn-to-fly|tabs|paperclip|trimps|candy-box|bearbarian|empire|colon|business|restaurant|shop|hotel|airport|harbor|war-|battle-|army|command|defen[cs]e|td-|tdc/.test(s)) return 'strategy';
  if (/stick|vex|fancy|raze|strike|sift|plazma|gun|territory|masked|war-|soldier|army|sniper|shoot|strike|zombie-out|ninja|samurai|pirate|cowboy|robot|alien|space-|warrior|hero|battle|fight|kong|dinosaur|dragon/.test(s)) return 'action';
  if (/cuphead|goose|quake|doom|diablo|wolfenstein|hotline|karlson|getting-over|only-up|adam|tasty|undertale|celeste|deltarune|pizza|portal|half-life|omori|oneshot|stars|madriguera|void|wilds|firewatch|stray|subnautica|nightmares|quest|adventure|escape|prison|jailbreak|robber|thief|heist|steal|bob-|snail|wheely|adam|eve|jacksmith|hammer|kingdom/.test(s)) return 'adventure';
  return 'puzzle';
}

const found = new Map(); // slug -> {title, url, cat}
function add(slug, url) {
  slug = slugify(slug);
  if (!slug || slug.length > 60 || found.has(slug)) return;
  found.set(slug, { title: titleOf(slug), url, cat: inferCat(slug) });
}

// A. coolubg.github.io sitemap (?slug catalog)
{
  const xml = await getText('https://coolubg.github.io/sitemap.xml');
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1].trim());
  let n = 0;
  for (const loc of locs) {
    const m = loc.match(/[?&]([a-z0-9][a-z0-9\-]*)\s*$/i);
    if (!m) continue;
    add(m[1], loc.split('#')[0]);
    n++;
  }
  console.log(`coolubg: locs=${locs.length} adopted=${n}`);
}

// B. ubg89 / ubg98 / ubg365 category pages -> *-unblocked.html links
for (const host of ['ubg89.github.io', 'ubg98.github.io', 'ubg365.github.io']) {
  const idx = await getText(`https://${host}/`);
  const catHrefs = [...idx.matchAll(/href="([^"#?]+)"/gi)].map((m) => m[1]).filter((h) => /games\.html?$/i.test(h));
  const cats = [...new Set(catHrefs)];
  let n = 0;
  for (const c of cats) {
    const page = await getText(new URL(c, `https://${host}/`).href);
    const links = [...page.matchAll(/href="([^"#?]+)"/gi)].map((m) => m[1]);
    for (const l of links) {
      const mm = l.match(/([A-Za-z0-9][A-Za-z0-9\-_.]*)-unblockedz?\.html?$/i);
      if (!mm) continue;
      try {
        const abs = new URL(l, `https://${host}/`).href;
        if (!abs.includes(host)) continue;
        const before = found.size;
        add(mm[1], abs.split('?')[0].split('#')[0]);
        if (found.size > before) n++;
      } catch {}
    }
  }
  console.log(`${host}: cats=${cats.length} adopted=${n}`);
}

// C. classroom6x /go/ listing
{
  const go = await getText('https://classroom6x.github.io/go/');
  const links = [...go.matchAll(/href="([^"#?]+)"/gi)].map((m) => m[1]);
  let n = 0;
  for (const l of links) {
    const seg = l.split('/').filter(Boolean).pop();
    if (!seg || /\./.test(seg)) continue;
    try {
      const abs = new URL(l, 'https://classroom6x.github.io/go/').href;
      const before = found.size;
      add(seg, abs);
      if (found.size > before) n++;
    } catch {}
  }
  console.log(`classroom6x-go: adopted=${n}`);
}
console.log(`harvest2: unique games=${found.size}`);

function wrapperFor({ slug, title, url, category, heavy }) {
  return `<html>
  <link id="dynamic-favicon" rel="icon" type="image/png" href="resources/download.png">
      <title class="p1">Home | Compass</title>
<!-- gv:slug=${slug} gv:title=${title} gv:category=${category} gv:heavy=${heavy} -->
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

// Run on page load
applyBrandMode();
</script>
  
  <style type="text/css"> 
        html { 
            overflow: auto; 
        } 
          
        html, 
        body, 
        div, 
        iframe { 
            margin: 0px; 
            padding: 0px; 
            height: 100%; 
            border: none; 
        } 
          
        iframe { 
            display: block; 
            width: 100%; 
            border: none; 
            overflow-y: auto; 
            overflow-x: hidden; 
        } 
    </style> 
  <iframe src="${url}" width="100%" height="100%" allowfullscreen frameborder="0"></iframe>
</html>
`;
}

const tsvSlugs = new Set(readFileSync(join(root, 'data', 'sources.tsv'), 'utf8').split('\n').slice(1).map((l) => (l.split('\t')[0] || '').trim()).filter(Boolean));
let restored = 0, created = 0;
const rows = [];
for (const [slug, g] of found) {
  const livePath = join(iframesDir, `${slug}.html`);
  const deadPath = join(deadDir, `${slug}.html`);
  if (existsSync(livePath)) continue;
  const heavy = /webport|web$|64|mania|doors|banban|poppy|kindergarten|amanda|granny|baldi|hello|piggy|fnaf|fnac|bendy|cuphead|goose|quake|doom|terraria|raft|slime|only-up|crab|lethal|stray|subnautica|mutilate|exorcist/i.test(slug) ? 'true' : 'false';
  if (existsSync(deadPath)) { try { renameSync(deadPath, livePath); } catch { continue; } restored++; }
  else created++;
  writeFileSync(livePath, wrapperFor({ slug, title: g.title, url: g.url, category: g.cat, heavy }));
  if (!tsvSlugs.has(slug)) { rows.push(`${slug}\t${g.title}\t${g.url}\t${g.cat}\tiframe\t${heavy}`); tsvSlugs.add(slug); }
}
if (rows.length) appendFileSync(join(root, 'data', 'sources.tsv'), rows.join('\n') + '\n');
console.log(`harvest2-apply: restored=${restored} created=${created} tsv-rows-added=${rows.length}`);
