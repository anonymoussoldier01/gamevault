'use client';

import Link from 'next/link';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="surface mx-auto max-w-lg rounded-3xl p-10 text-center">
      <div className="text-5xl">💥</div>
      <h1 className="font-display mt-2 text-2xl font-bold">Bonus level failed to load</h1>
      <p className="t-muted mt-1 text-sm">Something glitched. Your progress is safe.</p>
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={reset} className="btn-primary !px-6 !py-2.5 text-sm">
          ↻ Try again
        </button>
        <Link href="/" className="btn-ghost !px-6 !py-2.5 text-sm">
          Home
        </Link>
      </div>
    </div>
  );
}
