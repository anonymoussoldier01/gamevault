import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');

function inferCat(s) {
  s = s.toLowerCase();
  if (/fnaf|fnae|fnac|granny|baldi|buckshot|slend|eyes|meat|ice-scream|piggy|puppet|corpse|mad-father|witchs|ao-oni|dead-plate|milk|yume|bendy|amanda|banban|poppy|rainbow|doors|pressure|forsaken|fears|window|backrooms|exit-8|mouthwashing|kindergarten|hello-neighbor|friendly|andys|dandys|night-security|crooked|zombie|horror|scary|haunted|slender|freddy|nun|grudge|momo|shrek|garden/.test(s)) return 'horror';
  if (/(^|\-)io($|\-)|openfront|repuls|kirka|kour|hordes|goons|florr|taming|venge|bonk|mope|krunker|shockers|diep|arras|slither|agar|hole|paper|splix|defly|evowars|worm|starblast|zombs|surviv|miniroyale|tetr|gartic|warfront|frontwars|stumble/.test(s)) return 'io';
  if (/slope|moto|drive|drift|madalin|parking|bike|trial|stunt|rac|kart|tunnel|subway|temple|ski|snow|surf|rolling|traffic|rider|derby|burnout|hill-climb|outrun|road|speed|f1|formula|nascar|truck|bus|taxi|monster|demolition|tow|police|chase/.test(s)) return 'racing';
  if (/fnf|friday|osu|melody|beat|danc|rhythm|guitar|ddr|geometry|jsab|sprunki|piano|drum|heaven|popstar|music/.test(s)) return 'rhythm-action';
  if (/minecraft|eagler|voxel|sandbox|melon|grindcraft|powder|townscaper|worldbox|alchemy|terraria|raft|slime|goat|powerwash|farm|city-build|planet|settlement/.test(s)) return 'sandbox';
  if (/pokemon|mario|sonic|zelda|metroid|kirby|donkey|banjo|star-fox|f-zero|paper-|party|goldeneye|smash|earthbound|chrono|advance|emblem|wario|dkc|yoshi|tennis|metal-slug|castlevania|pac-man|tetris|galaga|frogger|contra|megaman|street-fighter/.test(s)) return 'retro';
  if (/^run$|^run-|slope-run|ball-sort|fireboy|red-ball|bloxorz|bob-|snail|wheely|draw|cut-the|doodle|2048|money|ovo|stack|suika|break|dice|baba|shapez|particle|nubby|statetris|brotato|puzzle|quiz|impossible|merge|sort|2048|pop-it|water|color|jewel|candy-crush|match|mahjong|sudoku|chess|checkers|2048|tetris|block|jigsaw/.test(s)) return 'puzzle';
  if (/box|soccer|football|basket|baseball|tennis|golf|pool|snooker|hockey|cricket|badminton|volley|wrestl|thumb|touchdown|bumper|mini-battle|rooftop|olympic|archery|bowl|darts|ball/.test(s)) return 'sports-action';
  if (/clicker|idle|tycoon|miner|papa|bloon|kingdom|tower|castle|siege|warfare|age-of|duck|learn-to-fly|tabs|paperclip|trimps|candy-box|bearbarian|empire|business|restaurant|shop|hotel|airport|harbor|command|defen[cs]e/.test(s)) return 'strategy';
  if (/stick|vex|fancy|raze|strike|sift|plazma|gun|territory|masked|soldier|sniper|shoot|ninja|samurai|pirate|cowboy|robot|alien|space|warrior|hero|fight|kong|dinosaur|dragon|war-|battle|combat|assassin|zombie/.test(s)) return 'action';
  return 'adventure';
}

let fixed = 0;
for (const f of readdirSync(iframesDir)) {
  if (!f.endsWith('.html')) continue;
  const p = join(iframesDir, f);
  const raw = readFileSync(p, 'utf8');
  if (!raw.includes('coolubg.github.io')) continue;
  const slug = f.replace(/\.html$/, '');
  const cat = inferCat(slug);
  const next = raw.replace(/gv:category=[A-Za-z0-9-]+/, `gv:category=${cat}`);
  if (next !== raw) { writeFileSync(p, next); fixed++; }
}
// mirror the fixed categories into sources.tsv
const tsvPath = join(root, 'data', 'sources.tsv');
const lines = readFileSync(tsvPath, 'utf8').split('\n');
const catBySlug = {};
for (const f of readdirSync(iframesDir)) {
  if (!f.endsWith('.html')) continue;
  const raw = readFileSync(join(iframesDir, f), 'utf8');
  const m = raw.match(/gv:slug=(\S+).*?gv:category=([A-Za-z0-9-]+)/);
  if (m) catBySlug[m[1]] = m[2];
}
for (let li = 1; li < lines.length; li++) {
  const cols = lines[li].split('\t');
  if (cols[0] && catBySlug[cols[0]] && cols[3] !== catBySlug[cols[0]]) { cols[3] = catBySlug[cols[0]]; lines[li] = cols.join('\t'); }
}
writeFileSync(tsvPath, lines.join('\n'));
console.log(`recat: wrappers-fixed=${fixed}`);
