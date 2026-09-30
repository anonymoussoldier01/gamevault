import type { Metadata } from 'next';
import { ProxyClient } from '@/components/ProxyClient';

export const metadata: Metadata = {
  title: 'Free Web Proxies — Browse Freely | GameVault',
  description: 'Multiple free web proxies plus stealth-tab browsing. No download, no login.',
};

export default function ProxyPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">🌐 Proxy Hub</h1>
      <p className="t-muted mt-1 text-sm">
        Multiple free proxies in one place. Open normally or in a disguised stealth tab.
      </p>
      <ProxyClient />
    </div>
  );
}
