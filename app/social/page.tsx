import type { Metadata } from 'next';
import { SocialClient } from '@/components/SocialClient';

export const metadata: Metadata = {
  title: 'Social Apps — YouTube, TikTok, Twitch & More | GameVault',
  description: 'Open your favorite social apps normally or in a disguised stealth tab.',
};

export default function SocialPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">📣 Social</h1>
      <p className="t-muted mt-1 text-sm">
        Social sites block embedding, so these open directly — or in a Classroom-disguised stealth tab.
      </p>
      <SocialClient />
    </div>
  );
}
