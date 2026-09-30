'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { launchGame } from '@/lib/launch';
import type { Game } from '@/lib/games';

/**
 * Primary play link: left-click launches the fullscreen about:blank tab,
 * modifier/middle-click keeps normal navigation (details page).
 */
export function PlayLink({
  game,
  className,
  children,
  label,
  style,
  tabIndex,
  ariaHidden,
}: {
  game: Game;
  className?: string;
  children: ReactNode;
  label?: string;
  style?: React.CSSProperties;
  tabIndex?: number;
  ariaHidden?: boolean;
}) {
  const router = useRouter();
  const onClick = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    e.preventDefault();
    const ok = launchGame(game);
    if (!ok) router.push(`/play/${game.slug}?inline=1`);
  };
  return (
    <Link
      href={`/play/${game.slug}`}
      onClick={onClick}
      onAuxClick={(e) => {
        if (e.button === 1) e.preventDefault();
      }}
      className={className}
      style={style}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
      aria-label={label ?? `Play ${game.title} fullscreen in a new tab`}
    >
      {children}
    </Link>
  );
}
