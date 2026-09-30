import type { Metadata } from 'next';
import { BrowseClient } from '@/components/BrowseClient';

export const metadata: Metadata = {
  title: 'Proxy Browser — Browse Anything | GameVault',
  description: 'Omnibox proxy browser with switchable engines and backend health checks.',
};

export default function BrowsePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold">🧭 Proxy Browser</h1>
      <p className="t-muted mt-1 text-sm">Type a URL or search — it opens through your chosen proxy frontend.</p>
      <BrowseClient />
    </div>
  );
}
