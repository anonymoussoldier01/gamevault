import { GameCard } from './GameCard';
import type { Game } from '@/lib/games';

export function GameGrid({ games, ranked = false }: { games: Game[]; ranked?: boolean }) {
  if (games.length === 0) {
    return (
      <div className="surface rounded-2xl p-10 text-center">
        <div className="text-4xl">🎮</div>
        <p className="t-muted mt-2 font-bold">No games found.</p>
        <p className="t-faint mt-1 text-sm">Try another search or browse a category.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {games.map((g, i) => (
        <span key={g.slug} className="reveal block" style={{ ['--rd' as string]: Math.min(i, 7) }}>
          <GameCard game={g} rank={ranked ? i : undefined} />
        </span>
      ))}
    </div>
  );
}

export function GameGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="game-card" style={{ animationDelay: `${(i % 8) * 60}ms` }}>
          <div className="skel aspect-square" />
          <div className="space-y-2 p-2.5">
            <div className="skel h-4 rounded" />
            <div className="skel h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
