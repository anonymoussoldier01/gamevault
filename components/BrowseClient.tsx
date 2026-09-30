'use client';

import { useEffect, useState } from 'react';
import {
  PROXY_FRONTS, frontPlayUrl, getEngine, setEngine, allBackends, getHealth, refreshHealth,
  type ProxyEngine, type Health,
} from '@/lib/proxy';

function stealthOpen(url: string) {
  const w = window.open('about:blank', '_blank');
  if (!w) return;
  w.document.write(
    `<html><head><title>Google Classroom</title><link rel="icon" href="${location.origin}/icons/canvas.png"></head>` +
      `<body style="margin:0;height:100vh"><iframe src="${url}" style="width:100%;height:100%;border:none"></iframe></body></html>`,
  );
  w.document.close();
}

export function BrowseClient() {
  const [url, setUrl] = useState('');
  const [frontId, setFrontId] = useState(PROXY_FRONTS[0].id);
  const [engine, setEng] = useState<ProxyEngine>('scramjet');
  const [health, setHealth] = useState<Record<string, Health>>({});
  const [checking, setChecking] = useState(false);
  const front = PROXY_FRONTS.find((f) => f.id === frontId) ?? PROXY_FRONTS[0];

  useEffect(() => {
    setEng(getEngine());
    setHealth(getHealth());
  }, []);

  const go = (stealth: boolean) => {
    let target = url.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) {
      if (target.includes('.') && !target.includes(' ')) target = 'https://' + target;
      else {
        let eng = 'https://www.google.com/search?q=';
        try {
          const id = localStorage.getItem('v1:search-engine') || 'google';
          if (id === 'ddg') eng = 'https://duckduckgo.com/?q=';
          else if (id === 'bing') eng = 'https://www.bing.com/search?q=';
        } catch {}
        target = eng + encodeURIComponent(target);
      }
    }
    const play = frontPlayUrl(front, target);
    if (stealth) stealthOpen(play);
    else window.open(play, '_blank', 'noopener');
  };

  const recheck = async () => {
    setChecking(true);
    setHealth(await refreshHealth());
    setChecking(false);
  };

  return (
    <div>
      <div className="surface mt-4 rounded-2xl p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') go(false); }}
            placeholder="URL or search…"
            className="surface2 w-full rounded-full px-4 py-2.5 text-sm outline-none"
            aria-label="URL to browse"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex shrink-0 gap-2">
            <button onClick={() => go(false)} className="btn-primary !px-5 !py-2.5 text-sm">Go →</button>
            <button onClick={() => go(true)} className="btn-ghost !px-4 !py-2.5 text-sm">🥷</button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="t-muted font-bold">Via:</span>
          <select value={frontId} onChange={(e) => setFrontId(e.target.value)} className="surface2 rounded-full px-3 py-1.5 text-sm font-bold outline-none" aria-label="Frontend">
            {PROXY_FRONTS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <span className="t-muted font-bold">Engine:</span>
          {(['scramjet', 'ultraviolet', 'rammerhead'] as ProxyEngine[]).map((e) => (
            <button
              key={e}
              onClick={() => { setEngine(e); setEng(e); }}
              className="chip !py-1 text-xs"
              style={engine === e ? { background: 'var(--blue)', color: 'var(--blue-ink)', borderColor: 'var(--blue)' } : undefined}
              aria-pressed={engine === e}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="surface mt-4 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="font-bold">Backend health</div>
          <button onClick={recheck} disabled={checking} className="btn-ghost !px-4 !py-1.5 text-sm">
            {checking ? 'Checking…' : '↻ Check now'}
          </button>
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {allBackends().map((b) => {
            const h = health[b.id];
            const fresh = h && Date.now() - h.at < 10 * 60 * 1000;
            return (
              <div key={b.id} className="flex items-center gap-2 text-sm">
                <span aria-hidden>{!h || !fresh ? '⚪' : h.ok ? '🟢' : '🔴'}</span>
                <span className="font-bold">{b.label}</span>
                <span className="t-faint text-xs">{b.engine} · {fresh ? `${h.ms}ms` : 'unchecked'}</span>
              </div>
            );
          })}
        </div>
        <p className="t-faint mt-2 text-xs">Public backends are rate-limited demos with no SLA — add your own in Settings.</p>
      </div>
    </div>
  );
}
