'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { games } from '@/lib/games';
import { launchGame } from '@/lib/launch';

export default function RandomPage() {
  const router = useRouter();
  useEffect(() => {
    const pick = games[Math.floor(Math.random() * games.length)];
    const ok = launchGame(pick);
    if (!ok) router.replace(`/play/${pick.slug}?inline=1`);
    else router.replace('/');
  }, [router]);
  return (
    <div className="surface mx-auto max-w-sm rounded-2xl p-10 text-center">
      <div className="font-mono2 hud" style={{ color: 'var(--accent)' }}>
        ARCADE // RANDOM
      </div>
      <div className="font-display mt-2 text-xl font-bold">Launching…</div>
    </div>
  );
}
