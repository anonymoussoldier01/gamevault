'use client';

import { useEffect, useState } from 'react';
import { hasLiked, toggleLike, getRating, setRating, getNote, setNote, reportBroken } from '@/lib/storage';
import type { Game } from '@/lib/games';

function toast(msg: string) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.setAttribute('role', 'status');
  Object.assign(el.style, {
    position: 'fixed', bottom: '76px', left: '50%', transform: 'translateX(-50%)',
    background: 'var(--ink)', color: 'var(--bg)', padding: '10px 18px', borderRadius: '999px',
    fontSize: '14px', fontWeight: '700', zIndex: '100',
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

export function PlayActions({ game }: { game: Game }) {
  const [liked, setLiked] = useState(false);
  const [stars, setStars] = useState(0);
  const [note, setNoteText] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    setLiked(hasLiked(game.slug));
    setStars(getRating(game.slug));
    setNoteText(getNote(game.slug));
  }, [game.slug]);

  const share = async () => {
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: game.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast('Link copied!');
    } catch {
      toast('Copy this link: ' + url);
    }
  };

  const rate = (n: number) => {
    setRating(game.slug, n);
    setStars(n);
    toast(`Rated ${n}/5`);
  };

  const saveNote = () => {
    setNote(game.slug, note);
    toast(note.trim() ? 'Note saved' : 'Note cleared');
  };

  const sendReport = () => {
    reportBroken(game.slug, game.iframeUrl, reportText);
    setReporting(false);
    setReportText('');
    toast('Thanks — logged for the next fix sweep');
  };

  const challenge = async () => {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ g: game.slug })))).replace(/=+$/, '');
    const url = `${location.origin}/play/${game.slug}#c=${payload}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Challenge link copied!');
    } catch {
      toast('Challenge: ' + url);
    }
  };

  const embed = async () => {
    const code = `<iframe src="${location.origin}/play/${game.slug}" width="800" height="600" allowfullscreen></iframe>`;
    try {
      await navigator.clipboard.writeText(code);
      toast('Embed code copied!');
    } catch {
      toast('Embed blocked by browser');
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setLiked(toggleLike(game.slug))} className="btn-ghost !px-4 !py-2 text-sm" aria-pressed={liked}>
          {liked ? '👍 Liked' : '👍 Like'}
        </button>
        <div className="chip" role="group" aria-label="Rate this game">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => rate(n)} aria-label={`Rate ${n} stars`} className="px-0.5 text-base">
              {n <= stars ? '★' : '☆'}
            </button>
          ))}
        </div>
        <button onClick={share} className="btn-ghost !px-4 !py-2 text-sm">🔗 Share</button>
        <button onClick={challenge} className="btn-ghost !px-4 !py-2 text-sm">🏆 Challenge</button>
        <button onClick={embed} className="btn-ghost !px-4 !py-2 text-sm">📦 Embed</button>
        <button onClick={() => setReporting((r) => !r)} className="btn-ghost !px-4 !py-2 text-sm">⚠️ Report broken</button>
      </div>
      {reporting && (
        <div className="surface rounded-2xl p-3">
          <div className="text-sm font-bold">What goes wrong when you press Play?</div>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={2}
            placeholder="e.g. black screen after loading, 404, stuck on loader…"
            className="surface2 mt-2 w-full rounded-xl p-2 text-sm outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button onClick={sendReport} className="btn-primary !px-4 !py-2 text-sm">Send report</button>
            <button onClick={() => setReporting(false)} className="btn-ghost !px-4 !py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <details className="surface rounded-2xl px-3 py-2 text-sm">
        <summary className="cursor-pointer font-bold">📝 My notes</summary>
        <textarea
          value={note}
          onChange={(e) => setNoteText(e.target.value)}
          rows={2}
          placeholder="Passwords, high scores, strategies… (saved in this browser)"
          className="surface2 mt-2 w-full rounded-xl p-2 text-sm outline-none"
        />
        <button onClick={saveNote} className="btn-ghost mt-2 !px-4 !py-1.5 text-sm">Save note</button>
      </details>
    </div>
  );
}
