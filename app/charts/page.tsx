'use client';

import { useState } from 'react';
import { PaginatedGrid } from '@/components/PaginatedGrid';
import { games } from '@/lib/games';

type Chart = 'played' | 'rated' | 'new';

const TABS: Array<{ key: Chart; label: string; emoji: string }> = [
  { key: 'played', label: 'Most played', emoji: '🔥' },
  { key: 'rated', label: 'Top rated', emoji: '★' },
  { key: 'new', label: 'Newest', emoji: '⚡' },
];

export default function ChartsPage() {
  const [tab, setTab] = useState<Chart>('played');
  const list =
    tab === 'played'
      ? [...games].sort((a, b) => b.plays - a.plays).slice(0, 100)
      : tab === 'rated'
        ? [...games].sort((a, b) => b.rating - a.rating || b.plays - a.plays).slice(0, 100)
        : [...games.filter((g) => g.isNew), ...[...games].reverse()].filter(
            (g, i, arr) => arr.findIndex((x) => x.slug === g.slug) === i,
          ).slice(0, 100);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">🏆 Charts</h1>
      <p className="t-muted mt-1 text-sm">Top 100 · updated daily</p>
      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="chip"
            style={tab === t.key ? { background: 'var(--blue)', color: 'var(--blue-ink)', borderColor: 'var(--blue)' } : undefined}
            aria-pressed={tab === t.key}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <PaginatedGrid games={list} ranked />
      </div>
    </div>
  );
}
