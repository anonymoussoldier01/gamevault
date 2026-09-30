'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCloak } from '@/lib/cloak';
import { pushRecent } from '@/lib/storage';
import type { Game } from '@/lib/games';

export function GameFrame({ game }: { game: Game }) {
  const [started, setStarted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [slow, setSlow] = useState(false);
  const [fsOK, setFsOK] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { panic } = useCloak();

  useEffect(() => {
    const d = document as Document & { webkitFullscreenEnabled?: boolean };
    setFsOK(!!(document.fullscreenEnabled || d.webkitFullscreenEnabled));
  }, []);

  const goFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else {
      const anyEl = el as unknown as { webkitRequestFullscreen?: () => void };
      if (anyEl.webkitRequestFullscreen) anyEl.webkitRequestFullscreen();
    }
  }, []);


  useEffectFullscreen(setFullscreen);

  const start = useCallback(() => {
    setStarted(true);
    setSlow(false);
    try {
      pushRecent(game.slug);
    } catch {}
    setTimeout(() => setSlow(true), 25000);
  }, [game.slug]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#c=')) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div ref={wrapRef} className="facade-glow relative overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--line)', background: '#000' }}>
        <div className="relative aspect-video w-full">
          {!started ? (
            <button
              onClick={start}
              className="group absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #1a2142, #0e1330)' }}
              aria-label={`Click to load ${game.title}`}
            >
              {game.thumb && (
                <img
                  src={game.thumb}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-50"
                />
              )}
              <span className="relative rounded-full bg-white px-8 py-4 text-lg font-bold text-black shadow-glow transition group-hover:scale-105">
                ▶ Click to Play {game.title}
              </span>
              <span className="relative text-xs text-white/80">
                {game.heavy ? '⚠ Heavy game — loads after click' : 'Instant load • no download'}
                {game.kind === 'ruffle' ? ' • Flash (Ruffle)' : ''}
                {game.kind === 'ejs' ? ' • Emulator (keys + gamepad)' : ''}
              </span>
            </button>
          ) : game.kind === 'ruffle' && game.swfUrl ? (
            <RufflePlayer swf={game.swfUrl} title={game.title} />
          ) : game.kind === 'ejs' && game.ejsGameUrl ? (
            <EmuPlayer game={game} />
          ) : (
            <iframe
              key={game.slug}
              src={game.iframeUrl}
              title={game.title}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="fullscreen; autoplay; gamepad; pointer-lock; clipboard-write; microphone; camera; display-capture; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads"
              loading="lazy"
              onLoad={() => setSlow(false)}
            />
          )}
        </div>
      </div>
      {started && slow && (
        <div className="surface mt-3 rounded-2xl p-3 text-sm">
          <span className="font-bold">Still loading?</span>{' '}
          <span className="t-muted">Heavy games need good WiFi. If it stays black, use ⚠️ Report broken below — it gets fixed in the next sweep.</span>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {fsOK && (
          <button onClick={goFullscreen} className="btn-ghost !px-4 !py-2 text-sm">
            {fullscreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}
          </button>
        )}
        {!started ? (
          <button onClick={start} className="btn-primary !px-4 !py-2 text-sm">
            ▶ Start
          </button>
        ) : (
          <button onClick={() => { setStarted(false); setSlow(false); }} className="btn-ghost !px-4 !py-2 text-sm">
            ↻ Reload
          </button>
        )}
        <button onClick={panic} className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ background: 'var(--coral)' }}>
          🚨 Panic (Esc)
        </button>
      </div>
    </div>
  );
}

function useEffectFullscreen(set: (v: boolean) => void) {
  useEffect(() => {
    const onChange = () => set(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [set]);
}

function RufflePlayer({ swf, title }: { swf: string; title: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@ruffle-rs/ruffle';
    s.async = true;
    s.onerror = () => setFailed(true);
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);
  if (failed) return <EmbedFallback title={title} />;
  return (
    <object data={swf} type="application/x-shockwave-flash" title={title} className="absolute inset-0 h-full w-full bg-[#2D4D4F]">
      <embed src={swf} width="100%" height="100%" />
    </object>
  );
}

function EmuPlayer({ game }: { game: Game }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    const box = document.createElement('div');
    box.id = 'game';
    box.style.cssText = 'width:100%;height:100%';
    el.appendChild(box);
    (window as unknown as Record<string, unknown>).EJS_player = '#game';
    (window as unknown as Record<string, unknown>).EJS_core = game.ejsCore?.includes('melon') ? 'melonds' : 'gba';
    (window as unknown as Record<string, unknown>).EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    (window as unknown as Record<string, unknown>).EJS_gameUrl = game.ejsGameUrl;
    const s = document.createElement('script');
    s.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    s.onerror = () => setFailed(true);
    document.body.appendChild(s);
    return () => {
      s.remove();
      el.innerHTML = '';
    };
  }, [game]);
  if (failed) return <EmbedFallback title={game.title} />;
  return (
    <div className="absolute inset-0 bg-black">
      <div ref={ref} className="h-full w-full" />
      <p className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[11px] text-zinc-300">
        Emulator: click inside, use keyboard. ROM © its owner — removal on request (/dmca).
      </p>
    </div>
  );
}

function EmbedFallback({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black p-6 text-center">
      <div className="text-4xl">🔧</div>
      <div className="font-bold text-white">{title} failed to load</div>
      <p className="max-w-sm text-sm text-zinc-400">
        The player library did not load. Check your connection and reload — or report it below and it gets fixed.
      </p>
    </div>
  );
}
