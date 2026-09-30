'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type CloakMode = 'normal' | 'classroom' | 'drive' | 'canvas' | 'google';

const CLOAKS: Record<CloakMode, { title: string; icon: string }> = {
  normal: { title: 'GameVault — Play 620+ Free Online Games', icon: '/icons/vault.png' },
  classroom: { title: 'Google Classroom', icon: '/icons/canvas.png' },
  drive: { title: 'My Drive - Google Drive', icon: '/icons/canvas.png' },
  canvas: { title: 'Dashboard', icon: '/icons/canvas.png' },
  google: { title: 'Google', icon: '/icons/canvas.png' },
};

const PANIC_URL = 'https://classroom.google.com/';

interface CloakCtx {
  mode: CloakMode;
  setMode: (m: CloakMode) => void;
  panic: () => void;
  stealth: () => void;
}

const Ctx = createContext<CloakCtx>({ mode: 'normal', setMode: () => {}, panic: () => {}, stealth: () => {} });

export function useCloak() {
  return useContext(Ctx);
}

function applyCloak(mode: CloakMode) {
  const c = CLOAKS[mode];
  document.title = c.title;
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = c.icon;
}

export function CloakProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<CloakMode>('normal');

  useEffect(() => {
    const saved = (localStorage.getItem('gv-cloak') as CloakMode) || 'normal';
    setModeState(saved);
    applyCloak(saved);
    const onKey = (e: KeyboardEvent) => {
      // Never hijack typing: ignore panic when focused in a field
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      // Panic on configurable key (default Esc) or backtick
      let panicKey = 'Escape';
      try {
        panicKey = localStorage.getItem('gv-panickey') || 'Escape';
      } catch {}
      if (e.key === panicKey || e.key === '`') {
        window.location.href = PANIC_URL;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setMode = (m: CloakMode) => {
    setModeState(m);
    localStorage.setItem('gv-cloak', m);
    applyCloak(m);
  };

  const panic = () => {
    window.location.href = PANIC_URL;
  };

  const stealth = () => {
    const w = window.open('about:blank', '_blank');
    if (!w) return;
    w.document.write(
      `<html><head><title>Google Classroom</title><link rel="icon" href="${location.origin}/icons/canvas.png"></head>` +
        `<body style="margin:0;height:100vh"><iframe src="${location.href}" style="width:100%;height:100%;border:none"></iframe></body></html>`
    );
    w.document.close();
    window.location.href = PANIC_URL;
  };

  return <Ctx.Provider value={{ mode, setMode, panic, stealth }}>{children}</Ctx.Provider>;
}

export { CLOAKS };
