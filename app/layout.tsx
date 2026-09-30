import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Shell } from '@/components/Shell';
import './globals.css';

const ui = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
});
const display = Inter({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'GameVault — Play 870+ Free Online Games',
  description:
    'GameVault: play 870+ free online games instantly. Slope, Subway Surfers, Minecraft, FNAF, Buckshot Roulette, PolyTrack and more. No download, no login.',
  keywords: ['free games', 'online games', 'unblocked games', 'slope', 'subway surfers', 'minecraft', 'fnaf', 'gamevault'],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'GameVault — Play 870+ Free Online Games',
    description: 'Instant browser games. No download, no login.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F4FB' },
    { media: '(prefers-color-scheme: dark)', color: '#15151F' },
  ],
};

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('gv-theme');if(t==='light'||(!t&&matchMedia('(prefers-color-scheme: light)').matches))document.documentElement.classList.add('light')}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${display.variable} ${ui.variable} ${mono.variable}`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
