'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCloak, CLOAKS, type CloakMode } from '@/lib/cloak';
import { useTheme } from '@/lib/theme';

export function Header({ onSearchOpen }: { onSearchOpen: () => void }) {
  const { mode, setMode, panic, stealth } = useCloak();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onSearchOpen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSearchOpen]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 border-b transition"
      style={{
        borderColor: 'var(--line)',
        background: scrolled ? 'color-mix(in srgb, var(--surface) 88%, transparent)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : undefined,
      }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-3 sm:gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 lg:hidden" aria-label="GameVault home">
          <span className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }} aria-hidden>
            ◢
          </span>
        </Link>

        <button
          onClick={onSearchOpen}
          className="chip mx-auto hidden w-full max-w-md flex-1 sm:flex"
          style={{ justifyContent: 'flex-start', padding: '9px 16px' }}
          aria-label="Search games"
        >
          <span aria-hidden>🔍</span>
          <span className="t-faint flex-1 text-left font-semibold">What are you playing today?</span>
          <kbd className="t-faint rounded px-1.5 text-xs">⌘K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <Link href="/random" className="icon-btn" title="Random game" aria-label="Random game">
            🎲
          </Link>
          <button onClick={toggle} className="icon-btn" title="Toggle dark mode" aria-label="Toggle dark mode">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="icon-btn"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              ⋯
            </button>
            {menuOpen && (
              <div
                className="surface absolute right-0 top-12 z-50 w-60 rounded-2xl p-2"
                style={{ boxShadow: 'var(--card-shadow-hover)' }}
                role="menu"
              >
                <div className="t-faint px-3 pb-1 pt-2 text-xs font-bold uppercase">Tab cloak</div>
                {(Object.keys(CLOAKS) as CloakMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold hover:opacity-80"
                    style={mode === m ? { background: 'var(--surface2)' } : undefined}
                    role="menuitem"
                  >
                    {m === 'normal' ? '🟣' : m === 'canvas' ? '🎓' : m === 'classroom' ? '📚' : m === 'drive' ? '💾' : '🔎'}{' '}
                    {m === 'normal' ? 'Vault' : m.charAt(0).toUpperCase() + m.slice(1)}
                    {mode === m && <span aria-hidden>✓</span>}
                  </button>
                ))}
                <div className="my-1 border-t" style={{ borderColor: 'var(--line)' }} />
                <button
                  onClick={() => { stealth(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold"
                  role="menuitem"
                >
                  🥷 Stealth tab
                </button>
                <button
                  onClick={() => { panic(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold"
                  style={{ color: 'var(--coral)' }}
                  role="menuitem"
                >
                  🚨 Panic (Esc)
                </button>
                <div className="my-1 border-t" style={{ borderColor: 'var(--line)' }} />
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold"
                  role="menuitem"
                >
                  ⚙️ Settings
                </Link>
                <Link
                  href="/bookmarklets"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold"
                  role="menuitem"
                >
                  🔖 Bookmarklets
                </Link>
                <Link
                  href="/dmca"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold"
                  role="menuitem"
                >
                  🛡️ DMCA
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto hidden max-w-[1400px] items-center gap-1 overflow-x-auto px-4 pb-2 md:flex" aria-label="Sections">
        {[
          ['Games', '/games'],
          ['Charts', '/charts'],
          ['Categories', '/categories'],
          ['Apps', '/apps'],
          ['Proxy', '/proxy'],
          ['Arcade', '/arcade'],
          ['Browse', '/browse'],
          ['Social', '/social'],
          ['Guestbook', '/guestbook'],
        ].map(([label, href]) => (
          <Link key={href} href={href} className="t-muted rounded-full px-3 py-1 text-sm font-bold hover:opacity-70">
            {label}
          </Link>
        ))}
      </div>
      <div className="mx-auto max-w-[1400px] px-4 pb-3 sm:hidden">
        <button onClick={onSearchOpen} className="chip flex w-full" style={{ justifyContent: 'flex-start' }} aria-label="Search games">
          <span aria-hidden>🔍</span>
          <span className="t-faint font-semibold">Search games…</span>
        </button>
      </div>
    </header>
  );
}
