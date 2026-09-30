import type { MetadataRoute } from 'next';
import { games } from '@/lib/games';
import { APPS } from '@/lib/apps';
import { COLLECTIONS } from '@/lib/games';

const BASE = 'https://gamevault.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/games`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/charts`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/apps`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/proxy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/arcade`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/browse`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/settings`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/bookmarklets`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/social`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/guestbook`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    ...APPS.map((a) => ({
      url: `${BASE}/apps/${a.slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
    ...COLLECTIONS.map((c) => ({
      url: `${BASE}/collection/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...Array.from(new Set(games.map((g) => g.category))).map((c) => ({
      url: `${BASE}/category/${c}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...games.map((g) => ({
      url: `${BASE}/play/${g.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
      images: g.thumb ? [`${BASE}${g.thumb}`] : undefined,
    })),
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/dmca`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
