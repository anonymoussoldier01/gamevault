import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const deadDir = join(iframesDir, '.dead');
mkdirSync(deadDir, { recursive: true });

// Official .io embeds: verified 200 + no X-Frame-Options/CSP + no JS frame-buster
const OFFICIALS = [
["slither-official","Slither.io","https://slither.io"],
["diep-official","Diep.io","https://diep.io"],
["krunker-official","Krunker.io","https://krunker.io"],
["bonk-official","Bonk.io","https://bonk.io"],
["shellshock-official","Shell Shockers","https://shellshock.io"],
["skribbl-official","Skribbl.io","https://skribbl.io"],
["mope-official","Mope.io","https://mope.io"],
["surviv-official","Surviv.io","https://surviv.io"],
["smashkarts-official","Smash Karts","https://smashkarts.io"],
["starblast-official","Starblast.io","https://starblast.io"],
["splix-official","Splix.io","https://splix.io"],
["defly-official","Defly.io","https://defly.io"],
["paper-official","Paper.io","https://paper.io"],
["kirka-official","Kirka.io","https://kirka.io"],
["kour-official","Kour.io","https://kour.io"],
["zombsroyale-official","ZombsRoyale.io","https://zombsroyale.io"],
["taming-official","Taming.io","https://taming.io"],
["repuls-official","Repuls.io","https://repuls.io"],
["evowars-official","EvoWars.io","https://evowars.io"],
["powerline-official","Powerline.io","https://powerline.io"],
["wings-official","Wings.io","https://wings.io"],
["starve-official","Starve.io","https://starve.io"],
["lordz-official","Lordz.io","https://lordz.io"],
["slayone-official","Slay.one","https://slay.one"],
["brutal-official","Brutal.io","https://brutal.io"],
["gats-official","Gats.io","https://gats.io"],
];

function wrapperFor(slug, title, url) {
  return `<html>
  <link id="dynamic-favicon" rel="icon" type="image/png" href="resources/download.png">
      <title class="p1">Home | Compass</title>
<!-- gv:slug=${slug} gv:title=${title} gv:category=io gv:heavy=false -->
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

const tsvSlugs = new Set(readFileSync(join(root, 'data', 'sources.tsv'), 'utf8').split('\n').slice(1).map((l) => (l.split('\t')[0] || '').trim()).filter(Boolean));
let added = 0;
const rows = [];
for (const [slug, title, url] of OFFICIALS) {
  const livePath = join(iframesDir, `${slug}.html`);
  if (existsSync(livePath) || existsSync(join(deadDir, `${slug}.html`))) continue;
  writeFileSync(livePath, wrapperFor(slug, title, url));
  if (!tsvSlugs.has(slug)) { rows.push(`${slug}\t${title}\t${url}\tio\tiframe\tfalse`); tsvSlugs.add(slug); }
  added++;
}
if (rows.length) appendFileSync(join(root, 'data', 'sources.tsv'), rows.join('\n') + '\n');
console.log(`io-officials: added=${added}`);
