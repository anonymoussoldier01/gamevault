'use client';

const MARKS = [
  {
    name: 'Blank Cloak',
    code: `javascript:(function(){var w=window.open('about:blank','_blank');if(!w)return;w.document.write('<title>Google Classroom</title><iframe src="'+location.href+'" style="width:100%;height:100vh;border:0">');w.document.close();location.href='https://classroom.google.com/';})()`,
    blurb: 'Reopen this page disguised, panic this tab.',
  },
  {
    name: 'Eruda Console',
    code: `javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/eruda';s.onload=function(){eruda.init()};document.body.appendChild(s)})()`,
    blurb: 'Mobile dev console for debugging games.',
  },
  {
    name: 'Panic Button',
    code: `javascript:location.href='https://classroom.google.com/'`,
    blurb: 'One click jumps to Classroom.',
  },
  {
    name: 'Fullscreen Video',
    code: `javascript:(function(){var v=document.querySelector('video');if(v){if(v.requestFullscreen)v.requestFullscreen();}else{alert('No video found')}})()`,
    blurb: 'Fullscreen the first video on any page.',
  },
];

export function BookmarkletsClient() {
  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      alert('Copied! Paste it as a bookmark URL.');
    } catch {
      prompt('Copy bookmarklet:', code);
    }
  };
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {MARKS.map((m) => (
        <div key={m.name} className="surface rounded-2xl p-4">
          <div className="font-display text-lg font-bold">🔖 {m.name}</div>
          <div className="t-muted mt-0.5 text-sm">{m.blurb}</div>
          <div className="mt-3 flex gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <a href={m.code} className="btn-primary !px-4 !py-2 text-sm" onClick={(e) => e.preventDefault()} title="Drag me to your bookmarks bar">
              Drag me ☝
            </a>
            <button onClick={() => copy(m.code)} className="btn-ghost !px-4 !py-2 text-sm">
              Copy
            </button>
          </div>
          <p className="t-faint mt-2 text-xs">Drag the button to your bookmarks bar, or copy and paste as a bookmark URL.</p>
        </div>
      ))}
    </div>
  );
}
