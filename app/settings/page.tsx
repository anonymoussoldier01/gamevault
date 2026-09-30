import type { Metadata } from 'next';
import { SettingsClient } from '@/components/SettingsClient';

export const metadata: Metadata = {
  title: 'Settings — Proxy, Cloak & Data | GameVault',
  description: 'Switch proxy engines and backends, configure cloak and panic, manage your local data.',
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">⚙️ Settings</h1>
      <p className="t-muted mt-1 text-sm">Everything saves in this browser instantly.</p>
      <div className="mt-4">
        <SettingsClient />
      </div>
    </div>
  );
}
