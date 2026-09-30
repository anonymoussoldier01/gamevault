import Link from 'next/link';
import { FeatureHero } from '@/components/FeatureHero';
import { CategoryRow } from '@/components/CategoryRow';
import { GameCard } from '@/components/GameCard';
import { GameGrid } from '@/components/GameGrid';
import { RailNav } from '@/components/RailNav';
import { Ticker } from '@/components/Ticker';
import { CountUp, Reveal } from '@/components/Motion';
import { CATEGORY_META, COLLECTIONS, allTags, franchises, games, gamesByCollection } from '@/lib/games';
import telemetry from '@/data/telemetry.json';

export default function Home() {
  const byPlays = [...games].sort((a, b) => b.plays - a.plays);
  const trending = byPlays.slice(0, 12);
  const picks = [...games.filter((g) => g.isNew), ...byPlays.filter((g) => g.heavy)].filter(
    (g, i, arr) => arr.findIndex((x) => x.slug === g.slug) === i,
  ).slice(0, 12);
  const unstoppable = byPlays.slice(0, 12);
  const fresh = [...games].reverse().slice(0, 12);
  const cats = Array.from(new Set(games.map((g) => g.category))).sort();
  const tags = allTags().slice(0, 30);
  const series = franchises().slice(0, 4);

  return (
    <div>
      <div className="hud t-faint mb-3 flex flex-wrap gap-x-4 gap-y-1" aria-label="Site status">
        <span><span style={{ color: 'var(--ok)' }}>●</span> SYS NOMINAL</span>
        <span>ARCADE // <CountUp to={telemetry.games} /> GAMES</span>
        <span>SWEEP {telemetry.ok}/{telemetry.games}</span>
        <span>BOOT {telemetry.bootPass}/{telemetry.games}</span>
      </div>
      <FeatureHero games={games} />

      <div className="mt-4">
        <Ticker games={games} />
      </div>

      <RailNav
        title="⭐ Vault Picks"
        action={
          <Link href="/charts" className="chip shrink-0 !py-1 text-xs">
            View All →
          </Link>
        }
      >
        {picks.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </RailNav>

      <RailNav
        title="🎮 Can't Stop Playing"
        action={
          <Link href="/charts" className="chip shrink-0 !py-1 text-xs">
            View All →
          </Link>
        }
      >
        {unstoppable.map((g, i) => (
          <GameCard key={g.slug} game={g} rank={i} />
        ))}
      </RailNav>

      <RailNav
        title="🆕 New Games"
        action={
          <Link href="/new" className="chip shrink-0 !py-1 text-xs">
            View All →
          </Link>
        }
      >
        {fresh.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </RailNav>

      {COLLECTIONS.map((col) => {
        const list = gamesByCollection(col.slug).slice(0, 12);
        if (list.length === 0) return null;
        return (
          <RailNav
            key={col.slug}
            title={`${col.emoji} ${col.title}`}
            action={
              <Link href={`/collection/${col.slug}`} className="chip shrink-0 !py-1 text-xs">
                View All →
              </Link>
            }
          >
            {list.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </RailNav>
        );
      })}

      {series.map((f) => (
        <RailNav key={f.name} title={`🎬 ${f.name} Series`}>
          {f.games.slice(0, 12).map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </RailNav>
      ))}

      <section id="trending" className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-bold sm:text-2xl">🔥 Trending Now</h2>
          <span className="flex gap-2">
            <Link href="/charts" className="chip !py-1 text-xs">
              Charts →
            </Link>
            <Link href="/games" className="chip !py-1 text-xs">
              All {games.length} →
            </Link>
          </span>
        </div>
        <GameGrid games={trending} ranked />
      </section>

      {cats.map((c) => (
        <CategoryRow key={c} category={c} games={games.filter((g) => g.category === c)} />
      ))}

      {tags.length > 0 && (
        <section className="mt-8" aria-label="Popular tags">
          <h2 className="font-display mb-3 text-xl font-bold sm:text-2xl">🏷️ Popular tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link key={t.tag} href={`/tag/${t.tag}`} className="chip">
                {t.tag} · {t.count}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="surface mt-8 rounded-2xl p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Free Online Games at GameVault</h2>
        <div className="t-muted mt-3 grid gap-4 text-sm leading-relaxed sm:grid-cols-3">
          <p>
            <strong>Instant play, no downloads.</strong> Every game loads right in your browser — Slope, Subway
            Surfers, Moto X3M, FNAF, and {games.length - 5}+ more. Click a tile and play.
          </p>
          <p>
            <strong>Built for Chromebooks.</strong> Lightweight HTML5 games run anywhere; heavy Unity ports wait
            for your click and show honest size badges. Tab cloak, stealth mode, and panic key included.
          </p>
          <p>
            <strong>New games constantly.</strong> Fresh ports land weekly across racing, horror, puzzle, sports,
            retro, and .io arenas. Bookmark your favorites — they save in this browser.
          </p>
        </div>
      </section>
    </div>
  );
}
