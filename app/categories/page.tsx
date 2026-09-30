import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORY_META, COLLECTIONS, allTags, categoryLabel, games } from '@/lib/games';

export const metadata: Metadata = {
  title: 'Categories & Tags — Browse | GameVault',
  description: 'Browse every game category, collection, and tag on GameVault.',
};

export default function CategoriesPage() {
  const cats = Array.from(new Set(games.map((g) => g.category))).sort();
  const tags = allTags();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">📂 Categories</h1>
      <p className="t-muted mt-1 text-sm">{games.length} games across {cats.length} categories</p>
      <Link href="/games" className="btn-primary mt-4 inline-block !px-6 !py-2.5 text-sm">
        🎮 View all {games.length} games A–Z →
      </Link>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => {
          const n = games.filter((g) => g.category === c).length;
          return (
            <Link key={c} href={`/category/${c}`} className="surface rounded-2xl p-4 hover:opacity-90">
              <div className="font-display text-lg font-bold">
                {CATEGORY_META[c]?.emoji ?? '🎮'} {categoryLabel(c)}
              </div>
              <div className="t-muted mt-0.5 text-sm">{n} games · {CATEGORY_META[c]?.blurb ?? ''}</div>
            </Link>
          );
        })}
      </div>
      <h2 className="font-display mt-10 text-2xl font-bold">✨ Collections</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {COLLECTIONS.map((col) => (
          <Link key={col.slug} href={`/collection/${col.slug}`} className="surface rounded-2xl p-4 hover:opacity-90">
            <div className="font-display text-lg font-bold">{col.emoji} {col.title}</div>
            <div className="t-muted mt-0.5 text-sm">{col.blurb}</div>
          </Link>
        ))}
      </div>
      <h2 className="font-display mt-10 text-2xl font-bold">🏷️ All tags</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link key={t.tag} href={`/tag/${t.tag}`} className="chip">
            {t.tag} · {t.count}
          </Link>
        ))}
      </div>
    </div>
  );
}
