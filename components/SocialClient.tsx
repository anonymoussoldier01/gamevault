'use client';

const SOCIALS = [
  { name: 'YouTube', emoji: '▶️', url: 'https://www.youtube.com/', blurb: 'Videos & Shorts' },
  { name: 'TikTok', emoji: '🎵', url: 'https://www.tiktok.com/', blurb: 'Short videos' },
  { name: 'Twitch', emoji: '💜', url: 'https://www.twitch.tv/', blurb: 'Live game streams' },
  { name: 'Discord', emoji: '💬', url: 'https://discord.com/', blurb: 'Chat & communities' },
  { name: 'Instagram', emoji: '📸', url: 'https://www.instagram.com/', blurb: 'Photos & reels' },
  { name: 'Snapchat', emoji: '👻', url: 'https://www.snapchat.com/', blurb: 'Snaps & stories' },
  { name: 'X', emoji: '✖️', url: 'https://x.com/', blurb: 'Posts & trends' },
  { name: 'Reddit', emoji: '🤖', url: 'https://www.reddit.com/', blurb: 'Communities' },
  { name: 'Spotify', emoji: '🎧', url: 'https://open.spotify.com/', blurb: 'Music & podcasts' },
  { name: 'Pinterest', emoji: '📌', url: 'https://www.pinterest.com/', blurb: 'Ideas & inspo' },
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

export function SocialClient() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SOCIALS.map((s) => (
        <div key={s.name} className="surface rounded-2xl p-4">
          <div className="font-display text-lg font-bold">{s.emoji} {s.name}</div>
          <div className="t-muted mt-0.5 text-sm">{s.blurb}</div>
          <div className="mt-3 flex gap-2">
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-4 !py-2 text-sm">
              Open →
            </a>
            <button onClick={() => stealthOpen(s.url)} className="btn-ghost !px-4 !py-2 text-sm">
              🥷 Stealth
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
