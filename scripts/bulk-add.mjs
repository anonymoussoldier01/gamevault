import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const iframesDir = join(root, 'iframes');
const tsvPath = join(root, 'data', 'sources.tsv');

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function wrapperFor({ slug, title, url, category, heavy }) {
  const heavyFlag = String(heavy).toLowerCase() === 'true';
  return `<html>
  <link id="dynamic-favicon" rel="icon" type="image/png" href="resources/download.png">
      <title class="p1">Home | Compass</title>
<!-- gv:slug=${slug} gv:title=${title} gv:category=${category} gv:heavy=${heavyFlag} -->
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

const raw = readFileSync(tsvPath, 'utf8').split(/\r?\n/).filter((l) => l.trim().length > 0);
const header = raw.shift().split('\t').map((h) => h.trim());
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const existing = new Set(readdirSync(iframesDir).filter((f) => f.endsWith('.html')).map((f) => f.replace(/\.html$/, '')));
// Quarantined (.dead) slugs stay excluded so re-runs never resurrect them
try {
  for (const f of readdirSync(join(iframesDir, '.dead'))) if (f.endsWith('.html')) existing.add(f.replace(/\.html$/, ''));
} catch {}
const seenTsv = new Set();
let created = 0;
let skippedExists = 0;
let skippedDup = 0;
const skipped = [];

for (const line of raw) {
  const cols = line.split('\t');
  let slug = (cols[idx.slug] || '').trim();
  const title = (cols[idx.title] || '').trim();
  const url = (cols[idx.url] || '').trim();
  const category = (cols[idx.category] || 'action').trim();
  const heavy = (cols[idx.heavy] || 'false').trim();
  if (!slug) slug = slugify(title);
  slug = slugify(slug);
  if (!slug || !url) continue;
  if (seenTsv.has(slug)) { skippedDup++; skipped.push(`${slug} (dup-in-tsv)`); continue; }
  seenTsv.add(slug);
  if (existing.has(slug)) { skippedExists++; skipped.push(`${slug} (exists-vs-168)`); continue; }
  const outPath = join(iframesDir, `${slug}.html`);
  if (existsSync(outPath)) { skippedExists++; skipped.push(`${slug} (exists-on-disk)`); continue; }
  writeFileSync(outPath, wrapperFor({ slug, title: title || slug, url, category, heavy }));
  existing.add(slug);
  created++;
}

console.log(`bulk-add: created=${created} skippedExists=${skippedExists} skippedDupTsv=${skippedDup} totalTsv=${raw.length}`);
if (skipped.length > 0) console.log(`dedupe-report: skipped ${skipped.length}: ${skipped.slice(0, 40).join(', ')}${skipped.length > 40 ? ' ...' : ''}`);
