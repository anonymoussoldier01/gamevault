'use client';

import { PlayLink } from './PlayLink';
import { formatPlays, type Game } from '@/lib/games';

export function Ticker({ games }: { games: Game[] }) {
  const top = [...games].sort((a, b) => b.plays - a.plays).slice(0, 20);
  const items = [...top, ...top];
  return (
    <div className="ticker surface overflow-hidden rounded-lg" aria-label="Trending ticker">
      <div className="ticker-track p-2">
        {items.map((g, i) => (
          <PlayLink
            key={`${g.slug}-${i}`}
            game={g}
            className="chip shrink-0 !py-1 text-xs"
            label={`Play ${g.title}`}
            aria-hidden={i >= top.length}
            tabIndex={i >= top.length ? -1 : undefined}
          >
            <span style={{ color: 'var(--accent)' }}>▲</span> {g.title}
            <span className="font-mono2 t-faint">{formatPlays(g.plays)}</span>
          </PlayLink>
        ))}
      </div>
    </div>
  );
}
