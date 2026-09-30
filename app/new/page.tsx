import type { Metadata } from 'next';
import { PaginatedGrid } from '@/components/PaginatedGrid';
import { games } from '@/lib/games';

export const metadata: Metadata = {
  title: 'New Games — Fresh Drops | GameVault',
  description: 'The newest games on GameVault. Fresh ports added constantly. No download, no login.',
};

export default function NewPage() {
  const list = [...games.filter((g) => g.isNew), ...[...games].reverse()].filter(
    (g, i, arr) => arr.findIndex((x) => x.slug === g.slug) === i,
  );
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">🆕 New Games</h1>
      <p className="t-muted mt-1 text-sm">{list.length} fresh drops · newest first</p>
      <div className="mt-6">
        <PaginatedGrid games={list} />
      </div>
    </div>
  );
}
