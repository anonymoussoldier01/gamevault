import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { APPS } from '@/lib/apps';
import { AppRunner } from '@/components/AppsClient';

export function generateStaticParams() {
  return APPS.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const app = APPS.find((a) => a.slug === params.slug);
  if (!app) return { title: 'Not found | GameVault' };
  return {
    title: `${app.title} — Free App | GameVault`,
    description: `${app.title}: ${app.blurb}. Runs entirely in your browser. No download, no login.`,
  };
}

export default function AppPage({ params }: { params: { slug: string } }) {
  const app = APPS.find((a) => a.slug === params.slug);
  if (!app) notFound();
  return (
    <div>
      <nav className="t-muted text-sm" aria-label="Breadcrumb">
        <Link href="/" className="hover:opacity-70">Home</Link> / <Link href="/apps" className="hover:opacity-70">Apps</Link> / <span>{app.title}</span>
      </nav>
      <h1 className="font-display mt-2 text-3xl font-bold">{app.emoji} {app.title}</h1>
      <p className="t-muted mt-1 text-sm">{app.blurb}</p>
      <div className="surface mt-6 rounded-3xl p-4 sm:p-6">
        <AppRunner slug={app.slug} />
      </div>
      <div className="mt-6">
        <div className="mb-2 text-sm font-bold">More apps</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {APPS.filter((a) => a.slug !== app.slug).map((a) => (
            <Link key={a.slug} href={`/apps/${a.slug}`} className="chip shrink-0">
              {a.emoji} {a.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
