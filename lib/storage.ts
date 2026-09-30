'use client';

// Guarded localStorage helpers (namespace v1:*). All engagement state lives here — no backend.

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const K = {
  favs: 'v1:favs',
  recent: 'v1:recent',
  ratings: 'v1:ratings',
  notes: 'v1:notes',
  likes: 'v1:likes',
  history: 'v1:search-history',
  reports: 'v1:reports',
};

export function getFavs(): string[] {
  return read<string[]>(K.favs, []);
}
export function toggleFav(slug: string): string[] {
  const favs = getFavs();
  const next = favs.includes(slug) ? favs.filter((s) => s !== slug) : [slug, ...favs].slice(0, 200);
  write(K.favs, next);
  return next;
}
export function isFav(slug: string): boolean {
  return getFavs().includes(slug);
}

/** Recently played, LRU capped at 24. */
export function pushRecent(slug: string): void {
  const recent = [slug, ...read<string[]>(K.recent, []).filter((s) => s !== slug)].slice(0, 24);
  write(K.recent, recent);
}
export function getRecent(): string[] {
  return read<string[]>(K.recent, []);
}

export function getRating(slug: string): number {
  return read<Record<string, number>>(K.ratings, {})[slug] ?? 0;
}
export function setRating(slug: string, stars: number): void {
  const all = read<Record<string, number>>(K.ratings, {});
  all[slug] = stars;
  write(K.ratings, all);
}

export function getNote(slug: string): string {
  return read<Record<string, string>>(K.notes, {})[slug] ?? '';
}
export function setNote(slug: string, note: string): void {
  const all = read<Record<string, string>>(K.notes, {});
  if (note.trim()) all[slug] = note.trim().slice(0, 500);
  else delete all[slug];
  write(K.notes, all);
}

export function hasLiked(slug: string): boolean {
  return read<string[]>(K.likes, []).includes(slug);
}
export function toggleLike(slug: string): boolean {
  const likes = read<string[]>(K.likes, []);
  const next = likes.includes(slug) ? likes.filter((s) => s !== slug) : [...likes, slug];
  write(K.likes, next);
  return next.includes(slug);
}

export function pushSearchHistory(q: string): void {
  const query = q.trim().slice(0, 60);
  if (!query) return;
  const hist = [query, ...read<string[]>(K.history, []).filter((s) => s !== query)].slice(0, 10);
  write(K.history, hist);
}
export function getSearchHistory(): string[] {
  return read<string[]>(K.history, []);
}

export interface BrokenReport {
  slug: string;
  url: string;
  note: string;
  at: string;
}
/** Repair queue for the next dead-link sweep (exported via settings/download). */
export function reportBroken(slug: string, url: string, note: string): void {
  const all = read<BrokenReport[]>(K.reports, []).filter((r) => r.slug !== slug);
  all.unshift({ slug, url, note: note.slice(0, 300), at: new Date().toISOString() });
  write(K.reports, all.slice(0, 100));
}
export function getReports(): BrokenReport[] {
  return read<BrokenReport[]>(K.reports, []);
}
