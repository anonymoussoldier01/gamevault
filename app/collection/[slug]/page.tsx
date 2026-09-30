import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PaginatedGrid } from '@/components/PaginatedGrid';
import { COLLECTIONS, gamesByCollection } from '@/lib/games';

export const revalidate = 86400;

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const col = COLLECTIONS.find((c) => c.slug === params.slug);
  if (!col) return { title: 'Not found | GameVault' };
  return {
    title: `${col.title} — Play Free | GameVault`,
    description: `${col.blurb} Play the best free online games instantly. No download, no login.`,
  };
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const col = COLLECTIONS.find((c) => c.slug === params.slug);
  if (!col) notFound();
  const list = gamesByCollection(params.slug);
  return (
    <div>
      <nav className="t-muted text-sm" aria-label="Breadcrumb">
        <Link href="/" className="hover:opacity-70">Home</Link> / <span>{col.title}</span>
      </nav>
      <h1 className="font-display mt-2 text-3xl font-bold">
        {col.emoji} {col.title}
      </h1>
      <p className="t-muted mt-1 text-sm">{col.blurb} · {list.length} games</p>
      <div className="mt-6">
        <PaginatedGrid games={list} ranked />
      </div>
    </div>
  );
}
