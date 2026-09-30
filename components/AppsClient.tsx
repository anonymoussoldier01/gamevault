'use client';

import { useEffect, useRef, useState } from 'react';

/* ---------------- Calculator ---------------- */
function Calculator() {
  const [expr, setExpr] = useState('');
  const [out, setOut] = useState('');
  const press = (k: string) => {
    if (k === 'C') { setExpr(''); setOut(''); return; }
    if (k === '⌫') { setExpr((e) => e.slice(0, -1)); return; }
    if (k === '=') {
      try {
        const clean = expr.replace(/[^0-9+\-*/.()% ]/g, '');
        // eslint-disable-next-line no-new-func
        const v = Function(`"use strict";return (${clean || '0'})`)();
        setOut(String(Math.round((v + Number.EPSILON) * 1e10) / 1e10));
      } catch { setOut('Error'); }
      return;
    }
    setExpr((e) => (e + k).slice(0, 40));
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9+\-*/.()%]$/.test(e.key)) press(e.key);
      else if (e.key === 'Enter') press('=');
      else if (e.key === 'Backspace') press('⌫');
      else if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) press('C');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const keys = ['C', '(', ')', '⌫', '7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '%', '+', '='];
  return (
    <div className="mx-auto max-w-xs">
      <div className="surface2 min-h-20 rounded-2xl p-4 text-right">
        <div className="t-faint min-h-5 break-all text-sm">{expr || ' '}</div>
        <div className="font-display text-3xl font-bold">{out || '0'}</div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {keys.map((k) => (
          <button key={k} onClick={() => press(k)} className={k === '=' ? 'btn-primary !px-0 py-3' : 'btn-ghost !px-0 py-3'}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Notes ---------------- */
function Notes() {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try { setText(localStorage.getItem('v1:app-notes') ?? ''); } catch {}
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem('v1:app-notes', text); setSaved(true); } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [text]);
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        rows={14}
        placeholder="Type anything — autosaves as you go…"
        className="surface2 w-full rounded-2xl p-4 text-sm outline-none"
      />
      <div className="t-faint mt-1 text-xs">{saved ? '✓ Saved in this browser' : '…'}</div>
    </div>
  );
}

/* ---------------- Paint ---------------- */
function Paint() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#365AFF');
  const [size, setSize] = useState(6);
  const drawing = useRef(false);
  useEffect(() => {
    const c = ref.current!;
    c.width = c.offsetWidth * 2;
    c.height = 480;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);
  const pos = (e: React.PointerEvent) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const draw = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = ref.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  };
  const download = () => {
    const a = document.createElement('a');
    a.href = ref.current!.toDataURL('image/png');
    a.download = 'gamevault-paint.png';
    a.click();
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {['#172042', '#365AFF', '#FF5D3B', '#00B88A', '#FFC531', '#DB2777', '#ffffff'].map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="h-8 w-8 rounded-full border-2"
            style={{ background: c, borderColor: color === c ? 'var(--blue)' : 'var(--line)' }}
            aria-label={`Color ${c}`}
          />
        ))}
        <input type="range" min={2} max={30} value={size} onChange={(e) => setSize(Number(e.target.value))} aria-label="Brush size" />
        <button onClick={download} className="btn-ghost !px-4 !py-1.5 text-sm">⬇ PNG</button>
        <button
          onClick={() => { const c = ref.current!; const ctx = c.getContext('2d')!; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height); }}
          className="btn-ghost !px-4 !py-1.5 text-sm"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={ref}
        className="w-full touch-none rounded-2xl border"
        style={{ borderColor: 'var(--line)', height: 480, cursor: 'crosshair' }}
        onPointerDown={(e) => { drawing.current = true; draw(e); }}
        onPointerMove={draw}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
      />
    </div>
  );
}

/* ---------------- Piano ---------------- */
const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2'];
function Piano() {
  const ctxRef = useRef<AudioContext | null>(null);
  const play = (i: number) => {
    try {
      ctxRef.current ??= new AudioContext();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 261.63 * Math.pow(2, i / 7 > 1 ? 1 : 0) * [1, 1.122, 1.26, 1.335, 1.498, 1.682, 1.888, 2][i];
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch {}
  };
  return (
    <div className="flex gap-1">
      {NOTES.map((n, i) => (
        <button
          key={n}
          onPointerDown={() => play(i)}
          className="surface h-48 flex-1 rounded-b-2xl rounded-t-lg border font-bold active:opacity-70"
          style={{ borderColor: 'var(--line)' }}
          aria-label={`Note ${n}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Timer ---------------- */
function Timer() {
  const [secs, setSecs] = useState(300);
  const [left, setLeft] = useState(300);
  const [run, setRun] = useState(false);
  const [sw, setSw] = useState(0);
  const [swRun, setSwRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    if (left <= 0) { setRun(false); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [run, left]);
  useEffect(() => {
    if (!swRun) return;
    const t = setTimeout(() => setSw((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [swRun, sw]);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="surface rounded-2xl p-5 text-center">
        <div className="font-bold">⏳ Countdown</div>
        <div className="font-display my-2 text-5xl font-bold">{fmt(left)}</div>
        <input type="range" min={60} max={3600} step={60} value={secs} onChange={(e) => { setSecs(Number(e.target.value)); setLeft(Number(e.target.value)); }} className="w-full" aria-label="Minutes" />
        <div className="mt-2 flex justify-center gap-2">
          <button onClick={() => setRun((r) => !r)} className="btn-primary !px-4 !py-2 text-sm">{run ? 'Pause' : 'Start'}</button>
          <button onClick={() => { setRun(false); setLeft(secs); }} className="btn-ghost !px-4 !py-2 text-sm">Reset</button>
        </div>
      </div>
      <div className="surface rounded-2xl p-5 text-center">
        <div className="font-bold">⏱️ Stopwatch</div>
        <div className="font-display my-2 text-5xl font-bold">{fmt(sw)}</div>
        <div className="mt-2 flex justify-center gap-2">
          <button onClick={() => setSwRun((r) => !r)} className="btn-primary !px-4 !py-2 text-sm">{swRun ? 'Stop' : 'Start'}</button>
          <button onClick={() => { setSwRun(false); setSw(0); }} className="btn-ghost !px-4 !py-2 text-sm">Reset</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Weather (Open-Meteo, no key) ---------------- */
function Weather() {
  const [city, setCity] = useState('');
  const [data, setData] = useState<{ temp: number; code: number; name: string } | null>(null);
  const [err, setErr] = useState('');
  const lookup = async (lat?: number, lon?: number, name?: string) => {
    setErr('');
    try {
      let la = lat, lo = lon, nm = name ?? 'Here';
      if (la === undefined) {
        const g = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)).json();
        if (!g.results?.length) { setErr('City not found'); return; }
        la = g.results[0].latitude; lo = g.results[0].longitude; nm = g.results[0].name;
      }
      const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weather_code`)).json();
      setData({ temp: Math.round(w.current.temperature_2m), code: w.current.weather_code, name: nm });
    } catch { setErr('Weather unavailable offline'); }
  };
  const emoji = !data ? '🌤️' : data.code <= 1 ? '☀️' : data.code <= 3 ? '⛅' : data.code <= 48 ? '🌫️' : data.code <= 67 ? '🌧️' : data.code <= 77 ? '🌨️' : data.code <= 82 ? '🌦️' : '⛈️';
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="flex gap-2">
        <input value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && lookup()} placeholder="City name…" className="surface2 w-full rounded-full px-4 py-2.5 text-sm outline-none" aria-label="City" />
        <button onClick={() => lookup()} className="btn-primary shrink-0 !px-5 !py-2.5 text-sm">Go</button>
      </div>
      <button
        onClick={() => navigator.geolocation?.getCurrentPosition((p) => lookup(p.coords.latitude, p.coords.longitude), () => setErr('Location denied'))}
        className="t-muted mt-2 text-sm underline"
      >
        Use my location
      </button>
      {err && <div className="mt-3 text-sm font-bold" style={{ color: 'var(--coral)' }}>{err}</div>}
      {data && (
        <div className="surface mt-3 rounded-2xl p-6">
          <div className="text-5xl">{emoji}</div>
          <div className="font-display mt-1 text-5xl font-bold">{data.temp}°C</div>
          <div className="t-muted text-sm">{data.name}</div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Dictionary (free API, no key) ---------------- */
function Dictionary() {
  const [word, setWord] = useState('');
  const [defs, setDefs] = useState<string[]>([]);
  const [err, setErr] = useState('');
  const lookup = async () => {
    setErr(''); setDefs([]);
    try {
      const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`);
      if (!r.ok) { setErr('Word not found'); return; }
      const j = await r.json();
      const out: string[] = [];
      for (const e of j.slice(0, 2)) for (const m of e.meanings?.slice(0, 2) ?? []) for (const d of m.definitions?.slice(0, 2) ?? []) out.push(`(${m.partOfSpeech}) ${d.definition}`);
      setDefs(out.slice(0, 6));
    } catch { setErr('Dictionary unavailable offline'); }
  };
  return (
    <div className="mx-auto max-w-lg">
      <div className="flex gap-2">
        <input value={word} onChange={(e) => setWord(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && lookup()} placeholder="Define a word…" className="surface2 w-full rounded-full px-4 py-2.5 text-sm outline-none" aria-label="Word" />
        <button onClick={lookup} className="btn-primary shrink-0 !px-5 !py-2.5 text-sm">Define</button>
      </div>
      {err && <div className="mt-3 text-sm font-bold" style={{ color: 'var(--coral)' }}>{err}</div>}
      <ul className="mt-3 space-y-2">
        {defs.map((d, i) => (
          <li key={i} className="surface rounded-xl p-3 text-sm">{d}</li>
        ))}
      </ul>
    </div>
  );
}

export function AppRunner({ slug }: { slug: string }) {
  switch (slug) {
    case 'calculator': return <Calculator />;
    case 'notes': return <Notes />;
    case 'paint': return <Paint />;
    case 'piano': return <Piano />;
    case 'timer': return <Timer />;
    case 'weather': return <Weather />;
    case 'dictionary': return <Dictionary />;
    default: return <div className="t-muted text-sm">Unknown app.</div>;
  }
}
