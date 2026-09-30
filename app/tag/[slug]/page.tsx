import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PaginatedGrid } from '@/components/PaginatedGrid';
import { games, gamesByTag } from '@/lib/games';

export const revalidate = 86400;

export function generateStaticParams() {
  const counts = new Map<string, number>();
  for (const g of games) for (const t of g.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].filter(([, n]) => n >= 5).map(([tag]) => ({ slug: tag }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const list = gamesByTag(params.slug);
  if (!list.length) return { title: 'Not found | GameVault' };
  return {
    title: `${pretty(params.slug)} Games — Play Free | GameVault`,
    description: `Play free ${pretty(params.slug).toLowerCase()} games online: ${list.slice(0, 5).map((g) => g.title).join(', ')} and more. No download, no login.`,
  };
}

function pretty(slug: string): string {
  return slug.split('-').map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ');
}

export default function TagPage({ params }: { params: { slug: string } }) {
  const list = gamesByTag(params.slug);
  if (list.length === 0) notFound();
  return (
    <div>
      <nav className="t-muted text-sm" aria-label="Breadcrumb">
        <Link href="/" className="hover:opacity-70">Home</Link> / <span>#{params.slug}</span>
      </nav>
      <h1 className="font-display mt-2 text-3xl font-bold">🏷️ {pretty(params.slug)} Games</h1>
      <p className="t-muted mt-1 text-sm">{list.length} games tagged “{params.slug}”</p>
      <div className="mt-6">
        <PaginatedGrid games={list} ranked />
      </div>
    </div>
  );
}
