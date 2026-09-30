'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GameCard } from './GameCard';
import type { Game } from '@/lib/games';

export type SortKey = 'plays' | 'rating' | 'new' | 'az';

export const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'plays', label: 'Most played' },
  { key: 'rating', label: 'Top rated' },
  { key: 'new', label: 'Newest' },
  { key: 'az', label: 'A–Z' },
];

export function sortGames(list: Game[], sort: SortKey): Game[] {
  const arr = [...list];
  switch (sort) {
    case 'rating':
      return arr.sort((a, b) => b.rating - a.rating || b.plays - a.plays);
    case 'new':
      return arr.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false) || b.plays - a.plays);
    case 'az':
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return arr.sort((a, b) => b.plays - a.plays);
  }
}

const PAGE = 24;

/** Compact 1 … cur-1 cur cur+1 … N page list. */
function pageNums(cur: number, pages: number): Array<number | '…'> {
  const set = new Set<number>([1, 2, cur + 1, cur + 2, cur, pages - 1, pages]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push('…');
    out.push(n);
    prev = n;
  }
  return out;
}

/** Sortable + paginated grid (client-side, no extra static paths). */
export function PaginatedGrid({ games, ranked = false }: { games: Game[]; ranked?: boolean }) {
  const [sort, setSort] = useState<SortKey>('plays');
  const [page, setPage] = useState(0);
  const sorted = sortGames(games, sort);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const slice = sorted.slice(cur * PAGE, cur * PAGE + PAGE);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => { setSort(s.key); setPage(0); }}
            className="chip"
            style={sort === s.key ? { background: 'var(--blue)', color: 'var(--blue-ink)', borderColor: 'var(--blue)' } : undefined}
            aria-pressed={sort === s.key}
          >
            {s.label}
          </button>
        ))}
        <span className="t-faint ml-auto text-xs font-semibold">
          {sorted.length} games · page {cur + 1}/{pages}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {slice.map((g, i) => (
          <GameCard key={g.slug} game={g} rank={ranked ? cur * PAGE + i : undefined} />
        ))}
      </div>
      {pages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          <button className="btn-ghost !px-3 !py-1.5 text-sm" disabled={cur === 0} onClick={() => setPage(cur - 1)} aria-label="Previous page">
            ←
          </button>
          {pageNums(cur, pages).map((p, idx) =>
            p === '…' ? (
              <span key={`e${idx}`} className="t-faint px-1 text-sm">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage((p as number) - 1)}
                className="chip !px-3 !py-1.5 text-sm"
                style={cur === (p as number) - 1 ? { background: 'var(--blue)', color: 'var(--blue-ink)', borderColor: 'var(--blue)' } : undefined}
                aria-pressed={cur === (p as number) - 1}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            ),
          )}
          <button className="btn-ghost !px-3 !py-1.5 text-sm" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} aria-label="Next page">
            →
          </button>
        </div>
      )}
    </div>
  );
}
