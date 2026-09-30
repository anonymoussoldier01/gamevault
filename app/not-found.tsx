import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="surface mx-auto max-w-lg rounded-3xl p-10 text-center">
      <div className="text-5xl">🕹️</div>
      <h1 className="font-display mt-2 text-2xl font-bold">Game over — page not found</h1>
      <p className="t-muted mt-1 text-sm">That level doesn’t exist (or was DMCA-removed).</p>
      <Link href="/" className="btn-primary mt-4 inline-block !px-6 !py-2.5 text-sm">
        Back to vault →
      </Link>
    </div>
  );
}
