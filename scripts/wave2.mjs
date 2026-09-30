import { readdirSync, readFileSync, appendFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const tsvPath = join(root, 'data', 'sources.tsv');
const R = 'racing', A = 'action', P = 'puzzle', S = 'sports-action', T = 'strategy', H = 'horror', V = 'adventure', D = 'sandbox', Y = 'rhythm-action';

// [title, category] — gn-math hot / most-played HTML5
const GAMES = [
["Temple Run 2",R],["Temple Run",R],["Hill Climb Racing",R],["Hill Climb Racing 2",R],["Bike Race",R],
["Moto X3M 2",R],["Moto X3M 3",R],["Moto X3M 4 Winter",R],["Moto X3M 5",R],["Moto X3M 6 Spooky",R],
["Drift Hunters",R],["Drift Boss",R],["Madalin Stunt Cars 2",R],["Madalin Stunt Cars 3",R],["Top Speed Racing 3D",R],
["Real City Driving 2",R],["Stunt Cars 2",R],["Derby Destruction Simulator",R],["Parking Fury",R],["Parking Fury 2",R],
["Parking Fury 3",R],["Parking Fury 3D",R],["Moto Road Rash 3D",R],["Bike Trials Winter 1",R],["Bike Trials Winter 2",R],
["Slope 2",R],["Slope 3",R],["Slope Ball",R],["Slope Tunnel",R],["Slope City",R],
["Slope Racing 3D",R],["Slope Run",R],["Super Slope Game",R],["Run 2",R],["Rolling Sky",R],
["Ball Surfer 3D",R],["Skiing Fred",R],["Ski Jump",R],["Turbo Drift",R],["Burnin Rubber 5 XS",R],
["Burnout Drift",R],["Car Eats Car 2",R],["Car Eats Car 3",R],["Earn to Die 2",R],["Earn to Die 2 Exodus",R],
["Road Fighter",R],["Madalin Cars Multiplayer",R],["Top Speed 3D",R],["Super Bike the Champion",R],["Moto Trial Fest 2",R],
["Trials Ice Ride",R],["Blocky Racer",R],["Hover Racer 2",R],["Slope 4",R],["Slope Multiplayer",R],
["Run 1",R],["Tunnel Rush 2",R],["Snow Rider 2",R],["Drift Hunters 2",R],["Stunt Car Challenge",R],
["Vex 3",A],["Vex 4",A],["Vex 5",A],["Vex 6",A],["Vex 7",A],
["Fancy Pants 1",A],["Fancy Pants 2",A],["Fancy Pants 3",A],["Stickman Hook",A],["Stickman Boost",A],
["Stickman Climb 2",A],["Stickman Bike",A],["Stickman Fighter",A],["Stickman Rope Hero",A],["Stickman Warriors",A],
["Stickman Dismount",A],["Stickman Parkour",A],["Stick War Legacy",A],["Raze 1",A],["Raze 2",A],
["Raze 3",A],["Strike Force Heroes 1",A],["Strike Force Heroes 2",A],["Strike Force Heroes 3",A],["Boxhead 2Play",A],
["Electric Man 2",A],["Warfare 1917",A],["Warfare 1944",A],["Endless War",A],["Dead Zed",A],
["Dead Zed 2",A],["Raft Wars",A],["Raft Wars 2",A],["Raft Wars Multiplayer",A],["GunBlood",A],
["Gun Mayhem 3",A],["Territory War",A],["Territory War Online",A],["Zombie Hunters Arena",A],["Masked Forces",A],
["Masked Forces Unlimited",A],["Sift Heads 1",A],["Sift Heads 2",A],["Sift Heads 3",A],["Plazma Burst",A],
["Plazma Burst 2",A],
["Fireboy 4",P],["Fireboy 5",P],["Fireboy 6",P],["Red Ball",P],["Red Ball 2",P],
["Red Ball 3",P],["Red Ball 4",P],["Red Ball Forever",P],["Bob the Robber 1",P],["Bob the Robber 2",P],
["Bob the Robber 3",P],["Bob the Robber 4",P],["Bob the Robber 5",P],["Snail Bob 1",P],["Snail Bob 2",P],
["Snail Bob 3",P],["Snail Bob 4",P],["Cut the Rope",P],["Cut the Rope Time Travel",P],["2048",P],
["2048 Classic",P],["Doodle Jump",P],["Doodle Jump Christmas",P],["Wheely 1",P],["Wheely 2",P],
["Wheely 3",P],["Draw a Stickman 1",P],["Draw a Stickman 2",P],["OvO",P],["OvO Dimensions",P],
["Money Movers 1",P],["Money Movers 2",P],["Money Movers 3",P],["Watergirl Forest",P],["Fireboy Volcano",P],
["Basketball Legends",S],["Basket Random",S],["Football Legends",S],["Soccer Heads",S],["Tennis Masters",S],
["8 Ball Pool",S],["Table Tennis",S],["Golf Battle",S],["Retro Bowl College",S],["Touchdowners",S],
["Bumper Balls",S],["Beach Volleyball",S],["Badminton Legends",S],["Stick Cricket",S],["Boxing Stars",S],
["Wrestle Bros",S],["Snooker",S],["Air Hockey",S],["A Small World Cup",S],["Basketball FRVR",S],
["Soccer Random 2",S],["Volley Random 2",S],["Boxing Random 2",S],["Pool Party",S],["Golf Orbit",S],
["Cookie Clicker",T],["Doge Miner",T],["Doge Miner 2",T],["Idle Miner",T],["Idle Startup Tycoon",T],
["Idle Farming Business",T],["Bloons TD 6",T],["Kingdom Rush",T],["Kingdom Rush Frontiers",T],["Kingdom Rush Origins",T],
["Simple Tower Defense",T],["Age of War 2",T],["Pokemon Tower Defense",T],["The Final Earth",T],["Learn to Fly 3",T],
["Duck Life 5",T],["Duck Life 6",T],["Duck Life 7",T],["Duck Life 8",T],["Bearbarians",T],
["Crush the Castle",T],["Crush the Castle 2",T],["Siege Hero",T],["Bloons Monkey City",T],["Universal Paperclips",T],
["Trimps",T],["Candy Box",T],["Candy Box 2",T],["Idle Dice",T],["Idle Restaurants",T],
["Storm the House 1",T],["Storm the House 2",T],["Age of Defense",T],["Warrior Kingdom",T],["Castle Wars",T],
["Geometry Dash SubZero",Y],["Geometry Dash Meltdown",Y],["Geometry Dash World",Y],["Osu Mania",Y],["Beat Blade",Y],
["Dancing Road",Y],["Melody Escape",Y],["Friday Night Shootin",Y],
["Paper Minecraft",D],["Little Alchemy",D],["Sandboxels",D],["Melon Playground",D],["GrindCraft 2",D],
["Powder Game",D],["Powder Toy",D],["Townscaper Web",D],
["Granny 4",H],["Slendrina",H],["House of Slendrina",H],["Eyes the Horror",H],["Mr Meat",H],
["Ice Scream",H],["Hello Neighbor",H],["Piggy Webport",H],
["Adam and Eve 1",V],["Adam and Eve 2",V],["Adam and Eve GO",V],["Dune",V],["Tasty Planet",V],
["Tasty Planet Dino Time",V],["Cyberpunk Hacker",V],
];

const HOSTS = ['gn-math.github.io','ubg89.github.io','htmlxm.github.io','coolubg2.github.io','ubg98.github.io','23azostore.github.io','lekug.github.io','ubg365.github.io','class-76.github.io','1kh0.github.io'];

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
  rows.push(`${slug}\t${title}\t${url}\t${cat}\tiframe\tfalse`);
  added++;
}
if (rows.length) appendFileSync(tsvPath, rows.join('\n') + '\n');
console.log(`wave2: added=${added} skipped(dupes)=${skipped}`);
