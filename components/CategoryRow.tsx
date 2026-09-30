import Link from 'next/link';
import { GameCard } from './GameCard';
import { RailNav } from './RailNav';
import { categoryLabel, CATEGORY_META } from '@/lib/games';
import type { Game } from '@/lib/games';

export function CategoryRow({ category, games }: { category: string; games: Game[] }) {
  const meta = CATEGORY_META[category];
  return (
    <RailNav
      title={
        <>
          {meta?.emoji ?? '🎮'} {categoryLabel(category)}
        </>
      }
      action={
        <Link href={`/category/${category}`} className="chip shrink-0 !py-1 text-xs">
          View All →
        </Link>
      }
    >
      {meta?.blurb && <p className="t-muted sr-only">{meta.blurb}</p>}
      {games.slice(0, 12).map((g) => (
        <GameCard key={g.slug} game={g} />
      ))}
    </RailNav>
  );
}
