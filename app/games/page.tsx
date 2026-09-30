import type { Metadata } from 'next';
import { PaginatedGrid } from '@/components/PaginatedGrid';
import { games } from '@/lib/games';

export const metadata: Metadata = {
  title: 'All Games A–Z — Play Free | GameVault',
  description: `Browse all ${games.length} free online games A to Z. No download, no login.`,
};

export default function AllGamesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">🎮 All Games A–Z</h1>
      <p className="t-muted mt-1 text-sm">{games.length} games · sort and page through everything</p>
      <div className="mt-6">
        <PaginatedGrid games={games} />
      </div>
    </div>
  );
}
