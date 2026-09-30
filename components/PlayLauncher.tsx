'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { launchGame } from '@/lib/launch';
import { GameFrame } from './GameFrame';
import { ThumbImg } from './ThumbImg';
import { thumbFor, type Game } from '@/lib/games';

export function PlayLauncher({ game }: { game: Game }) {
  const [inline, setInline] = useState(false);
  return (
    <>
      <Suspense>
        <AutoInline onInline={() => setInline(true)} />
      </Suspense>
      <PlayLauncherInner game={game} inline={inline} setInline={setInline} />
    </>
  );
}

function AutoInline({ onInline }: { onInline: () => void }) {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get('inline') === '1') onInline();
  }, [params, onInline]);
  return null;
}

function PlayLauncherInner({ game, inline, setInline }: { game: Game; inline: boolean; setInline: (v: boolean) => void }) {
  const [blocked, setBlocked] = useState(false);
  const t = thumbFor(game.slug);

  const go = () => {
    const ok = launchGame(game);
    if (!ok) {
      setBlocked(true);
      setInline(true);
    }
  };

  if (inline) {
    return (
      <div>
        <GameFrame game={game} />
        <button onClick={() => setInline(false)} className="t-muted mt-2 text-sm underline">
          ← Back to launcher
        </button>
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden rounded-2xl">
      <button onClick={go} className="group relative block w-full text-left" aria-label={`Play ${game.title} fullscreen in a new tab`}>
        <span className="relative block aspect-video w-full" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
          {game.thumb && (
            <ThumbImg src={game.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span className="absolute inset-0 bg-black/45" aria-hidden />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="hud" style={{ color: 'var(--accent)' }}>
              GAMEVAULT // ARCADE
            </span>
            <span className="btn-primary !px-10 !py-4 !text-lg transition group-hover:scale-105">
              ▶ Play fullscreen
            </span>
            <span className="text-sm text-white/80">
              {game.heavy ? '⚠ Heavy game — opens in a new tab' : 'Opens instantly in a new tab · Esc panics'}
              {game.kind === 'ruffle' ? ' · Flash' : ''}
              {game.kind === 'ejs' ? ' · Emulator' : ''}
            </span>
          </span>
        </span>
      </button>
      {blocked ? (
        <p className="t-muted px-4 py-2 text-xs">Popups blocked — playing inline instead. Allow popups for fullscreen tabs.</p>
      ) : (
        <button onClick={() => setInline(true)} className="t-muted block w-full px-4 py-2 text-center text-xs hover:opacity-70">
          Prefer this page? Play here instead →
        </button>
      )}
    </div>
  );
}
