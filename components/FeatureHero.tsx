'use client';

import { useEffect, useState } from 'react';
import { formatPlays, thumbFor, type Game } from '@/lib/games';
import { ThumbImg } from './ThumbImg';
import { PlayLink } from './PlayLink';
import { getRecent, getFavs } from '@/lib/storage';

/** Asymmetric editorial feature + trending mini-grid. Clicks launch fullscreen tabs. */
export function FeatureHero({ games }: { games: Game[] }) {
  const sorted = [...games].sort((a, b) => b.plays - a.plays);
  const featured = sorted[0];
  const rest = sorted.slice(1, 5);
  if (!featured) return null;
  const t = thumbFor(featured.slug);

  return (
    <section className="blueprint surface mt-2 rounded-lg p-4 sm:p-6" aria-label="Featured">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <PlayLink game={featured} className="group relative block overflow-hidden rounded-lg">
          <span className="kenburns relative block aspect-video w-full" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
            {featured.thumb && (
              <ThumbImg src={featured.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <span className="hud absolute left-3 top-3 rounded px-2 py-1 text-white" style={{ background: 'var(--sun)', color: '#4a3200' }}>
              ★ Game of the day
            </span>
            <span className="absolute inset-0 hidden items-center justify-center bg-black/35 group-hover:flex" aria-hidden>
              <span className="pulse-cta flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-2xl text-black">
                ▶
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
              <span className="font-display block text-2xl font-bold text-white sm:text-3xl">{featured.title}</span>
              <span className="font-mono2 mt-1 block text-xs" style={{ color: 'var(--accent)' }}>
                {formatPlays(featured.plays)} PLAYS · ★ {featured.rating.toFixed(1)} · CLICK LAUNCHES FULLSCREEN
              </span>
            </span>
          </span>
        </PlayLink>
        <div className="grid grid-cols-2 gap-3">
          {rest.map((g) => {
            const gt = thumbFor(g.slug);
            return (
              <PlayLink
                key={g.slug}
                game={g}
                className="game-card group relative block overflow-hidden"
              >
                <span className="relative block aspect-video" style={{ background: `linear-gradient(135deg, ${gt.from}, ${gt.to})` }}>
                  {g.thumb && <ThumbImg src={g.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-8">
                    <span className="block truncate text-sm font-bold text-white">{g.title}</span>
                    <span className="font-mono2 block text-[11px] text-white/70">▶ {formatPlays(g.plays)}</span>
                  </span>
                </span>
              </PlayLink>
            );
          })}
        </div>
      </div>
      <ClientRecent games={games} />
    </section>
  );
}

function ClientRecent({ games }: { games: Game[] }) {
  const [recent, setRecent] = useState<Game[]>([]);
  const [favs, setFavs] = useState<Game[]>([]);
  useEffect(() => {
    const bySlug = new Map(games.map((g) => [g.slug, g]));
    setRecent(getRecent().map((s) => bySlug.get(s)).filter(Boolean) as Game[]);
    setFavs(getFavs().map((s) => bySlug.get(s)).filter(Boolean) as Game[]);
  }, [games]);
  if (recent.length === 0 && favs.length === 0) return null;
  return (
    <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
      <div className="hud t-faint mb-2">Continue // recently played</div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[...recent.slice(0, 8), ...favs.filter((f) => !recent.some((r) => r.slug === f.slug)).slice(0, 4)].map((g) => (
          <PlayLink key={g.slug} game={g} className="chip shrink-0" label={`Continue ${g.title}`}>
            {g.title}
          </PlayLink>
        ))}
      </div>
    </div>
  );
}
