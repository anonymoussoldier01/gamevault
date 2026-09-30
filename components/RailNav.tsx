'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';

/** Section header + snap row with smooth-scroll arrows. */
export function RailNav({ title, href, children, action }: { title: ReactNode; href?: string; children: ReactNode; action?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 520, behavior: 'smooth' });
  };
  return (
    <section className="mt-8" aria-label={typeof title === 'string' ? title : undefined}>
      <div className="mb-3 flex items-end justify-between gap-2">
        <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
        <span className="flex shrink-0 items-center gap-1.5">
          <button onClick={() => scroll(-1)} className="icon-btn !h-8 !min-w-8 !px-2 text-sm" aria-label="Scroll left">
            ←
          </button>
          <button onClick={() => scroll(1)} className="icon-btn !h-8 !min-w-8 !px-2 text-sm" aria-label="Scroll right">
            →
          </button>
          {action}
        </span>
      </div>
      <div className="snap-row" ref={ref}>
        {children}
      </div>
    </section>
  );
}
