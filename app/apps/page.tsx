import Link from 'next/link';
import type { Metadata } from 'next';
import { APPS } from '@/lib/apps';

export const metadata: Metadata = {
  title: 'Free Apps — Calculator, Notes, Paint & More | GameVault',
  description: 'Free mini apps that run entirely in your browser. No download, no login.',
};

export default function AppsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">📱 Apps</h1>
      <p className="t-muted mt-1 text-sm">Handy tools that run 100% in your browser — most work offline too.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {APPS.map((a) => (
          <Link key={a.slug} href={`/apps/${a.slug}`} className="surface rounded-2xl p-5 hover:opacity-90">
            <div className="text-4xl">{a.emoji}</div>
            <div className="font-display mt-2 text-lg font-bold">{a.title}</div>
            <div className="t-muted mt-0.5 text-sm">{a.blurb}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
