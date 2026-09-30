'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PROXY_FRONTS, getHealth, type Health } from '@/lib/proxy';
const CLASSICS = [
  { name: 'CroxyProxy', url: 'https://www.croxyproxy.com/', note: 'Free web proxy, video support' },
  { name: 'ProxySite', url: 'https://www.proxysite.com/', note: 'Multiple server locations' },
  { name: 'hide.me Proxy', url: 'https://hide.me/en/proxy', note: 'No signup, privacy-focused' },
  { name: 'KProxy', url: 'https://kproxy.com/', note: '10 free servers' },
  { name: '4everproxy', url: 'https://www.4everproxy.com/', note: 'Many locations, free' },
  { name: 'GenMirror', url: 'https://www.genmirror.com/', note: 'Simple YouTube-friendly proxy' },
];

function stealthOpen(url: string) {
  const w = window.open('about:blank', '_blank');
  if (!w) return;
  w.document.write(
    `<html><head><title>Google Classroom</title><link rel="icon" href="${location.origin}/icons/canvas.png"></head>` +
      `<body style="margin:0;height:100vh"><iframe src="${url}" style="width:100%;height:100%;border:none"></iframe></body></html>`,
  );
  w.document.close();
}

export function ProxyClient() {
  const [custom, setCustom] = useState('');
  const [health, setHealth] = useState<Record<string, Health>>({});
  useEffect(() => {
    setHealth(getHealth());
  }, []);
  const goCustom = () => {
    let url = custom.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    stealthOpen(url);
  };
  return (
    <div>
      <div className="surface mt-4 flex gap-2 rounded-2xl p-3">
        <Link href="/browse" className="btn-primary flex-1 !py-2.5 text-center text-sm">
          🧭 Open Proxy Browser
        </Link>
        <Link href="/arcade" className="btn-ghost flex-1 !py-2.5 text-center text-sm">
          🌐 Proxy Arcade
        </Link>
        <Link href="/settings" className="btn-ghost flex-1 !py-2.5 text-center text-sm">
          ⚙️ Backends
        </Link>
      </div>
      <div className="surface mt-4 flex flex-col gap-2 rounded-2xl p-4 sm:flex-row">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') goCustom(); }}
          placeholder="Paste any URL to open it in a stealth tab…"
          className="surface2 w-full rounded-full px-4 py-2.5 text-sm outline-none"
          aria-label="Custom URL"
        />
        <button onClick={goCustom} className="btn-primary shrink-0 !px-5 !py-2.5 text-sm">
          🥷 Open stealth
        </button>
      </div>
      <h2 className="font-display mt-8 text-xl font-bold">🚀 Proxy networks <span className="t-faint text-sm font-semibold">(pick one, deep-links included)</span></h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {PROXY_FRONTS.map((f) => (
          <div key={f.id} className="surface rounded-2xl p-4">
            <div className="font-display text-lg font-bold">{f.label}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {f.apps.map((a) => (
                <span key={a} className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: 'var(--surface2)' }}>
                  ✓ {a}
                </span>
              ))}
            </div>
            <div className="t-faint mt-1 truncate text-xs">{f.home}</div>
            <div className="mt-3 flex gap-2">
              <a href={f.home} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-4 !py-2 text-sm">
                Open →
              </a>
              <button onClick={() => stealthOpen(f.home)} className="btn-ghost !px-4 !py-2 text-sm">
                🥷 Stealth
              </button>
            </div>
          </div>
        ))}
      </div>
      <h2 className="font-display mt-8 text-xl font-bold">🔧 Classic proxies</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {CLASSICS.map((p) => (
          <div key={p.name} className="surface rounded-2xl p-4">
            <div className="font-display text-lg font-bold">🌐 {p.name}</div>
            <div className="t-muted mt-0.5 text-sm">{p.note}</div>
            <div className="mt-3 flex gap-2">
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-4 !py-2 text-sm">
                Open →
              </a>
              <button onClick={() => stealthOpen(p.url)} className="btn-ghost !px-4 !py-2 text-sm">
                🥷 Stealth
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="surface mt-6 rounded-2xl p-4 text-xs leading-relaxed t-muted">
        <span className="font-bold">Safety first:</span> proxies are run by third parties who can see your traffic —
        never enter school, email, or bank passwords through one. Availability changes daily; if one fails, try the
        next or switch your backend in Settings. You must follow your school/network policy and each service’s terms.
        <span className="t-faint"> Health last checked: {Object.keys(health).length ? 'see Browse page' : 'never — open Browse to check'}.</span>
      </div>
    </div>
  );
}
