import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="font-display text-lg font-bold">🕹️ GameVault</div>
          <p className="t-muted mt-2 max-w-md text-sm">
            Your home for free online games. No download, no subscription — just instant fun in your browser.
          </p>
          <p className="surface2 mt-3 rounded-xl p-3 text-xs leading-relaxed t-muted">
            Disclaimer: GameVault hosts no game files. All games belong to their respective owners and are
            embedded from third-party sources. Contact us for removal via <Link href="/dmca" className="underline">/dmca</Link>.
          </p>
        </div>
        <div>
          <div className="text-sm font-bold">Games</div>
          <ul className="t-muted mt-2 space-y-1 text-sm">
            <li><Link href="/#trending" className="hover:opacity-70">🔥 Trending</Link></li>
            <li><Link href="/search" className="hover:opacity-70">🔍 Search</Link></li>
            <li><Link href="/random" className="hover:opacity-70">🎲 Random</Link></li>
            <li><Link href="/games" className="hover:opacity-70">🎮 All games</Link></li>
            <li><Link href="/charts" className="hover:opacity-70">🏆 Charts</Link></li>
            <li><Link href="/categories" className="hover:opacity-70">📂 Categories</Link></li>
            <li><Link href="/apps" className="hover:opacity-70">📱 Apps</Link></li>
            <li><Link href="/proxy" className="hover:opacity-70">🌐 Proxy</Link></li>
            <li><Link href="/guestbook" className="hover:opacity-70">📖 Guestbook</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-bold">Info</div>
          <ul className="t-muted mt-2 space-y-1 text-sm">
            <li><Link href="/terms" className="hover:opacity-70">Terms</Link></li>
            <li><Link href="/dmca" className="hover:opacity-70">DMCA</Link></li>
            <li><Link href="/privacy" className="hover:opacity-70">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="t-faint border-t py-4 text-center text-xs" style={{ borderColor: 'var(--line)' }}>
        © 2026 GameVault. All games are property of their respective owners. · <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link>
      </div>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur sm:hidden"
        style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--surface) 92%, transparent)' }}
        aria-label="Mobile"
      >
        <div className="grid grid-cols-4 text-center text-[11px]">
          <Link href="/" className="py-2.5">🏠<br />Home</Link>
          <Link href="/search" className="py-2.5">🔍<br />Search</Link>
          <Link href="/random" className="py-2.5">🎲<br />Random</Link>
          <Link href="/category/action" className="py-2.5">📂<br />Cats</Link>
        </div>
      </nav>
    </footer>
  );
}
