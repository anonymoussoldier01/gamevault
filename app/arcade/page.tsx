import type { Metadata } from 'next';
import { ArcadeClient } from '@/components/ArcadeClient';

export const metadata: Metadata = {
  title: 'Proxy Arcade — Blocked Games via Proxy | GameVault',
  description: 'Play games that block direct embedding, wrapped in your proxy. Single-player works best.',
};

export default function ArcadePage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">🌐 Proxy Arcade</h1>
      <p className="t-muted mt-1 text-sm">
        These games refuse normal embeds — so they load through a proxy frontend instead.
      </p>
      <ArcadeClient />
    </div>
  );
}
