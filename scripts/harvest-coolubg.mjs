import { readFileSync, writeFileSync, appendFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const deadDir = join(iframesDir, '.dead');
mkdirSync(deadDir, { recursive: true });

function slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function titleOf(slug) { return slug.split('-').map((w) => /^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' '); }

const xml = await (await fetch('https://coolubg2.github.io/sitemap.xml')).text();
const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1].trim());
const found = new Map();
for (const loc of locs) {
  const m = loc.match(/[?&]([a-z0-9][a-z0-9\-]*)\s*$/i);
  if (m) found.set(slugify(m[1]), loc.split('#')[0]);
}
console.log(`coolubg catalog=${found.size}`);

function wrapperFor(slug, title, url) {
  return `<html>
  <link id="dynamic-favicon" rel="icon" type="image/png" href="resources/download.png">
      <title class="p1">Home | Compass</title>
<!-- gv:slug=${slug} gv:title=${title} gv:category=puzzle gv:heavy=false -->
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
let restored = 0, created = 0;
const rows = [];
for (const [slug, url] of found) {
  const livePath = join(iframesDir, `${slug}.html`);
  const deadPath = join(deadDir, `${slug}.html`);
  if (existsSync(livePath)) continue;
  const title = titleOf(slug);
  if (existsSync(deadPath)) { try { renameSync(deadPath, livePath); } catch { continue; } restored++; }
  else created++;
  writeFileSync(livePath, wrapperFor(slug, title, url));
  if (!tsvSlugs.has(slug)) { rows.push(`${slug}\t${title}\t${url}\tpuzzle\tiframe\tfalse`); tsvSlugs.add(slug); }
}
if (rows.length) appendFileSync(join(root, 'data', 'sources.tsv'), rows.join('\n') + '\n');
console.log(`coolubg-apply: restored=${restored} created=${created} tsv-rows=${rows.length}`);
