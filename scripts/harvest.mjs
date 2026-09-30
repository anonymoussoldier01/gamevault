import { readFileSync, writeFileSync, appendFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const deadDir = join(iframesDir, '.dead');
mkdirSync(deadDir, { recursive: true });
const TIMEOUT = 15000;

const HOSTS = ['ubg89.github.io','ubg98.github.io','ubg365.github.io','classroom6x.github.io','gn-math.github.io','htmlxm.github.io','coolubg2.github.io','23azostore.github.io','lekug.github.io','class-76.github.io','1kh0.github.io','harshulsilverspoon.github.io','harshulgoon.github.io','harshulmoon.github.io'];

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
function titleOf(slug) {
  return slug.split('-').map((w) => /^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function inferCat(slug) {
  const s = slug.toLowerCase();
  if (/fnaf|fnae|fnac|granny|baldi|buckshot|slend|eyes-horror|mr-meat|ice-scream|piggy|puppet|corpse|mad-father|witchs|ao-oni|ib-webport|dead-plate|milk-bag|yume|bendy|amanda| Garten|banban|poppy|rainbow-friends|doors|pressure|forsaken|fears|man-from-window|backrooms|exit-8|mouthwashing|kindergarten|hello-neighbor|my-friendly|andys|dandys|morgue|interim|night-security|crooked|zombie|dead|horror|scary|haunted|slender/.test(s)) return 'horror';
  if (/(^|\-)io($|\-)|openfront|repuls|kirka|kour|krews?|hordes|goons|florr|taming|venge|bonk|mope|krunker|shell-shockers|diep|arras|slither|agar|hole|paper|splix|defly|evowars|worm|starblast|zombs|surviv|miniroyale|tetr|gartic|warfront|frontwars/.test(s)) return 'io';
  if (/slope|moto|drive|drift|madalin|parking|bike|trials|stunt|race|racing|car| slope|run-|tunnel|subway|temple|ski|snow|ball-surfer|rolling|traffic|rider|derby|burnout|hill-climb|out-run|road-fighter|top-speed|f1-|excitebike|wave-race|diddy-kong/.test(s)) return 'racing';
  if (/fnf|friday|osu|melody|beat|dance|rhythm|guitar|ddr|geometry|jsab|sprunki|heaven/.test(s)) return 'rhythm-action';
  if (/minecraft|eaglercraft|sandboxels|melon-playground|grindcraft|powder|townscaper|worldbox|little-alchemy| Terraria|raft|slime-rancher|goat|powerwash|animal-crossing/.test(s)) return 'sandbox';
  if (/pokemon|mario|sonic|zelda|metroid|kirby|donkey|banjo|star-fox|f-zero|paper-mario|mario-party|goldeneye|smash|earthbound|chrono|advance-wars|fire-emblem|wario|dkc|yoshi|dr-mario|tetris|wave-race|excitebike|1080|mario-tennis|mario-kart|metal-slug|castlevania/.test(s)) return 'retro';
  if (/boxing|s soccer|football|basket|baseball|tennis|golf|pool|snooker|hockey|cricket|badminton|volley|wrestl|thumb-fighter|touchdown|bumper|12-mini|rooftop|get-on-top/.test(s)) return 'sports-action';
  if (/clicker|idle|tycoon|miner|papas|bloons|kingdom|tower-defense|crush-the-castle|siege|warfare|age-of|duck-life|learn-to-fly|tabs|corbin|universal-paperclips|trimps|candy-box|bearbarians|castle|ducklife|pizzeria|burgeria|freezeria|sushiria/.test(s)) return 'strategy';
  if (/cuphead|goose|quake|doom|diablo|wolfenstein|hotline|karlson|getting-over|only-up|adam-and-eve|dune|tasty|undertale|celeste|deltarune|pizza-tower|portal|half-life|omori|oneshot|fears|in-stars|madriguera|void|outer-wilds|firewatch|stray|subnautica|exit-8|little-nightmares|granny|hello/.test(s)) return 'adventure';
  if (/vex|fancy-pants|stickman|stick-war|raze|strike-force|boxhead|electric-man|sift|plazma|gunblood|gun-mayhem|territory|masked|raft-wars|crab-game|lethal|content-warning|schedule-1|shooter|combat|stick-fighter|duel|arrow|rainbow|mr-racer/.test(s)) return 'action';
  return 'puzzle';
}

const SKIP_SEG = new Set(['category','categories','search','about','contact','privacy','dmca','terms','tags','tag','all','new','hot','top','popular','index','home','play','game','games','assets','static','icons','ports','resources','go','sitemap','sitemap.xml','robots.txt']);

const found = new Map(); // slug -> {title, url, cat}
for (const host of HOSTS) {
  const xml = await getText(`https://${host}/sitemap.xml`);
  if (!xml) { console.log(`${host}: no sitemap`); continue; }
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1].trim());
  let n = 0;
  for (const loc of locs) {
    let u;
    try { u = new URL(loc); } catch { continue; }
    if (u.hostname !== host) continue;
    const segs = u.pathname.split('/').filter(Boolean);
    if (!segs.length) continue;
    const last = segs[segs.length - 1];
    let slug = '';
    if (/\.html?$/i.test(last)) slug = slugify(last.replace(/\.html?$/i, '').replace(/-unblockedz?$/i, '').replace(/-unblocked$/i, ''));
    else if (segs[0] === 'go' && segs[1]) slug = slugify(segs[1]);
    else if (segs.length === 1) slug = slugify(last);
    else continue;
    if (!slug || SKIP_SEG.has(slug) || slug.length > 60) continue;
    if (!found.has(slug)) {
      found.set(slug, { title: titleOf(slug), url: loc.split('?')[0].split('#')[0], cat: inferCat(slug) });
      n++;
    }
  }
  console.log(`${host}: sitemap locs=${locs.length} games-adopted=${n}`);
}
console.log(`harvest: unique games=${found.size}`);

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
  if (existsSync(livePath)) continue; // already live, keep curated URL
  const heavy = /webport|64-web|mania|doors|banban|poppy|kindergarten|amanda|granny|baldi|hello|piggy|fnaf|fnac|bendy|cuphead|goose|quake|doom|terraria|raft|slime|only-up|crab-game|lethal|stray|subnautica/i.test(slug) ? 'true' : 'false';
  if (existsSync(deadPath)) {
    try { renameSync(deadPath, livePath); } catch { continue; }
    writeFileSync(livePath, wrapperFor({ slug, title: g.title, url: g.url, category: g.cat, heavy }));
    restored++;
  } else {
    writeFileSync(livePath, wrapperFor({ slug, title: g.title, url: g.url, category: g.cat, heavy }));
    created++;
  }
  if (!tsvSlugs.has(slug)) { rows.push(`${slug}\t${g.title}\t${g.url}\t${g.cat}\tiframe\t${heavy}`); tsvSlugs.add(slug); }
}
if (rows.length) appendFileSync(join(root, 'data', 'sources.tsv'), rows.join('\n') + '\n');
console.log(`harvest-apply: restored=${restored} created=${created} tsv-rows-added=${rows.length}`);
