'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Entry {
  name: string;
  msg: string;
  at: string;
}

const KEY = 'v1:guestbook';
const SEED: Entry[] = [
  { name: 'SlopeFan22', msg: 'slope is unbeatable, 300+ score club wya', at: '2026-09-28T12:00:00' },
  { name: 'PixelPro', msg: 'the new light mode looks so clean 🔥', at: '2026-09-29T15:30:00' },
  { name: 'ChromebookKid', msg: 'plays great on my school chromebook, thanks!', at: '2026-09-29T18:45:00' },
];

function load(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as Entry[];
  } catch {
    return SEED;
  }
}

export function GuestbookClient() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    setEntries(load());
    try {
      setName(localStorage.getItem('v1:guestbook-name') ?? '');
    } catch {}
  }, []);

  const sign = () => {
    const n = name.trim().slice(0, 24) || 'Anonymous';
    const m = msg.trim().slice(0, 280);
    if (!m) return;
    const next = [{ name: n, msg: m, at: new Date().toISOString() }, ...entries].slice(0, 200);
    setEntries(next);
    setMsg('');
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      localStorage.setItem('v1:guestbook-name', n);
    } catch {}
  };

  const remove = (at: string) => {
    const next = entries.filter((e) => e.at !== at);
    setEntries(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(entries, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gamevault-guestbook.json';
    a.click();
  };

  return (
    <div>
      <div className="surface mt-4 rounded-2xl p-4">
        <div className="font-bold">✍️ Sign the guestbook</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={24}
          className="surface2 mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
          aria-label="Your name"
        />
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder="Say hi, request a game, report a bug…"
          className="surface2 mt-2 w-full rounded-xl p-3 text-sm outline-none"
          aria-label="Message"
        />
        <div className="mt-2 flex gap-2">
          <button onClick={sign} className="btn-primary !px-5 !py-2 text-sm">Sign 📖</button>
          <button onClick={exportAll} className="btn-ghost !px-4 !py-2 text-sm">Export</button>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {entries.map((e) => (
          <div key={e.at + e.name} className="surface rounded-2xl p-3">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-sm">{e.name}</span>
              <span className="t-faint text-xs">{new Date(e.at).toLocaleDateString()}</span>
              <button onClick={() => remove(e.at)} className="t-faint ml-auto text-xs hover:opacity-70" aria-label="Delete entry">
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm">{e.msg}</p>
          </div>
        ))}
        {entries.length === 0 && <p className="t-muted text-sm">No entries yet — be the first!</p>}
      </div>
      <p className="t-faint mt-6 text-xs">
        Entries live in this browser only. Looking for the classic embedded guestbook?{' '}
        <Link href="/play/guestbook" className="underline">It is still here →</Link>
      </p>
    </div>
  );
}
