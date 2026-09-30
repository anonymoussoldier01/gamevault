import gamesData from '@/data/games.json';

export type GameKind = 'iframe' | 'port' | 'ruffle' | 'ejs' | 'embed';

export interface Game {
  slug: string;
  title: string;
  iframeUrl: string;
  category: string;
  kind: GameKind;
  thumb?: string;
  tags?: string[];
  ejsCore?: string;
  ejsGameUrl?: string;
  swfUrl?: string;
  heavy?: boolean;
  isNew?: boolean;
  plays: number;
  rating: number;
  description: string;
}

export const games: Game[] = gamesData as Game[];

export const CATEGORY_META: Record<string, { label: string; emoji: string; blurb: string }> = {
  racing: { label: 'Racing', emoji: '🏎️', blurb: 'Slope, Subway, PolyTrack, Moto X3M — full speed.' },
  horror: { label: 'Horror', emoji: '😱', blurb: 'FNAF pack, Granny, Buckshot Roulette — lights off.' },
  puzzle: { label: 'Puzzle', emoji: '🧩', blurb: 'Fireboy, Bloxorz, Suika, Balatro-likes.' },
  adventure: { label: 'Adventure', emoji: '🗺️', blurb: 'Undertale, Deltarune, Celeste, Doom, Portal.' },
  action: { label: 'Action', emoji: '⚔️', blurb: 'Run 3, Stickman, Time Shooter — pure adrenaline.' },
  'sports-action': { label: 'Sports', emoji: '⚽', blurb: 'Basket Bros, Boxing Random, Tag, Ragdoll.' },
  strategy: { label: 'Strategy', emoji: '♟️', blurb: 'Bloons TD, Idle games, Papa’s sims, Learn to Fly.' },
  sandbox: { label: 'Sandbox', emoji: '⛏️', blurb: 'Minecraft, Eaglercraft, WorldBox, Grindcraft.' },
  retro: { label: 'Retro', emoji: '👾', blurb: 'Pokemon, Mario 64, Metal Slug, Sonic.' },
  'rhythm-action': { label: 'Rhythm', emoji: '🎵', blurb: 'FNF, Geometry Dash, Osu, Ultrakill.' },
  io: { label: '.io', emoji: '🌐', blurb: 'Multiplayer arena chaos.' },
};

export function categoryLabel(slug: string): string {
  return CATEGORY_META[slug]?.label ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}

export function relatedGames(game: Game, n = 6): Game[] {
  const same = games.filter((g) => g.slug !== game.slug && g.category === game.category);
  const rest = games.filter((g) => g.slug !== game.slug && g.category !== game.category);
  return [...same, ...rest].slice(0, n);
}

export function searchGames(q: string, limit = 24): Game[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const words = query.split(/\s+/);
  const scored = games.map((g) => {
    const t = g.title.toLowerCase();
    const s = g.slug.toLowerCase();
    const tags = (g.tags ?? []).join(' ');
    const desc = (g.description ?? '').toLowerCase();
    let score = -1;
    if (t === query || s === query) score = 0;
    else if (t.startsWith(query)) score = 1;
    else if (s.startsWith(query)) score = 2;
    else if (t.includes(query)) score = 3;
    else if (s.includes(query)) score = 4;
    else if (tags.includes(query)) score = 5;
    else if (desc.includes(query)) score = 6;
    else if (g.category.includes(query)) score = 7;
    else if (words.length > 1 && words.every((w) => t.includes(w) || s.includes(w) || tags.includes(w))) score = 8;
    else if (subseq(t.replace(/[^a-z0-9]/g, ''), query.replace(/[^a-z0-9]/g, ''))) score = 9;
    return { g, score };
  }).filter((x) => x.score >= 0);
  scored.sort((a, b) => a.score - b.score || b.g.plays - a.g.plays);
  return scored.slice(0, limit).map((x) => x.g);
}

/** Typo-tolerant subsequence match (query chars in order within target). */
function subseq(target: string, query: string): boolean {
  if (!query || query.length < 4) return false;
  let j = 0;
  for (let i = 0; i < target.length && j < query.length; i++) {
    if (target[i] === query[j]) j++;
  }
  return j === query.length;
}

/** Tag index with counts, for pills + tag pages. */
export function allTags(): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const g of games) for (const t of g.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .filter((x) => x.count >= 3 && x.tag !== x.tag.toUpperCase())
    .sort((a, b) => b.count - a.count);
}

export function gamesByTag(tag: string): Game[] {
  const t = tag.toLowerCase();
  return games
    .filter((g) => (g.tags ?? []).includes(t))
    .sort((a, b) => b.plays - a.plays);
}

/** Intent collections (rules over the library). */
export interface Collection {
  slug: string;
  title: string;
  emoji: string;
  blurb: string;
}

export const COLLECTIONS: Collection[] = [
  { slug: 'quick-fun', title: '5-Minute Fun', emoji: '⚡', blurb: 'Instant hits, zero learning curve.' },
  { slug: 'relax', title: 'Relax & Unwind', emoji: '🍵', blurb: 'Cozy puzzles and clickers.' },
  { slug: 'adrenaline', title: 'Adrenaline Rush', emoji: '🔥', blurb: 'Heavy, fast, loud.' },
  { slug: 'with-friends', title: 'With Friends', emoji: '👯', blurb: 'Multiplayer chaos and versus.' },
];

export function gamesByCollection(slug: string): Game[] {
  let list: Game[];
  switch (slug) {
    case 'quick-fun':
      list = games.filter((g) => !g.heavy && ['racing', 'action', 'sports-action'].includes(g.category));
      break;
    case 'relax':
      list = games.filter((g) => ['puzzle', 'strategy', 'sandbox'].includes(g.category));
      break;
    case 'adrenaline':
      list = games.filter((g) => g.heavy || ['racing', 'rhythm-action'].includes(g.category));
      break;
    case 'with-friends':
      list = games.filter((g) => ['io', 'sports-action'].includes(g.category));
      break;
    default:
      list = [];
  }
  return [...list].sort((a, b) => b.plays - a.plays);
}

/** Franchise strips: shared title prefixes with 4+ games (Moto X3M ×8, Fireboy ×8…). */
export function franchises(): Array<{ name: string; games: Game[] }> {
  const groups = new Map<string, Game[]>();
  for (const g of games) {
    const prefix = g.title.toLowerCase().split(/\s+/).slice(0, 2).join(' ');
    if (prefix.length < 4) continue;
    if (!groups.has(prefix)) groups.set(prefix, []);
    groups.get(prefix)!.push(g);
  }
  return [...groups.entries()]
    .filter(([, list]) => list.length >= 4)
    .map(([name, list]) => ({
      name: name.split(' ').map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' '),
      games: [...list].sort((a, b) => b.plays - a.plays),
    }))
    .sort((a, b) => b.games.length - a.games.length);
}

/** "Games like X": Jaccard over tags + category bonus. */
export function similarGames(game: Game, n = 8): Game[] {
  const tags = new Set(game.tags ?? []);
  const scored = games
    .filter((g) => g.slug !== game.slug)
    .map((g) => {
      const gt = new Set(g.tags ?? []);
      let shared = 0;
      for (const t of tags) if (gt.has(t)) shared++;
      const union = tags.size + gt.size - shared || 1;
      let score = shared / union;
      if (g.category === game.category) score += 0.35;
      return { g, score };
    });
  scored.sort((a, b) => b.score - a.score || b.g.plays - a.g.plays);
  return scored.slice(0, n).map((x) => x.g);
}

export function formatPlays(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

/** Deterministic gradient thumb (v1 — no binary assets in repo). */
const PALETTES: Array<[string, string]> = [
  ['#7c3aed', '#06b6d4'],
  ['#db2777', '#7c3aed'],
  ['#059669', '#22d3ee'],
  ['#ea580c', '#db2777'],
  ['#4f46e5', '#a855f7'],
  ['#0d9488', '#84cc16'],
  ['#dc2626', '#f59e0b'],
  ['#0891b2', '#6366f1'],
];

export function thumbFor(slug: string): { from: string; to: string; emoji: string; initial: string } {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) { h ^= slug.charCodeAt(i); h = Math.imul(h, 16777619); }
  const [from, to] = PALETTES[Math.abs(h) % PALETTES.length];
  const game = getGame(slug);
  const emoji = (game && CATEGORY_META[game.category]?.emoji) || '🎮';
  return { from, to, emoji, initial: (game?.title ?? slug).charAt(0).toUpperCase() };
}
