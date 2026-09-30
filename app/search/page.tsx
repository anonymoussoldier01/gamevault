'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaginatedGrid } from '@/components/PaginatedGrid';
import { GameGridSkeleton } from '@/components/GameGrid';
import { allTags, games, searchGames } from '@/lib/games';
import { pushSearchHistory } from '@/lib/storage';

function SearchInner() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const [tag, setTag] = useState<string | null>(null);
  const tags = useMemo(() => allTags().slice(0, 16), []);

  useEffect(() => {
    if (q.trim()) pushSearchHistory(q);
    setTag(null);
  }, [q]);

  const results = useMemo(() => {
    if (!q.trim()) return [...games].sort((a, b) => b.plays - a.plays);
    return searchGames(q, 200);
  }, [q]);

  const filtered = useMemo(() => {
    if (!tag) return results;
    return results.filter((g) => (g.tags ?? []).includes(tag));
  }, [results, tag]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Search{q ? ` — “${q}”` : ' all games'}</h1>
      <p className="t-muted mt-1 text-sm">{filtered.length} games{q ? '' : ' · top by plays'}</p>
      <form action="/search" method="get" className="mt-4 flex gap-2">
        <input
          key={q}
          name="q"
          defaultValue={q}
          placeholder="Search slope, fnaf, moto…"
          className="surface w-full rounded-full px-4 py-2.5 text-sm outline-none"
          aria-label="Search games"
          autoComplete="off"
          spellCheck={false}
        />
        <button className="btn-primary !px-5 !py-2.5 text-sm">Search</button>
      </form>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Filter by tag">
          {tags.map((t) => (
            <button
              key={t.tag}
              onClick={() => setTag((cur) => (cur === t.tag ? null : t.tag))}
              className="chip !py-1 text-xs"
              style={tag === t.tag ? { background: 'var(--blue)', color: 'var(--blue-ink)', borderColor: 'var(--blue)' } : undefined}
              aria-pressed={tag === t.tag}
            >
              #{t.tag} · {t.count}
            </button>
          ))}
        </div>
      )}
      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="surface rounded-2xl p-10 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-2 font-bold">No matches{q ? ` for “${q}”` : ''}{tag ? ` tagged #${tag}` : ''}.</p>
            <p className="t-muted mt-1 text-sm">Try fewer letters — search forgives typos.</p>
          </div>
        ) : (
          <PaginatedGrid games={filtered} />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<GameGridSkeleton count={12} />}>
      <SearchInner />
    </Suspense>
  );
}
