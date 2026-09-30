/** In-proxy arcade: targets that block direct framing but work through proxies.
 *  These are NOT main-catalog entries (which stay verified-direct). Badges are honest. */

export interface ProxyGame {
  slug: string;
  title: string;
  emoji: string;
  target: string;
  blurb: string;
  badge: string;
  kind: 'proxy' | 'guide' | 'linkout';
}

export const PROXY_GAMES: ProxyGame[] = [
  { slug: 'poki-subway', title: 'Subway Surfers (Official)', emoji: '🚇', target: 'https://poki.com/en/g/subway-surfers', blurb: 'Official Poki build, SYBO version', badge: 'partial · saves may break', kind: 'proxy' },
  { slug: 'poki-temple', title: 'Temple Run 2 (Official)', emoji: '🏃', target: 'https://poki.com/en/g/temple-run-2', blurb: 'Official Poki build', badge: 'partial', kind: 'proxy' },
  { slug: 'cg-smashkarts', title: 'Smash Karts (Official)', emoji: '🏎️', target: 'https://www.crazygames.com/game/smash-karts', blurb: 'Official CrazyGames build', badge: 'partial · login breaks', kind: 'proxy' },
  { slug: 'cg-shellshockers', title: 'Shell Shockers (Official)', emoji: '🥚', target: 'https://www.crazygames.com/game/shell-shockers', blurb: 'Official build, egg FPS', badge: 'partial', kind: 'proxy' },
  { slug: 'coolmath-hub', title: 'CoolMath Games', emoji: '🧮', target: 'https://www.coolmathgames.com/', blurb: 'Whole portal, proxy-friendly', badge: 'works well', kind: 'proxy' },
  { slug: 'coolmath-run', title: 'Run 3 (CoolMath)', emoji: '🏃', target: 'https://www.coolmathgames.com/0-run-3', blurb: 'CoolMath edition', badge: 'works well', kind: 'proxy' },
  { slug: 'coolmath-moto', title: 'Moto X3M (CoolMath)', emoji: '🏍️', target: 'https://www.coolmathgames.com/0-moto-x3m', blurb: 'CoolMath edition', badge: 'works well', kind: 'proxy' },
  { slug: 'coolmath-papas', title: "Papa's Pizzeria (CoolMath)", emoji: '🍕', target: 'https://www.coolmathgames.com/0-papas-pizzeria', blurb: 'CoolMath edition', badge: 'works well', kind: 'proxy' },
  { slug: 'nowgg-roblox', title: 'Roblox (now.gg)', emoji: '🧱', target: 'https://now.gg/play/roblox-corporation/5349/roblox', blurb: 'Cloud Roblox in browser', badge: 'needs proxy + login', kind: 'guide' },
  { slug: 'nowgg-fortnite', title: 'Fortnite (now.gg)', emoji: '🪂', target: 'https://now.gg/play/epic-games/5167/fortnite', blurb: 'Cloud Fortnite in browser', badge: 'needs proxy + login', kind: 'guide' },
  { slug: 'gfn', title: 'GeForce NOW', emoji: '☁️', target: 'https://www.nvidia.com/en-us/geforce-now/', blurb: 'Cloud PC gaming (account needed)', badge: 'premium · link-out', kind: 'linkout' },
  { slug: 'y8-hub', title: 'Y8 Games', emoji: '🕹️', target: 'https://www.y8.com/', blurb: 'Huge portal, mostly embeddable direct', badge: 'try direct first', kind: 'proxy' },
];
