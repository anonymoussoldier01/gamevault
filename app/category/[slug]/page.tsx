import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PaginatedGrid } from '@/components/PaginatedGrid';
import { CATEGORY_META, categoryLabel, games } from '@/lib/games';

export const revalidate = 86400;

export function generateStaticParams() {
  return Array.from(new Set(games.map((g) => g.category))).map((category) => ({ slug: category }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const list = games.filter((g) => g.category === params.slug);
  if (!list.length) return { title: 'Not found | GameVault' };
  return {
    title: `${categoryLabel(params.slug)} Games — Play Free | GameVault`,
    description: `Play the best free ${categoryLabel(params.slug).toLowerCase()} games online: ${list.slice(0, 5).map((g) => g.title).join(', ')} and ${list.length - 5 > 0 ? `${list.length - 5} more` : 'more'}. No download, no login.`,
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const list = games.filter((g) => g.category === params.slug);
  if (list.length === 0) notFound();
  const meta = CATEGORY_META[params.slug];

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryLabel(params.slug)} Games`,
    itemListElement: [...list]
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 30)
      .map((g, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://gamevault.vercel.app/play/${g.slug}`,
        name: g.title,
      })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <nav className="t-muted text-sm" aria-label="Breadcrumb">
        <Link href="/" className="hover:opacity-70">Home</Link> / <span className="capitalize">{categoryLabel(params.slug)}</span>
      </nav>
      <h1 className="font-display mt-2 text-3xl font-bold">
        {meta?.emoji ?? '🎮'} {categoryLabel(params.slug)} Games
      </h1>
      <p className="t-muted mt-1 text-sm">{list.length} games · {meta?.blurb ?? ''}</p>
      <div className="mt-6">
        <PaginatedGrid games={list} ranked />
      </div>
    </div>
  );
}
