'use client';

import { useState } from 'react';
import { PROXY_FRONTS, frontPlayUrl } from '@/lib/proxy';
import { PROXY_GAMES } from '@/lib/proxy-games';

function stealthOpen(url: string) {
  const w = window.open('about:blank', '_blank');
  if (!w) return;
  w.document.write(
    `<html><head><title>Google Classroom</title><link rel="icon" href="${location.origin}/icons/canvas.png"></head>` +
      `<body style="margin:0;height:100vh"><iframe src="${url}" style="width:100%;height:100%;border:none"></iframe></body></html>`,
  );
  w.document.close();
}

export function ArcadeClient() {
  const [frontId, setFrontId] = useState(PROXY_FRONTS[0].id);
  const [copied, setCopied] = useState<string | null>(null);
  const front = PROXY_FRONTS.find((f) => f.id === frontId) ?? PROXY_FRONTS[0];

  const copy = async (slug: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(slug);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <div>
      <div className="surface mt-4 flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <span className="text-sm font-bold">Play with:</span>
        <select
          value={frontId}
          onChange={(e) => setFrontId(e.target.value)}
          className="surface2 rounded-full px-3 py-2 text-sm font-bold outline-none"
          aria-label="Proxy frontend"
        >
          {PROXY_FRONTS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
        <span className="t-faint text-xs">Links open the frontend — paste the target if it doesn’t auto-load.</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PROXY_GAMES.map((g) => (
          <div key={g.slug} className="surface rounded-2xl p-4">
            <div className="font-display text-lg font-bold">{g.emoji} {g.title}</div>
            <div className="t-muted mt-0.5 text-sm">{g.blurb}</div>
            <div className="mt-1">
              <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: 'var(--surface2)' }}>
                🌐 {g.badge}
              </span>
            </div>
            <div className="t-faint mt-1 truncate text-xs">{g.target}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.kind === 'linkout' ? (
                <a href={g.target} target="_blank" rel="noopener noreferrer" className="btn-primary !px-4 !py-2 text-sm">
                  Open site →
                </a>
              ) : (
                <>
                  <a href={frontPlayUrl(front, g.target)} target="_blank" rel="noopener noreferrer" className="btn-primary !px-4 !py-2 text-sm">
                    ▶ Play via {front.label}
                  </a>
                  <button onClick={() => stealthOpen(frontPlayUrl(front, g.target))} className="btn-ghost !px-4 !py-2 text-sm">
                    🥷 Stealth
                  </button>
                </>
              )}
              <button onClick={() => copy(g.slug, g.target)} className="btn-ghost !px-4 !py-2 text-sm">
                {copied === g.slug ? '✓ Copied' : '📋 URL'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="t-faint mt-6 text-xs leading-relaxed">
        Proxy-wrapped games depend on the third-party frontend you pick — if one fails, try another or change
        your backend in Settings. Logins, saves, and voice chat often break through proxies; single-player works best.
      </p>
    </div>
  );
}
