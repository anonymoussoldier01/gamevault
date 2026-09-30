import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const outDir = join(root, 'data');
const portsDir = join(root, 'public', 'ports');
const iconsDir = join(root, 'public', 'icons');

mkdirSync(outDir, { recursive: true });
mkdirSync(portsDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });

// Optional harvested thumbnails (data/thumbs.json: {slug: "/thumbs/slug.ext"}) merged into games.json
let THUMBS = {};
try { THUMBS = JSON.parse(readFileSync(join(root, 'data', 'thumbs.json'), 'utf8')); } catch {}

// Copy cloak icons + all inner port files for relative embeds
try {
  if (existsSync(join(iframesDir, 'resources', 'download.png')))
    copyFileSync(join(iframesDir, 'resources', 'download.png'), join(iconsDir, 'vault.png'));
  if (existsSync(join(iframesDir, 'resources', 'canvas.png')))
    copyFileSync(join(iframesDir, 'resources', 'canvas.png'), join(iconsDir, 'canvas.png'));
} catch {}
for (const f of readdirSync(iframesDir)) {
  if (f.endsWith('iframe.html')) {
    try { copyFileSync(join(iframesDir, f), join(portsDir, f)); } catch {}
  }
}

const TITLE_OVERRIDES = {
  '5b': '5B', fnaf1: 'FNAF 1', fnaf2: 'FNAF 2', fnaf3: 'FNAF 3', fnaf4: 'FNAF 4',
  fnafps: 'FNAF Pizzeria Simulator', fnafsl: 'FNAF Sister Location', fnafucn: 'FNAF Ultimate Custom Night',
  fnae: 'FNAE', fnf: 'Friday Night Funkin', btd4: 'Bloons TD 4', btd5: 'Bloons TD 5',
  adgac: 'A Difficult Game About Climbing', polytrackw_d: 'PolyTrack 0.5', motox3m: 'Moto X3M',
  la2: 'Little Alchemy 2', ddlc: 'Doki Doki Literature Club', pvz: 'Plants vs Zombies', pvz2: 'Plants vs Zombies 2',
  gtachina: 'GTA Chinatown', eaglercraft: 'Minecraft (Eaglercraft)', totm: 'Tears of the Moon',
  ucn: 'Ultimate Custom Night', subway: 'Subway Surfers', slope: 'Slope', retrobowl: 'Retro Bowl',
  polytrack: 'PolyTrack', run3: 'Run 3', tunnel: 'Tunnel Rush', spacewaves: 'Space Waves',
  snowrider: 'Snow Rider', drivemad: 'Drive Mad', eggycar: 'Eggy Car', crossyroads: 'Crossy Road',
  geometrydash: 'Geometry Dash', minecraft: 'Minecraft', doom: 'Doom', portal: 'Portal', halflife: 'Half-Life',
};

function prettify(slug) {
  if (TITLE_OVERRIDES[slug]) return TITLE_OVERRIDES[slug];
  let s = slug.replace(/[_+]+/g, ' ').replace(/-/g, ' ');
  s = s.replace(/([a-z])([0-9])/g, '$1 $2');
  return s.split(' ').filter(Boolean).map((w) => {
    if (/^[0-9]+$/.test(w)) return w;
    if (w.length <= 3 && /^[a-z]+$/.test(w) && ['io', 'ds', 'gba', 'nd', 'sw'].includes(w)) return w.toUpperCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

function inferCategory(slug, src) {
  const s = slug.toLowerCase();
  const url = (src || '').toLowerCase();
  if (/fnaf|fnae|granny|baldi|buckshot|miside|miiside|helltaker|ihavenomouth|omori|fearandhunger|dead|horror|granny|batim|frickbears|notmyneighbour/.test(s)) return 'horror';
  if (/pokemon|mario|mariokart|metalslug|sonic|smash|stardew/.test(s)) return 'retro';
  if (/slope|polytrack|motox3m|drivemad|eggy|hoverracer|snowrider|spacewaves|tunnel|gswitch|operius|retrobowl|rocketleague|subway|run3|crossyroad|cluster|rider|drive-mad|fred|happywheels/.test(s)) return 'racing';
  if (/fireboy|bloxorz|baba|stacktris|statetris|breaklock|breakout|suika|shapez|particleclicker|dice|nubby|cloverpit|balatro|inscryption|papersplease|jacksmith|minimetro/.test(s)) return 'puzzle';
  if (/minecraft|eaglercraft|worldbox|grindcraft|peopleplayground|repo|stardew|terraria|dome/.test(s)) return 'sandbox';
  if (/fnaf|fnf|osu|geometrydash|helltaker|ultrakill|yomihustle|shogunshowdown|vampire/.test(s)) return 'rhythm-action';
  if (/boxingrandom|soccerrandom|volleyrandom|basket|baseball|tag|soccer|basketbros|basketstars|blumgiball|gobdun|gunmayhem|getaway|frontwars|gladihoppers|ragdoll/.test(s)) return 'sports-action';
  if (/ducklife|learntofly|earntodie|ageofwar|btd|tower|defense|frontwars|finalearth|adventurecapitalist|bitlife|burgeria|freezeria|hotdoggeria|pizzeria|sushiria/.test(s)) return 'strategy';
  if (/undertale|deltarune|omori|oneshot|ddlc|classof09|badtime|crueltysquad|lobotomy|sideeffects|pizzatower|celeste|hollowknight|silksong|portal|halflife|doom|isaac|plague|dungeonsgambler|feedthevoid|adarkroom|5b|antimatter/.test(s)) return 'adventure';
  if (/(^|\-)io($|\-)|frontwars|warfront/.test(s)) return 'io';
  return 'action';
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

const files = readdirSync(iframesDir).filter((f) => f.endsWith('.html') && !f.endsWith('iframe.html')).sort();
const games = [];
const seen = new Set();

for (const file of files) {
  const slug = basename(file, '.html');
  if (seen.has(slug)) continue;
  seen.add(slug);
  const raw = readFileSync(join(iframesDir, file), 'utf8');

  let src = null;
  let kind = 'iframe';
  const mIframe = raw.match(/<iframe[^>]*src="([^"]+)"/i);
  const mEmbed = raw.match(/<embed[^>]*src="([^"]+)"/i);
  const mEjs = raw.match(/EJS_gameUrl\s*=\s*"([^"]+)"/);
  const mBase = raw.match(/<base\s+href="([^"]+)"/i);

  if (mIframe) src = mIframe[1].trim();
  else if (mEmbed) { src = mEmbed[1].trim(); kind = raw.includes('ruffle') || src.endsWith('.swf') ? 'ruffle' : 'embed'; }
  else if (mEjs) { src = mEjs[1].trim(); kind = 'ejs'; }

  // Resolve relative / broken refs to local /ports/
  if (src && !/^https?:\/\//i.test(src)) {
    if (src === 'adgac.html') src = '/ports/adgaciframe.html';
    else if (/miisideiframe/i.test(src)) src = '/ports/miisideiframe.html';
    else if (src.endsWith('.html')) src = '/ports/' + basename(src);
    else if (!src.startsWith('/')) src = 'https://' + src;
  }
  // Fix known typo: missing protocol
  if (src && /^harshulsilverspoon\.github\.io/i.test(src)) src = 'https://' + src;

  // Fallback to base href for Unity/Godot ports referenced indirectly
  if (!src && mBase) { src = mBase[1]; kind = 'port'; }

  if (!src) continue;

  const h = hashStr(slug);
  const plays = 800000 + (h % 6700000);
  const rating = (4.4 + ((h % 60) / 100)).toFixed(1);

  const category = (raw.match(/gv:category=([A-Za-z0-9-]+)/) || [])[1] || inferCategory(slug, src);
  const gvTitle = (raw.match(/gv:title=(.+?)\s+gv:category=/) || [])[1];
  const gvHeavy = (raw.match(/gv:heavy=(true|false)/) || [])[1];
  const title = (gvTitle || '').trim() || prettify(slug);  const heavy = gvHeavy !== undefined ? gvHeavy === 'true' : (/grannyiframe|adgaciframe|buckshot|helltaker|omoriiframe|notmyneighbour|undertaleyellow|miside|miiside|stardewiframe|ultrakill|hollowknight/i.test(src) || /granny|adgac|buckshot|helltaker|omori|neighbour|undertaleyellow|miside|stardew|ultrakill/i.test(slug));
  const isNew = /cloverpit|crazycattle|shogunshowdown|nubby|sideeffects|yomihustle|vampire|silksong/i.test(slug);

  const TAG_STOP = new Set(['the', 'a', 'an', 'of', 'and', 'with', 's', 'vs', 'web', 'game', 'full', 'free', 'play', 'new', 'best', 'top', '2', '3', 'ii', 'hd', '3d', '2d']);
  const tags = [category];
  for (const w of title.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length >= 4 && !TAG_STOP.has(w) && !tags.includes(w)) tags.push(w);
    if (tags.length >= 7) break;
  }
  if (kind === 'ruffle') tags.push('flash');
  if (mEjs) tags.push('emulator');
  if (heavy) tags.push('heavy');
  if (/2-player|2 player|multiplayer/i.test(title)) tags.push('multiplayer');

  games.push({
    slug,
    title,
    iframeUrl: src,
    category,
    tags,
    thumb: THUMBS[slug],
    kind: mEjs ? 'ejs' : kind === 'ruffle' ? 'ruffle' : heavy && src.startsWith('/ports/') ? 'port' : 'iframe',
    ejsCore: mEjs ? (/melonds/i.test(raw) ? 'melonds' : /gba/i.test(raw) || /pokemonfr|pokemonem/i.test(slug) ? 'gba' : 'nes') : undefined,
    ejsGameUrl: mEjs ? src : undefined,
    swfUrl: kind === 'ruffle' ? src : undefined,
    heavy: Boolean(heavy),
    isNew: Boolean(isNew),
    plays,
    rating: Number(rating),
    description: `${title} — play free instantly in your browser on GameVault. No download, no login.`,
  });
}

// Featured first for hero
const FEATURED = ['subway', 'slope', 'minecraft', 'buckshot', 'polytrack', 'retrobowl', 'fnaf1', 'geometrydash', 'motox3m', 'eaglercraft'];
games.sort((a, b) => {
  const ai = FEATURED.indexOf(a.slug);
  const bi = FEATURED.indexOf(b.slug);
  if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  return b.plays - a.plays;
});

writeFileSync(join(outDir, 'games.json'), JSON.stringify(games, null, 2));
console.log(`GameVault: wrote ${games.length} games -> data/games.json, ports copied to public/ports/`);
