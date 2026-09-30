'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { searchGames } from '@/lib/games';
import { getSearchHistory as hist, pushSearchHistory as saveHist } from '@/lib/storage';
import { launchGame } from '@/lib/launch';
import { ThumbImg } from './ThumbImg';
import { PlayLink } from './PlayLink';

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [hi, setHi] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => searchGames(q, 10), [q]);
  const safeHi = results.length ? Math.min(hi, results.length - 1) : 0;

  useEffect(() => {
    if (open) {
      setQ('');
      setHi(0);
      setHistory(hist());
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open ]);

  // focus trap + return focus
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && boxRef.current) {
        const els = boxRef.current.querySelectorAll<HTMLElement>('input, a, button, kbd[tabindex]');
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); setHi((i) => Math.min(i + 1, Math.max(results.length - 1, 0))); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setHi((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') {
        if (results[safeHi]) {
          const ok = launchGame(results[safeHi]);
          if (!ok) window.location.href = `/play/${results[safeHi].slug}?inline=1`;
        } else if (q.trim()) {
          saveHist(q);
          window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      prev?.focus?.();
    };
  }, [open, results, safeHi, onClose, q]);

  if (!open) return null;

  const submit = (query: string) => {
    saveHist(query);
    window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Search games">
      <div ref={boxRef} className="surface mt-20 w-full max-w-lg overflow-hidden rounded-2xl" style={{ boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b p-4" style={{ borderColor: 'var(--line)' }}>
          <span aria-hidden>🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setHi(0); }}
            placeholder="Search 870+ games… (slope, fnaf, moto)"
            className="w-full bg-transparent text-sm outline-none"
            aria-label="Search games"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <kbd className="t-faint rounded px-1.5 text-xs">esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {q.trim() === '' && history.length > 0 && (
            <div className="p-2">
              <div className="t-faint px-1 pb-1 text-xs font-bold uppercase">Recent searches</div>
              <div className="flex flex-wrap gap-1.5">
                {history.map((h) => (
                  <button key={h} onClick={() => submit(h)} className="chip !py-1 text-xs">
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
          {q.trim() === '' && history.length === 0 && (
            <div className="t-muted p-3 text-sm">
              Try <Link href="/play/slope" className="underline">Slope</Link>,{' '}
              <Link href="/play/subway" className="underline">Subway Surfers</Link>,{' '}
              <Link href="/play/fnaf1" className="underline">FNAF</Link>… or{' '}
              <Link href="/search" className="underline">browse all →</Link>
            </div>
          )}
          {q.trim() !== '' && results.length === 0 && (
            <div className="t-muted p-4 text-sm">
              No matches for “{q}”. <button className="underline" onClick={() => submit(q)}>Search all →</button>
            </div>
          )}
          {results.map((g, i) => (
            <div key={g.slug} onMouseEnter={() => setHi(i)}>
              <PlayLink
                game={g}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm"
                style={i === safeHi ? { background: 'var(--surface2)' } : undefined}
                label={`Play ${g.title}`}
              >
                <span className="surface2 relative h-10 w-16 shrink-0 overflow-hidden rounded-lg">
                  {g.thumb && <ThumbImg src={g.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                </span>
                <span className="font-bold">{g.title}</span>
                <span className="t-faint ml-auto text-xs capitalize">{g.category}</span>
              </PlayLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
