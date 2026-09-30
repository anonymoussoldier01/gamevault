'use client';

import { useEffect, useState } from 'react';
import { useCloak, CLOAKS, type CloakMode } from '@/lib/cloak';
import {
  CURATED_BACKENDS, allBackends, getCustomBackends, addCustomBackend, removeCustomBackend,
  getEngine, setEngine, getHealth, refreshHealth, type Backend, type ProxyEngine, type Health,
} from '@/lib/proxy';
import { getReports } from '@/lib/storage';

const ENGINES: ProxyEngine[] = ['scramjet', 'ultraviolet', 'rammerhead'];
const SEARCHES = [
  { id: 'google', label: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'ddg', label: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { id: 'bing', label: 'Bing', url: 'https://www.bing.com/search?q=' },
];

function lsGet(k: string, fb: string): string {
  try {
    return localStorage.getItem(k) ?? fb;
  } catch {
    return fb;
  }
}
function lsSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {}
}

export function SettingsClient() {
  const { mode, setMode } = useCloak();
  const [engine, setEng] = useState<ProxyEngine>('scramjet');
  const [custom, setCustom] = useState<Backend[]>([]);
  const [health, setHealth] = useState<Record<string, Health>>({});
  const [checking, setChecking] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [searchEng, setSearchEng] = useState('google');
  const [panicKey, setPanicKey] = useState('Escape');
  const [antiClose, setAntiClose] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setEng(getEngine());
    setCustom(getCustomBackends());
    setHealth(getHealth());
    setSearchEng(lsGet('v1:search-engine', 'google'));
    setPanicKey(lsGet('gv-panickey', 'Escape'));
    setAntiClose(lsGet('v1:anti-close', 'off') === 'on');
  }, []);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2000);
  };

  const addBackend = () => {
    const url = newUrl.trim();
    if (!url) return;
    const isWs = url.startsWith('wss://');
    const b: Backend = {
      id: `custom-${Date.now()}`,
      label: newLabel.trim() || url,
      engine,
      transport: isWs ? 'epoxy' : 'bare',
      ...(isWs ? { wisp: url } : { bare: url }),
    };
    addCustomBackend(b);
    setCustom(getCustomBackends());
    setNewLabel('');
    setNewUrl('');
    flash('Backend added');
  };

  const recheck = async () => {
    setChecking(true);
    setHealth(await refreshHealth());
    setChecking(false);
  };

  const downloadData = () => {
    const dump: Record<string, string | null> = {};
    const keys = ['gv-theme', 'gv-cloak', 'gv-panickey', 'v1:favs', 'v1:recent', 'v1:ratings', 'v1:notes', 'v1:likes', 'v1:search-history', 'v1:guestbook', 'v1:px-engine', 'v1:px-custom', 'v1:search-engine'];
    for (const k of keys) {
      try {
        dump[k] = localStorage.getItem(k);
      } catch {
        dump[k] = null;
      }
    }
    const blob = new Blob([JSON.stringify(dump, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gamevault-data.json';
    a.click();
    flash('Data downloaded');
  };

  const uploadData = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const dump = JSON.parse(String(r.result));
        for (const [k, v] of Object.entries(dump)) {
          if (typeof v === 'string') {
            try {
              localStorage.setItem(k, v);
            } catch {}
          }
        }
        flash('Data restored — reloading…');
        setTimeout(() => location.reload(), 800);
      } catch {
        flash('Invalid backup file');
      }
    };
    r.readAsText(f);
  };

  const wipeData = () => {
    if (!confirm('Wipe all GameVault data in this browser?')) return;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('v1:') || k.startsWith('gv-'))) localStorage.removeItem(k);
    }
    flash('Wiped — reloading…');
    setTimeout(() => location.reload(), 800);
  };

  const exportReports = () => {
    const reps = getReports();
    if (!reps.length) { flash('No reports yet'); return; }
    const blob = new Blob([JSON.stringify(reps, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gamevault-reports.json';
    a.click();
  };

  return (
    <div className="space-y-4">
      {msg && (
        <div className="surface rounded-2xl p-3 text-sm font-bold" role="status">
          ✓ {msg}
        </div>
      )}
      <section className="surface rounded-2xl p-4">
        <h2 className="font-display text-lg font-bold">🌐 Proxy engine</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {ENGINES.map((e) => (
            <button
              key={e}
              onClick={() => { setEngine(e); setEng(e); }}
              className="chip"
              style={engine === e ? { background: 'var(--blue)', color: 'var(--blue-ink)', borderColor: 'var(--blue)' } : undefined}
              aria-pressed={engine === e}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          {allBackends().map((b) => {
            const h = health[b.id];
            const fresh = h && Date.now() - h.at < 10 * 60 * 1000;
            const isCustom = custom.some((c) => c.id === b.id);
            return (
              <div key={b.id} className="flex items-center gap-2 text-sm">
                <span aria-hidden>{!h || !fresh ? '⚪' : h.ok ? '🟢' : '🔴'}</span>
                <span className="font-bold">{b.label}</span>
                <span className="t-faint truncate text-xs">{b.wisp ?? b.bare ?? b.frontend}</span>
                {isCustom && (
                  <button onClick={() => { removeCustomBackend(b.id); setCustom(getCustomBackends()); }} className="t-faint ml-auto text-xs hover:opacity-70" aria-label={`Remove ${b.label}`}>
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label (optional)" className="surface2 rounded-full px-3 py-2 text-sm outline-none sm:w-40" aria-label="Backend label" />
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="wss://… or https://… bare URL" className="surface2 w-full rounded-full px-3 py-2 text-sm outline-none" aria-label="Backend URL" />
          <button onClick={addBackend} className="btn-primary shrink-0 !px-4 !py-2 text-sm">Add</button>
          <button onClick={recheck} disabled={checking} className="btn-ghost shrink-0 !px-4 !py-2 text-sm">
            {checking ? 'Checking…' : '↻ Health'}
          </button>
        </div>
        <p className="t-faint mt-2 text-xs">Curated: {CURATED_BACKENDS.map((b) => b.label).join(' · ')}. Demos are rate-limited — your own backend wins.</p>
      </section>

      <section className="surface rounded-2xl p-4">
        <h2 className="font-display text-lg font-bold">🔍 Search engine (proxy browser)</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {SEARCHES.map((s) => (
            <button
              key={s.id}
              onClick={() => { lsSet('v1:search-engine', s.id); setSearchEng(s.id); flash(`Search: ${s.label}`); }}
              className="chip"
              style={searchEng === s.id ? { background: 'var(--blue)', color: 'var(--blue-ink)', borderColor: 'var(--blue)' } : undefined}
              aria-pressed={searchEng === s.id}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="surface rounded-2xl p-4">
        <h2 className="font-display text-lg font-bold">🎓 Cloak & panic</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="t-muted font-bold">Disguise as:</span>
          {(Object.keys(CLOAKS) as CloakMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="chip !py-1 text-xs"
              style={mode === m ? { background: 'var(--blue)', color: 'var(--blue-ink)', borderColor: 'var(--blue)' } : undefined}
              aria-pressed={mode === m}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="t-muted font-bold">Panic key:</span>
          <input
            value={panicKey}
            onChange={(e) => { setPanicKey(e.target.value); lsSet('gv-panickey', e.target.value || 'Escape'); }}
            placeholder="Escape"
            maxLength={12}
            className="surface2 w-32 rounded-full px-3 py-1.5 text-sm outline-none"
            aria-label="Panic key"
          />
          <span className="t-faint text-xs">+ backtick always panics</span>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={antiClose}
            onChange={(e) => { setAntiClose(e.target.checked); lsSet('v1:anti-close', e.target.checked ? 'on' : 'off'); }}
          />
          🛡️ Anti-close (confirm before leaving a game)
        </label>
      </section>

      <section className="surface rounded-2xl p-4">
        <h2 className="font-display text-lg font-bold">💾 Your data</h2>
        <p className="t-muted mt-1 text-sm">Favorites, recents, ratings, notes, guestbook — all local. Back it up or wipe it.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={downloadData} className="btn-ghost !px-4 !py-2 text-sm">⬇ Download backup</button>
          <label className="btn-ghost cursor-pointer !px-4 !py-2 text-sm">
            ⬆ Restore backup
            <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadData(f); }} />
          </label>
          <button onClick={wipeData} className="btn-ghost !px-4 !py-2 text-sm" style={{ color: 'var(--coral)' }}>🗑 Wipe all</button>
          <button onClick={exportReports} className="btn-ghost !px-4 !py-2 text-sm">⚠️ Export broken-game reports</button>
        </div>
      </section>
    </div>
  );
}

export const SEARCH_ENGINES = SEARCHES;
