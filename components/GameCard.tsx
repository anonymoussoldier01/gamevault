'use client';

import Link from 'next/link';
import { thumbFor, type Game } from '@/lib/games';
import { ThumbImg } from './ThumbImg';
import { PlayLink } from './PlayLink';

export function GameCard({ game, rank }: { game: Game; rank?: number }) {
  const t = thumbFor(game.slug);
  return (
    <div className="game-card group relative focus:outline-none focus-visible:ring-2" style={{ ['--tw-ring-color' as string]: 'var(--accent)' }}>
      <PlayLink game={game} className="block">
        <span className="card-art relative block aspect-video overflow-hidden">
          <span
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
          />
          {game.thumb && (
            <ThumbImg src={game.thumb} alt={game.title} className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
            {!game.thumb && (
              <span className="font-display text-4xl font-bold text-white/90 drop-shadow-lg">{t.initial}</span>
            )}
          </span>
          <span className="card-play absolute inset-0 flex items-center justify-center bg-black/35" aria-hidden>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-xl text-black">
              ▶
            </span>
          </span>
          {game.heavy && (
            <span
              className="absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white"
              style={{ background: 'var(--coral)' }}
            >
              HEAVY
            </span>
          )}
          {game.isNew && (
            <span
              className="absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white"
              style={{ background: 'var(--mint)' }}
            >
              NEW
            </span>
          )}
          {typeof rank === 'number' && rank < 3 && (
            <span
              className="absolute right-2 top-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold"
              style={{ background: 'var(--sun)', color: '#4a3200' }}
            >
              #{rank + 1}
            </span>
          )}
        </span>
        <span className="block px-2.5 py-2">
          <span className="block truncate text-sm font-bold">{game.title}</span>
        </span>
      </PlayLink>
      <Link
        href={`/play/${game.slug}`}
        className="t-faint absolute bottom-2 right-2 rounded-md px-1.5 text-xs opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
        style={{ background: 'var(--surface2)' }}
        aria-label={`About ${game.title}`}
        title="Details"
      >
        ⓘ
      </Link>
    </div>
  );
}
