import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PlayLauncher } from '@/components/PlayLauncher';
import { GameCard } from '@/components/GameCard';
import { FavButton } from '@/components/FavButton';
import { PlayActions } from '@/components/PlayActions';
import { PlayLink } from '@/components/PlayLink';
import { ThumbImg } from '@/components/ThumbImg';
import { categoryLabel, games, getGame, similarGames, formatPlays } from '@/lib/games';
import { fillGuide, guideFor } from '@/lib/guides';

export const revalidate = 86400;

const BASE = 'https://gamevault.vercel.app';
const ENGINE: Record<string, string> = { iframe: 'HTML5', port: 'Unity WebGL', ruffle: 'Flash', ejs: 'Emulator', embed: 'HTML5' };

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGame(params.slug);
  if (!g) return { title: 'Not found | GameVault' };
  return {
    title: `${g.title} – Play Free | GameVault`,
    description: g.description,
    openGraph: {
      title: `${g.title} | GameVault`,
      description: g.description,
      type: 'website',
      images: g.thumb ? [{ url: `${BASE}${g.thumb}` }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default function PlayPage({ params }: { params: { slug: string } }) {
  const game = getGame(params.slug);
  if (!game) notFound();
  const related = similarGames(game, 12);
  const guide = fillGuide(guideFor(game.category), game.title);
  const tags = (game.tags ?? []).filter((t) => t !== game.category).slice(0, 10);
  const tagCounts = new Map<string, number>();
  for (const g of games) for (const t of g.tags ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    url: `${BASE}/play/${game.slug}`,
    description: game.description,
    genre: categoryLabel(game.category),
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: game.rating, reviewCount: Math.max(50, Math.round(game.plays / 50000)) },
  };
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Games', item: `${BASE}/games` },
      { '@type': 'ListItem', position: 2, name: categoryLabel(game.category), item: `${BASE}/category/${game.category}` },
      { '@type': 'ListItem', position: 3, name: game.title, item: `${BASE}/play/${game.slug}` },
    ],
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <nav className="t-muted text-sm" aria-label="Breadcrumb">
        <Link href="/games" className="hover:opacity-70">Games</Link>
        {' » '}
        <Link href={`/category/${game.category}`} className="hover:opacity-70 capitalize">{categoryLabel(game.category)}</Link>
        {' » '}
        <span>{game.title}</span>
      </nav>

      <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="surface overflow-hidden rounded-2xl">
            <PlayLauncher game={game} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {game.thumb && (
              <span className="surface relative block h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <ThumbImg src={game.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-display truncate text-2xl font-bold sm:text-3xl">{game.title}</h1>
              <div className="t-muted text-sm">
                by Community port · ★ {game.rating.toFixed(1)} · 👁 {formatPlays(game.plays)} plays
              </div>
            </div>
            <FavButton slug={game.slug} title={game.title} />
          </div>

          <PlayActions game={game} />

          <dl className="surface mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl text-sm sm:grid-cols-4" style={{ background: 'var(--line)' }}>
            {[
              ['Rating', `★ ${game.rating.toFixed(1)}`],
              ['Engine', ENGINE[game.kind] ?? 'HTML5'],
              ['Platforms', 'Browser · Chromebook'],
              ['Mode', game.heavy ? 'Heavy (click-load)' : 'Instant play'],
            ].map(([k, v]) => (
              <div key={k} className="px-4 py-3" style={{ background: 'var(--surface)' }}>
                <dt className="t-faint text-xs font-bold uppercase">{k}</dt>
                <dd className="mt-0.5 font-bold">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="surface mt-4 rounded-2xl p-4 sm:p-5">
            <p className="text-sm leading-relaxed">{game.description} Tip: press <kbd className="surface2 rounded px-1">Esc</kbd> anytime for panic-to-Classroom.</p>
            <h2 className="font-display mt-4 text-lg font-bold">How to Play {game.title}</h2>
            <ul className="t-muted mt-2 grid gap-1 text-sm sm:grid-cols-2">
              {guide.controls.map((c) => (
                <li key={c} className="flex gap-2"><span aria-hidden>🎮</span>{c}</li>
              ))}
            </ul>
            <h3 className="font-display mt-4 text-base font-bold">Tips</h3>
            <ul className="t-muted mt-1 list-disc space-y-1 pl-5 text-sm">
              {guide.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <h3 className="font-display mt-4 text-base font-bold">FAQ</h3>
            <div className="mt-1 space-y-2">
              {guide.faqs.map((f) => (
                <details key={f.q} className="surface2 rounded-xl px-3 py-2 text-sm">
                  <summary className="cursor-pointer font-bold">{f.q}</summary>
                  <p className="t-muted mt-1">{f.a}</p>
                </details>
              ))}
            </div>
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Link key={t} href={`/tag/${t}`} className="chip !py-1 text-xs">
                    {t} · {tagCounts.get(t) ?? 0}
                  </Link>
                ))}
              </div>
            )}
            <p className="t-faint mt-3 text-xs">
              All games © their respective owners. Removal: <Link href="/dmca" className="underline">/dmca</Link>.
            </p>
          </div>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <h2 className="font-display mb-3 text-lg font-bold">▶ Play Next</h2>
          <div className="space-y-2">
            {related.slice(0, 8).map((r) => (
              <PlayLink key={r.slug} game={r} className="surface flex items-center gap-3 rounded-xl p-2 hover:opacity-90" label={`Play ${r.title}`}>
                <span className="surface2 relative block h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                  {r.thumb && <ThumbImg src={r.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{r.title}</span>
                  <span className="font-mono2 t-faint text-xs">▶ {formatPlays(r.plays)}</span>
                </span>
              </PlayLink>
            ))}
          </div>
          <h2 className="font-display mb-3 mt-6 text-lg font-bold">More like this</h2>
          <div className="grid grid-cols-2 gap-3">
            {related.slice(8, 12).map((r) => (
              <GameCard key={r.slug} game={r} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
