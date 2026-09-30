import type { Metadata } from 'next';
import { GuestbookClient } from '@/components/GuestbookClient';

export const metadata: Metadata = {
  title: 'Guestbook — Say Hi | GameVault',
  description: 'Sign the GameVault guestbook. Say hi, request games, report bugs.',
};

export default function GuestbookPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">📖 Guestbook</h1>
      <p className="t-muted mt-1 text-sm">Say hi, request a game, or tell us what is broken.</p>
      <GuestbookClient />
    </div>
  );
}
