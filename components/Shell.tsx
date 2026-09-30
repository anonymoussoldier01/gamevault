'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CloakProvider } from '@/lib/cloak';
import { ThemeProvider } from '@/lib/theme';
import { Header } from './Header';
import { Footer } from './Footer';
import { SearchPalette } from './SearchPalette';
import { CATEGORY_META, games } from '@/lib/games';

const MAIN_LINKS: Array<[string, string, string]> = [
  ['🏠', 'Home', '/'],
  ['🕘', 'Recently played', '/recent'],
  ['⚡', 'New', '/new'],
  ['🔥', 'Hot Games', '/charts'],
  ['👯', 'Multiplayer', '/collection/with-friends'],
];

const TOOL_LINKS: Array<[string, string, string]> = [
  ['📱', 'Apps', '/apps'],
  ['🌐', 'Proxy', '/proxy'],
  ['🎰', 'Arcade', '/arcade'],
  ['🧭', 'Browse', '/browse'],
  ['📣', 'Social', '/social'],
  ['📖', 'Guestbook', '/guestbook'],
  ['⚙️', 'Settings', '/settings'],
];

function Sidebar() {
  const path = usePathname();
  const cats = Array.from(new Set(games.map((g) => g.category))).sort();
  const link = (emoji: string, label: string, href: string) => (
    <Link
      key={href}
      href={href}
      className="side-link"
      style={path === href ? { background: 'var(--surface2)', color: 'var(--ink)' } : undefined}
      aria-current={path === href ? 'page' : undefined}
    >
      <span aria-hidden>{emoji}</span> {label}
    </Link>
  );
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r px-3 py-4 lg:flex" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }} aria-label="Site">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2" aria-label="GameVault home">
        <span className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }} aria-hidden>
          ◢
        </span>
        <span className="font-display text-lg font-bold tracking-tight">
          GAMEVAULT<span className="hud ml-1.5" style={{ color: 'var(--accent)' }}>//ARCADE</span>
        </span>
      </Link>
      <nav className="space-y-0.5">
        {MAIN_LINKS.map(([e, l, h]) => link(e, l, h))}
      </nav>
      <div className="t-faint px-3 pb-1 pt-4 text-xs font-bold uppercase">Categories</div>
      <nav className="space-y-0.5">
        <Link
          href="/games"
          className="side-link"
          style={path === '/games' ? { background: 'var(--surface2)', color: 'var(--ink)' } : undefined}
          aria-current={path === '/games' ? 'page' : undefined}
        >
          <span aria-hidden>🎮</span> All Games
        </Link>
        {cats.map((c) => (
          <Link
            key={c}
            href={`/category/${c}`}
            className="side-link"
            style={path === `/category/${c}` ? { background: 'var(--surface2)', color: 'var(--ink)' } : undefined}
            aria-current={path === `/category/${c}` ? 'page' : undefined}
          >
            <span aria-hidden>{CATEGORY_META[c]?.emoji ?? '🎮'}</span> {CATEGORY_META[c]?.label ?? c}
          </Link>
        ))}
      </nav>
      <div className="t-faint px-3 pb-1 pt-4 text-xs font-bold uppercase">More</div>
      <nav className="space-y-0.5">
        {TOOL_LINKS.map(([e, l, h]) => link(e, l, h))}
      </nav>
      <div className="mt-auto space-y-2 pt-4">
        <div className="flex gap-1 px-3">
          <Link href="/social" className="side-link !px-2" aria-label="YouTube">▶️</Link>
          <Link href="/social" className="side-link !px-2" aria-label="TikTok">🎵</Link>
          <Link href="/social" className="side-link !px-2" aria-label="Discord">💬</Link>
          <Link href="/social" className="side-link !px-2" aria-label="More social">＋</Link>
        </div>
        <div className="t-faint flex flex-wrap gap-x-3 gap-y-1 px-3 text-xs">
          <Link href="/terms" className="hover:opacity-70">Terms</Link>
          <Link href="/dmca" className="hover:opacity-70">DMCA</Link>
          <Link href="/privacy" className="hover:opacity-70">Privacy</Link>
          <Link href="/bookmarklets" className="hover:opacity-70">Bookmarklets</Link>
        </div>
        <div className="t-faint px-3 pt-1 text-xs">© 2026 GameVault</div>
      </div>
    </aside>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    let anti = false;
    try {
      anti = localStorage.getItem('v1:anti-close') === 'on';
    } catch {}
    if (!anti) return;
    const onBefore = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, []);

  return (
    <CloakProvider>
      <ThemeProvider>
        <div className="flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <Header onSearchOpen={() => setSearchOpen(true)} />
            <main className="mx-auto min-h-[70vh] w-full max-w-[1400px] px-4 pb-24 pt-6 sm:pb-10">
              {children}
            </main>
            <Footer />
          </div>
        </div>
        <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      </ThemeProvider>
    </CloakProvider>
  );
}
