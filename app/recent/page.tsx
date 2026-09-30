'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GameGrid } from '@/components/GameGrid';
import { games, type Game } from '@/lib/games';
import { getRecent } from '@/lib/storage';

export default function RecentPage() {
  const [list, setList] = useState<Game[] | null>(null);
  useEffect(() => {
    const bySlug = new Map(games.map((g) => [g.slug, g]));
    setList(getRecent().map((s) => bySlug.get(s)).filter(Boolean) as Game[]);
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">🕘 Recently Played</h1>
      <p className="t-muted mt-1 text-sm">Your history, stored only in this browser.</p>
      <div className="mt-6">
        {list === null ? null : list.length === 0 ? (
          <div className="surface rounded-2xl p-10 text-center">
            <div className="text-4xl">🎮</div>
            <p className="mt-2 font-bold">Nothing here yet.</p>
            <p className="t-muted mt-1 text-sm">Play any game and it will show up here.</p>
            <Link href="/" className="btn-primary mt-4 inline-block !px-6 !py-2.5 text-sm">
              Find a game →
            </Link>
          </div>
        ) : (
          <GameGrid games={list} />
        )}
      </div>
    </div>
  );
}
