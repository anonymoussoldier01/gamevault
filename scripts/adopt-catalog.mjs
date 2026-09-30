import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const deadDir = join(iframesDir, '.dead');
mkdirSync(deadDir, { recursive: true });

function inferCat(s) {
  s = s.toLowerCase();
  if (/fnaf|fnae|fnac|freddy|granny|baldi|buckshot|slend|horror|scary|haunted|bendy|amanda|banban|poppy|rainbow|doors|pressure|fears|window|backrooms|exit|mouthwashing|kindergarten|hello-neighbor|friendly|andys|night-security|crooked|zombie|bad-parenting|dead|blood|tattletail|schoolboy|yandere|precinct|mutilate|exorcist|nun|momo|shrek|neuro|look-outside|saihate|miside|touhou|witch|ib-|mad-father|corpse|ao-oni|milk|yume|deadseat|donot|donottakethis/.test(s)) return 'horror';
  if (/(^|\-)io($|\-)|openfront|repuls|kirka|kour|hordes|goons|florr|taming|venge|bonk|mope|krunker|shockers|diep|arras|slither|agar|hole|paper|splix|defly|evowars|worm|starblast|zombs|surviv|miniroyale|tetr|gartic|warfront|frontwars|stumble|taming|apes-vs-helium|fused/.test(s)) return 'io';
  if (/slope|moto|drive|drift|madalin|parking|bike|trial|stunt|rac|kart|tunnel|subway|temple|ski|snow|surf|rolling|traffic|rider|derby|burnout|hill-climb|outrun|road|speed|f1|formula|nascar|truck|bus|taxi|monster|demolition|tow|police|chase|traffic-racer|running-fred|marbles|drift-hunters/.test(s)) return 'racing';
  if (/fnf|friday|osu|melody|beat|danc|rhythm|guitar|ddr|geometry|jsab|sprunki|piano|drum|heaven|popstar|music|beatblock|beat-banger|fused/.test(s) && !/beat-em/.test(s)) return 'rhythm-action';
  if (/minecraft|eagler|voxel|sandbox|melon|grindcraft|powder|townscaper|worldbox|alchemy|terraria|raft|slime|goat|powerwash|farm|city-build|planet|settlement|web-fishing|catchaware|fungiman|egg-fried/.test(s)) return 'sandbox';
  if (/pokemon|mario|sonic|zelda|metroid|kirby|donkey|banjo|star-fox|f-zero|paper-|party|goldeneye|smash|earthbound|chrono|advance|emblem|wario|dkc|yoshi|tennis|metal-slug|castlevania|pac-man|tetris|galaga|frogger|contra|megaman|street-fighter|cave-story|descent|duke|dune|wolfenstein|castlewolf|heretic|hexen|blood|nam-|redneck|quak|unreal|ww2|turok|namco|monkey-ball|xrick|rocksndiamonds|cjdg/i.test(s)) return 'retro';
  if (/box|soccer|football|basket|baseball|tennis|golf|pool|snooker|hockey|cricket|badminton|volley|wrestl|thumb|touchdown|bumper|mini-battle|rooftop|olympic|archery|bowl|darts|ball|blobby|volley/.test(s)) return 'sports-action';
  if (/clicker|idle|tycoon|miner|papa|bloon|kingdom|tower|castle|siege|warfare|age-of|duck|learn-to-fly|tabs|paperclip|trimps|candy-box|bearbarian|empire|business|restaurant|shop|hotel|airport|command|defen[cs]e|caesar|anno|freeserf|freesiege|der-clou|anthem|colony|apotheon|arco/.test(s)) return 'strategy';
  if (/cuphead|goose|quake|doom|diablo|fallout|wolfenstein|hotline|karlson|getting-over|only-up|adam|tasty|undertale|celeste|deltarune|pizza|portal|half-life|half-life-2|omori|oneshot|stars|madriguera|void|wilds|firewatch|stray|subnautica|nightmares|quest|adventure|escape|prison|robber|heist|steal|bob-|snail|wheely|eve|jacksmith|anton|antonblast|brotato|fallout|gta|vice-city|dude-simulator|my-friend|alien-hominid|abobo|johnny-upgrade|cut-the-rope|superhot|super-mario|tanuki|battle-ships|motherload|there-is-no|recoil|zuma|neverball|gravitee|army-of-ages|awesome|zombie-out|ninja|pirate|tomb|riddle|helicopter|hextris|emulatrix|powerpuff|dummy|toy-defense|mr-bullet|level|pvz|ihan|statetris|guestbook|cactus|shellshock|hotdog|tri-peaks|block-blast|merge-melon|rabbit|n-gon|mirrors-edge|burger-run|drivemad|wheely|burgeria|snow-rider|little-alchemy|monkey-mart|isaac|shogunshowdown|iron-snout|marbles-sorting|dead-again|stack|college|robber|inscryption|shootout|pancakeria|bloxorz|drift-boss|pizzatower|raft-wars|champs|minesweeper|pokemonfr|run|vex|stickman|basketbros|quak|geometry-jump|funkin|car-rush|adarkroom|restaurants|asteroids|player-pack|sandtris|ruffle|fnafucn|grindcraft|sushiria|snailbob|among-us|talking-hippo|tube-jumpers|hollowknight|pudding|need-for-speed|time-shooter|stars-and-time|bottle-flip|osu-full|rope-time|breakout|corbin|ball-sort|johnny|abobos|appel|fireboy|timeshooter|taking-shape|taco-mia|btd4|moto-x3m-winter|openttd|cubefield|sideeffects|swords|castle-defense|tower-defense-4|crazy-frog|football-strike|rocketleague|pentashift|adam-and-eve|impossible-quiz|penalty-kick|sushiria|firered|gunblood|bubble-shooter|tap-tap|mario-flash|blumgi|celeste-classic|duck-life|emerald|undertale|bomb-it|silksong|santa-run|slayone|g-switch|fnaf|ovo|parking-fury|learntofly2|traffic-tom|5b|soccer-random|final-earth|ducklife|learn-to-fly|happywheels|recoil|color-match|gun-mayhem|shapez|apple-shooter|rooftop|ducklife4|osu|vex|tunnel|duck-life-3|pool-party|ragdollarcher|icy-purple|hardest-game|moto-x3m|a-dark-room/.test(s)) return 'adventure';
  if (/stick|vex|fancy|raze|strike|sift|plazma|gun|territory|masked|soldier|sniper|shoot|ninja|samurai|pirate|cowboy|robot|alien|space|warrior|hero|fight|kong|dinosaur|dragon|war-|battle|combat|assassin|boxhead|electric-man|sift-heads|plaza|gunblood|mayhem|masked|raft-wars|crab-game|lethal|content-warning|schedule|shooter|combat|fighter|duel|arrow|rainbow|mr-racer|getting-over|counter-strike|counter|strike-force|endless-war|dead-zed|warfare-19|territory-war|zombie-hunters|masked-forces|krunt|shooterz|squid-game|stackball|crazysteve|beachball|nitrodrift|flyordie|shootem|catmouse|watr|oreshk|teambudd|waterguns|relmz|combatzone|blastz|ninjar|junglz|limax|frogar|gota|gobattle|hexanaut|driftin|karnage|krew|starve|deeeep|devast|digdig|drednot|lordz|moomoo|poxel|slay|slowroads|openfront|narwhale|mk48|minesweep|miniroyale|powerline|raaaft|raidland|skyroyale|zlap|wormate|wormax|battledudes|brutmania|nightpoint|knight-arena|agar-io|slither-io|paper-io|hole-io|krunker-io|shell-shockers|smash-karts|skribbl|wings-io|zombsroyale|surviv-io|taming-io|venge-io|lol-1v1|starve-io|florr-io|frogar-io|hexanaut-io|karnage-io|kirka-io|kour-io|limax-io|lordz-io|powerline-io|poxel-io|repuls-io|skyroyale-io|slay-one|slowroads-io|splix-io|starblast-io|zlap-io|evowars-io|defly-io|gartic-io|tetr-io|krunt-io|shooterz-io|squid-game-io|stackball-io|crazysteve-io|beachball-io|nitrodrift-io|flyordie-io|shootem-io|catmouse-io|watr-io|oreshk-io|teambudd-io|waterguns-io|relmz-io|combatzone-io|blasterz-io|ninjar-io|junglz-io/.test(s)) return 'action';
  return 'puzzle';
}

function wrapperFor(slug, title, url, category, heavy) {
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
        html { overflow: auto; } 
        html, body, div, iframe { margin: 0px; padding: 0px; height: 100%; border: none; } 
        iframe { display: block; width: 100%; border: none; overflow-y: auto; overflow-x: hidden; } 
    </style> 
  <iframe src="${url}" width="100%" height="100%" allowfullscreen frameborder="0"></iframe>
</html>
`;
}

const wins = JSON.parse(readFileSync(join(root, 'data', 'catalog-wins.json'), 'utf8'));
const tsvSlugs = new Set(readFileSync(join(root, 'data', 'sources.tsv'), 'utf8').split('\n').slice(1).map((l) => (l.split('\t')[0] || '').trim()).filter(Boolean));
let added = 0;
const rows = [];
for (const w of wins) {
  const livePath = join(iframesDir, `${w.slug}.html`);
  if (existsSync(livePath) || existsSync(join(deadDir, `${w.slug}.html`))) continue;
  const cat = inferCat(w.slug + ' ' + w.title);
  const heavy = w.heavy ? 'true' : (/unity|webgl|emscripten|wasm/i.test(w.url) ? 'true' : 'false');
  writeFileSync(livePath, wrapperFor(w.slug, w.title, w.url, cat, heavy));
  if (!tsvSlugs.has(w.slug)) { rows.push(`${w.slug}\t${w.title}\t${w.url}\t${cat}\tiframe\t${heavy}`); tsvSlugs.add(w.slug); }
  added++;
}
if (rows.length) appendFileSync(join(root, 'data', 'sources.tsv'), rows.join('\n') + '\n');

// cuphead: fake-green card quarantined with logged reason
const log = JSON.parse(readFileSync(join(root, 'data', 'remap-report.json'), 'utf8').catch?.() || '{}');
const qlogPath = join(root, 'data', 'quarantine-log.json');
let qlog = [];
try { qlog = JSON.parse(readFileSync(qlogPath, 'utf8')); } catch {}
if (existsSync(join(iframesDir, 'cuphead.html'))) {
  renameSync(join(iframesDir, 'cuphead.html'), join(deadDir, 'cuphead.html'));
  qlog.push({ slug: 'cuphead', reason: 'web-ports 103 parts / 2.1GB exceed jsdelivr 50MB cap (403s); truffled.lol paths 404; CupheadWeb jsdelivr 403; itch framing blocked. Retry when a servable host appears.', date: new Date().toISOString().slice(0, 10) });
  writeFileSync(qlogPath, JSON.stringify(qlog, null, 1));
  console.log('quarantined cuphead (fake-green card removed, reason logged)');
}
console.log(`adopt-catalog: added=${added}`);
