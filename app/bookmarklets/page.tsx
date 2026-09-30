import type { Metadata } from 'next';
import { BookmarkletsClient } from '@/components/BookmarkletsClient';

export const metadata: Metadata = {
  title: 'Bookmarklets — Cloak & Debug Tools | GameVault',
  description: 'Drag-and-drop bookmarklets: blank cloak, console, panic, fullscreen.',
};

export default function BookmarkletsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold">🔖 Bookmarklets</h1>
      <p className="t-muted mt-1 text-sm">Tiny tools that live in your bookmarks bar and work on any site.</p>
      <BookmarkletsClient />
    </div>
  );
}
