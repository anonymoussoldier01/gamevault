import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const md = readFileSync(join(root, 'data', 'catalog.md'), 'utf8').split('\n');

function cells(line) {
  return line.split('|').slice(1, -1).map((c) => c.trim());
}
function link(cell) {
  const m = cell.match(/\[([^\]]*)\]\(([^)]+)\)/);
  return m ? { text: m[1], url: m[2] } : null;
}
const ORG_ROWS = new Set(['bog/aukak', 'breadbb/genizy', 'burnedwebsite', 'gays dot\' studio', 'gays-studio', 'gmh-code', 'national porting association', 'webport.ing', 'sky at selenite.cc']);
function slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

const rows = [];
for (const line of md) {
  if (!line.startsWith('|')) continue;
  const c = cells(line);
  if (c.length < 4 || !/^\d+$/.test(c[0])) continue;
  const title = c[1].replace(/\*\*/g, '').trim();
  if (!title || ORG_ROWS.has(title.toLowerCase())) continue;
  const demo = link(c[2]);
  const repo = link(c[3]);
  if (!demo && !repo) continue; // neither row
  rows.push({ n: Number(c[0]), title, demoUrl: demo ? demo.url : null, repoUrl: repo ? repo.url : null });
}
console.log(`parsed rows=${rows.length}`);

// collapse (2)/(3)/(4) dupes
const base = new Map();
for (const r of rows) {
  const b = r.title.replace(/\s*\((\d+)\)\s*$/, '').trim();
  if (!base.has(b)) base.set(b, { title: b, demos: [], repos: [] });
  const e = base.get(b);
  if (r.demoUrl && !e.demos.includes(r.demoUrl)) e.demos.push(r.demoUrl);
  if (r.repoUrl && !e.repos.includes(r.repoUrl)) e.repos.push(r.repoUrl);
}
console.log(`unique games=${base.size}`);

function tierOf(demos, repos) {
  const urls = [...demos, ...repos].join(' ');
  if (/retrogamescenter\.ru\/ports\//.test(urls)) return 't1-retro';
  if (/gn-math\.github\.io\/web-port\//.test(urls)) return 't1-genizy';
  if (/github\.com\/(web-ports|webporting|genizy|aukak|breadbb|burnedpopcorn|98corbins|slqnt|irv77|mercuryworkshop)\//i.test(urls)) return 't1-repo';
  if (/gn-math\.dev\/\?id=/.test(urls)) return 't2-gnmath';
  if (demos.length) return 't2-demo';
  return 't2-repo';
}

const games = JSON.parse(readFileSync(join(root, 'data', 'games.json'), 'utf8'));
const have = new Set(games.map((g) => g.slug));
const haveTitles = new Set(games.map((g) => g.title.toLowerCase()));
try {
  for (const f of readdirSync(join(root, 'iframes', '.dead'))) if (f.endsWith('.html')) have.add(f.replace(/\.html$/, ''));
} catch {}
const tsvSlugs = new Set(readFileSync(join(root, 'data', 'sources.tsv'), 'utf8').split('\n').slice(1).map((l) => (l.split('\t')[0] || '').trim()).filter(Boolean));

const cands = [];
let skippedHave = 0;
for (const [title, e] of base) {
  const slug = slugify(title);
  if (!slug) continue;
  if (have.has(slug) || haveTitles.has(title.toLowerCase()) || tsvSlugs.has(slug)) { skippedHave++; continue; }
  cands.push({ slug, title, tier: tierOf(e.demos, e.repos), demos: e.demos, repos: e.repos });
}
const byTier = {};
for (const c of cands) byTier[c.tier] = (byTier[c.tier] || 0) + 1;
console.log(`dedupe: skipped-have=${skippedHave} net-new=${cands.length}`, JSON.stringify(byTier));
writeFileSync(join(root, 'data', 'catalog-candidates.json'), JSON.stringify(cands, null, 1));
for (const c of cands.slice(0, 60)) console.log(`  ${c.tier} ${c.slug} :: ${(c.demos[0] || '')} ${(c.repos[0] || '')}`);
