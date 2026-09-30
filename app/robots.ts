import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/random'] }],
    sitemap: 'https://gamevault.vercel.app/sitemap.xml',
  };
}
