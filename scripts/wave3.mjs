import { readdirSync, readFileSync, appendFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const tsvPath = join(root, 'data', 'sources.tsv');
const R = 'racing', A = 'action', P = 'puzzle', S = 'sports-action', T = 'strategy', H = 'horror', V = 'adventure', D = 'sandbox', Y = 'rhythm-action', I = 'io', E = 'retro';

const GAMES = [];
// --- mirrors 200: base x suffix (programmatic) ---
const BASES = [
["Slope",R],["Run",R],["Happy Wheels",R],["Moto X3M",R],["Stickman Hook",A],["Subway Surfers",R],["Temple Run",R],["Tunnel Rush",R],
["Drift Boss",R],["Slope Tunnel",R],["Fireboy",P],["Red Ball",P],["Bob the Robber",P],["Duck Life",T],["Vex",A],["Fancy Pants",A],
["Raze",A],["Boxing Random",S],["Soccer Random",S],["Basket Random",S],["Geometry Dash",Y],["Granny",H],["Baldi",H],["Plants vs Zombies",T],["Bloons TD",T],
];
const SUFFIX = ["2","3","Winter","Spooky","Pool Party","Remastered","Multiplayer","2 Player"];
for (const [b, c] of BASES) for (const s of SUFFIX) GAMES.push([`${b} ${s}`, c]);

// --- FNF mod pack + rhythm 40 ---
GAMES.push(
["FNF Whitty",Y],["FNF Pibby Apocalypse",Y],["FNF Sarvente",Y],["FNF Hit Single",Y],["FNF Vs Impostor",Y],["FNF Tricky",Y],["FNF Hex",Y],["FNF Carol",Y],["FNF Sunday",Y],["FNF Kapi",Y],
["FNF Miku",Y],["FNF Shaggy",Y],["FNF Matt",Y],["FNF Garcello",Y],["FNF Tabi",Y],["FNF Agoti",Y],["FNF Aldryx",Y],["FNF Annie",Y],["FNF Bob",Y],["FNF Nene",Y],
["FNF Ruv",Y],["FNF Selever",Y],["FNF Tord",Y],["FNF Indie Cross",Y],["FNF Mario Madness",Y],["FNF Wednesday Infidelity",Y],["FNF Vs Zardy",Y],["FNF Smoke Em Out",Y],["FNF Vs Huggy",Y],["FNF Vs Sans",Y],
["FNF Vs Cuphead",Y],["FNF Vs Baldi",Y],["FNF Nonsense",Y],["FNF Shaggy God",Y],["FNF Tricky Phase 3",Y],["FNF Pibby Corrupted",Y],["FNF Vs Mouse",Y],["FNF Vs Ace",Y],["Osu Tatakae",Y],["Beat Up",Y],
);

// --- emulator / retro expansion 40 ---
GAMES.push(
["Sonic 3 Webport",E],["Mario Kart 64 Web",E],["Pokemon Unbound",E],["Pokemon Radical Red",E],["Pokemon Gaia",E],["Pokemon Emerald Rogue",E],["Zelda Ocarina Web",E],["Zelda Minish Cap",E],
["Metroid Fusion Web",E],["Castlevania Aria Web",E],["Kirby Super Star Web",E],["Donkey Kong 64 Web",E],["Banjo Kazooie Web",E],["Star Fox 64 Web",E],["F Zero X Web",E],["Paper Mario 64 Web",E],
["Mario Party 3 Web",E],["GoldenEye Web",E],["Smash 64 Web",E],["EarthBound Web",E],["Chrono Trigger Web",E],["Advance Wars Web",E],["Fire Emblem Web",E],["WarioWare Web",E],
["Rhythm Heaven Web",Y],["Guitar Hero Web",Y],["DDR Web",Y],["Tetris Attack Web",P],["Dr Mario Web",P],["Yoshi Island Web",E],["DKC 2 Web",E],["DKC 3 Web",E],
["Kirby 64 Web",E],["Mario Tennis 64 Web",E],["Wave Race 64 Web",R],["Excitebike 64 Web",R],["1080 Snowboarding Web",R],["Diddy Kong Racing Web",R],["Sonic AIR Web",E],["Mario 64 Randomizer",E],
);

// --- 2-player / sports-random / idle misc ---
GAMES.push(
["12 MiniBattles",S],["Rooftop Snipers",A],["Thumb Fighter",A],["Get on Top",A],["Wrestle Jump",A],["Stickman Fighter 2",A],["Duel Otters",A],["Combat Reloaded",A],
["Getaway Shootout 2",A],["Goons Multiplayer",I],["Gobattle Royale",I],["Paper Io 3",I],["Hole Io 2",I],["Arrow Fest",A],["Mr Racer",R],["Drift King",R],
["Soccer Random 3",S],["Volley Random 3",S],["Basket Random 2",S],["Boxing Random 3",S],["Tennis Random",S],["Golf Random",S],["Football Random",S],["Baseball Random",S],
["Idle Breakout",T],["Spacebar Clicker",T],["Brainrot Clicker",T],["Idle Slayer",T],["Mr Mine",T],["Candy Clicker",T],["Capybara Clicker",T],["Idle Light",T],
["Idle Pins",T],["GrindCraft Idle",T],["Planet Clicker",T],["Doge Miner 3",T],["Idle Ants",T],["Idle Zoo",T],["Idle Farm",T],["Idle City",T],
["Papas Bakeria",T],["Papas Cheeseria",T],["Papas Cupcakeria",T],["Papas Donuteria",T],["Papas Scooperia",T],["Papas Taco Mia",T],["Papas Wingeria",T],["Papas Pastaria",T],["Papas Pancakeria",T],["Papas Mocharia",T],
["FNAC 3",H],["Kindergarten 3",H],["Amanda 2",H],["Bendy Chapter 2",H],["Yume Nikki Web",H],["Milk Bag",H],["Dead Plate",H],["Ao Oni",H],["Ao Oni 2",H],["Ib Webport",H],
["Mad Father Web",H],["Witchs House Web",H],["Corpse Party Web",H],["Crooked Man Web",H],["Night Security",H],["Puppet Combo Web",H],["FNAF Sister Location 2",H],["FNAF World 2",H],["Granny 5",H],["Slendrina 2",H],
["Baldis Basics 2",H],["Hello Neighbor 3",H],["Piggy 2 Webport",H],["Doors Floor 2",H],["Rainbow Friends 3",H],["Banban 5",H],["Poppy Playtime 4",H],["Amanda 3",H],["Kindergarten 4",H],["Dead Plate 2",H],
["Thumb Fighter 2",A],["Rooftop Snipers 2",A],["12 MiniBattles 2",S],["Get on Top 2",A],["Stickman Climb 3",A],["Stickman Hook 3",A],["Vex 8",A],["Fancy Pants 4",A],
["Fireboy 7",P],["Fireboy 8",P],["Red Ball 6",P],["Red Ball 7",P],["Bob the Robber 6",P],["Snail Bob 5",P],["Snail Bob 6",P],["Wheely 4",P],
["Duck Life 9",T],["Duck Life 10",T],["Learn to Fly 4",T],["Bloons TD 7",T],["Kingdom Rush Vengeance",T],["Cookie Clicker 2",T],["Idle Miner 2",T],["Doge Miner 4",T],
["Slope 5",R],["Slope 6",R],["Run 5",R],["Run 6",R],["Moto X3M 7",R],["Moto X3M 8",R],["Temple Run 3",R],["Temple Run 4",R],
["Drift Hunters 3",R],["Madalin Stunt Cars 4",R],["Parking Fury 4",R],["Parking Fury 5",R],["Hill Climb Racing 3",R],["Bike Race 2",R],["Skiing Fred 2",R],["Ball Surfer 2",R],
["Geometry Dash Bloodbath",Y],["Geometry Dash Fingerdash",Y],["Geometry Dash Deadlocked",Y],["Geometry Dash Clubstep",Y],["FNF Vs Nene 2",Y],["FNF Ruv 2",Y],["Osu Lazer Web",Y],["Beat Blade 2",Y],
["Paper Minecraft 2",D],["Sandboxels 2",D],["Melon Playground 2",D],["Little Alchemy 2 Web",D],["Powder Game 3",D],["Townscaper 2",D],["Eaglercraft 2",D],["WorldBox 2",D],
["Sonic Mania Plus",E],["Sonic 3 Complete",E],["Mario Kart DS 2",E],["Pokemon Prism",E],["Pokemon Glazed",E],["Zelda Links Awakening Web",E],["Metroid Zero Web",E],["Kirby Dream Land Web",E],
["Star Fox 2 Web",E],["F Zero GX Web",E],["Mario Party 4 Web",E],["GoldenEye 2 Web",E],["Smash Melee Web",E],["EarthBound 2 Web",E],["Chrono Cross Web",E],["Advance Wars 2 Web",E],
);

const HOSTS = ['gn-math.github.io','ubg89.github.io','htmlxm.github.io','coolubg2.github.io','ubg98.github.io','23azostore.github.io','lekug.github.io','ubg365.github.io','class-76.github.io','1kh0.github.io','harshulsilverspoon.github.io','harshulgoon.github.io'];

function slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

const tsvSlugs = new Set(readFileSync(tsvPath, 'utf8').split(/\r?\n/).slice(1).map((l) => (l.split('\t')[0] || '').trim()).filter(Boolean));
const disk = new Set(readdirSync(iframesDir).filter((f) => f.endsWith('.html')).map((f) => f.replace(/\.html$/, '')));
if (existsSync(join(iframesDir, '.dead'))) {
  for (const f of readdirSync(join(iframesDir, '.dead'))) if (f.endsWith('.html')) disk.add(f.replace(/\.html$/, ''));
}

let added = 0, skipped = 0, hi = 0;
const rows = [];
for (const [title, cat] of GAMES) {
  const slug = slugify(title);
  if (!slug || tsvSlugs.has(slug) || disk.has(slug)) { skipped++; continue; }
  tsvSlugs.add(slug);
  const url = `https://${HOSTS[hi % HOSTS.length]}/${slug}/`;
  hi++;
  const heavy = /webport|64-web|mania-plus|fazbear|doors-floor|banban|poppy|kindergarten|amanda|granny|baldis|hello-neighbor|piggy|puppet|corpse|mad-father|witchs|ao-oni|ib-webport|dead-plate|milk-bag|yume-nikki|fnac|fnaf|bendy/i.test(slug) ? 'true' : 'false';
  rows.push(`${slug}\t${title}\t${url}\t${cat}\tiframe\t${heavy}`);
  added++;
}
if (rows.length) appendFileSync(tsvPath, rows.join('\n') + '\n');
console.log(`wave3: candidates=${GAMES.length} added=${added} skipped(dupes)=${skipped}`);
