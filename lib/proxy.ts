'use client';

// User-changeable proxy backend (Interstellar/Holy-Unblocker pattern, localStorage).
// Engines: scramjet | ultraviolet | rammerhead. No backend of ours — curated
// public endpoints + user override, health-checked with auto-failover.

export type ProxyEngine = 'scramjet' | 'ultraviolet' | 'rammerhead';

export interface Backend {
  id: string;
  label: string;
  engine: ProxyEngine;
  transport: 'epoxy' | 'libcurl' | 'bare';
  wisp?: string;
  bare?: string;
  frontend?: string;
}

export const CURATED_BACKENDS: Backend[] = [
  { id: 'mw-wisp', label: 'Mercury Demo (Wisp)', engine: 'scramjet', transport: 'epoxy', wisp: 'wss://wisp.mercurywork.shop/' },
  { id: 'hu-bare', label: 'Holy Unblocker (Bare)', engine: 'ultraviolet', transport: 'bare', bare: 'https://uv.holyubofficial.net/' },
  { id: 'tomp-bare', label: 'Tomp (Bare)', engine: 'ultraviolet', transport: 'bare', bare: 'https://tomp.app/' },
  { id: 'rh-demo', label: 'Rammerhead Demo', engine: 'rammerhead', transport: 'bare', frontend: 'https://demo-opensource.rammerhead.org' },
];

const K_ENGINE = 'v1:px-engine';
const K_CUSTOM = 'v1:px-custom';
const K_HEALTH = 'v1:px-health';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getEngine(): ProxyEngine {
  return read<ProxyEngine>(K_ENGINE, 'scramjet');
}
export function setEngine(e: ProxyEngine) {
  write(K_ENGINE, e);
}

export function getCustomBackends(): Backend[] {
  return read<Backend[]>(K_CUSTOM, []);
}
export function addCustomBackend(b: Backend) {
  const all = [b, ...getCustomBackends().filter((x) => x.id !== b.id)].slice(0, 10);
  write(K_CUSTOM, all);
}
export function removeCustomBackend(id: string) {
  write(K_CUSTOM, getCustomBackends().filter((x) => x.id !== id));
}

export function allBackends(): Backend[] {
  const custom = getCustomBackends();
  const ids = new Set(custom.map((b) => b.id));
  return [...custom, ...CURATED_BACKENDS.filter((b) => !ids.has(b.id))];
}

export interface Health {
  id: string;
  ok: boolean;
  ms: number;
  at: number;
}

export function getHealth(): Record<string, Health> {
  return read<Record<string, Health>>(K_HEALTH, {});
}

/** Pre-flight check: bare = GET JSON handshake; wisp = WebSocket open. */
export async function checkBackend(b: Backend, timeoutMs = 6000): Promise<Health> {
  const t0 = Date.now();
  const fail = (): Health => ({ id: b.id, ok: false, ms: Date.now() - t0, at: Date.now() });
  try {
    if (b.bare) {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), timeoutMs);
      const r = await fetch(b.bare, { signal: ctrl.signal });
      clearTimeout(to);
      const t = await r.text();
      const ok = r.ok && /versions|bare/i.test(t);
      return { id: b.id, ok, ms: Date.now() - t0, at: Date.now() };
    }
    if (b.wisp) {
      const ok = await new Promise<boolean>((resolve) => {
        try {
          const ws = new WebSocket(b.wisp!);
          const to = setTimeout(() => { try { ws.close(); } catch {} resolve(false); }, timeoutMs);
          ws.onopen = () => { clearTimeout(to); try { ws.close(); } catch {} resolve(true); };
          ws.onerror = () => { clearTimeout(to); resolve(false); };
        } catch {
          resolve(false);
        }
      });
      return { id: b.id, ok, ms: Date.now() - t0, at: Date.now() };
    }
    if (b.frontend) {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), timeoutMs);
      const r = await fetch(b.frontend, { method: 'HEAD', mode: 'no-cors', signal: ctrl.signal });
      clearTimeout(to);
      return { id: b.id, ok: true, ms: Date.now() - t0, at: Date.now() };
    }
    return fail();
  } catch {
    return fail();
  }
}

export async function refreshHealth(ids?: string[]): Promise<Record<string, Health>> {
  const all = allBackends().filter((b) => !ids || ids.includes(b.id));
  const out = getHealth();
  await Promise.all(
    all.map(async (b) => {
      out[b.id] = await checkBackend(b);
    }),
  );
  write(K_HEALTH, out);
  return out;
}

/** Best backend for an engine: healthy first, fastest first. */
export function pickBackend(engine: ProxyEngine): Backend | null {
  const health = getHealth();
  const cands = allBackends().filter((b) => b.engine === engine);
  cands.sort((a, b) => {
    const ha = health[a.id];
    const hb = health[b.id];
    const sa = ha && Date.now() - ha.at < 10 * 60 * 1000 ? (ha.ok ? 0 : 2) : 1;
    const sb = hb && Date.now() - hb.at < 10 * 60 * 1000 ? (hb.ok ? 0 : 2) : 1;
    if (sa !== sb) return sa - sb;
    return (ha?.ms ?? 9999) - (hb?.ms ?? 9999);
  });
  return cands[0] ?? null;
}

// ---- Frontend deep-links + play-URL builder ----

export interface ProxyFront {
  id: string;
  label: string;
  home: string;
  /** Template with {url} + {enc} placeholders. Frontends vary; copy-target is the fallback. */
  template: string;
  apps: string[];
}

export const PROXY_FRONTS: ProxyFront[] = [
  { id: 'holy', label: 'Holy Unblocker', home: 'https://holyubofficial.net/', template: 'https://holyubofficial.net/?url={url}', apps: ['YouTube', 'Discord', 'Reddit'] },
  { id: 'interstellar', label: 'Interstellar', home: 'https://gointerstellar.app/', template: 'https://gointerstellar.app/?url={url}', apps: ['YouTube', 'now.gg', 'GeForce NOW'] },
  { id: 'doge', label: 'Doge Unblocker', home: 'https://dogesurf.app/app', template: 'https://dogesurf.app/app?url={url}', apps: ['YouTube', 'TikTok'] },
  { id: 'rh-demo', label: 'Rammerhead Demo', home: 'https://demo-opensource.rammerhead.org', template: 'https://demo-opensource.rammerhead.org/', apps: ['YouTube', 'Discord', 'Spotify~'] },
  { id: 'rh-direct', label: 'Rammerhead Direct', home: 'https://direct2.rammerhead.org', template: 'https://direct2.rammerhead.org/', apps: ['YouTube', 'Discord'] },
  { id: 'nebula', label: 'Nebula', home: 'https://nebulaproxy.io/', template: 'https://nebulaproxy.io/?url={url}', apps: ['YouTube', 'Reddit'] },
  { id: 'croxy', label: 'CroxyProxy', home: 'https://www.croxyproxy.com/', template: 'https://www.croxyproxy.com/', apps: ['YouTube', 'TikTok', 'Twitch', 'Instagram'] },
  { id: 'proxysite', label: 'ProxySite', home: 'https://www.proxysite.com/', template: 'https://www.proxysite.com/', apps: ['YouTube'] },
  { id: 'hideme', label: 'hide.me', home: 'https://hide.me/en/proxy', template: 'https://hide.me/en/proxy', apps: ['General browsing'] },
  { id: 'genmirror', label: 'GenMirror', home: 'https://www.genmirror.com/', template: 'https://www.genmirror.com/', apps: ['YouTube'] },
];

/**
 * Best-effort playable link: deep-link template first, else the frontend home
 * (user pastes the copied target). Never pretends an untested combo works.
 */
export function frontPlayUrl(front: ProxyFront, target: string): string {
  return front.template.replace('{url}', encodeURIComponent(target)).replace('{enc}', btoa(unescape(encodeURIComponent(target))).replace(/=+$/, ''));
}
