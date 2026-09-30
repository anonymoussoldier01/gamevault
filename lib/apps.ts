export interface AppDef {
  slug: string;
  title: string;
  emoji: string;
  blurb: string;
}

export const APPS: AppDef[] = [
  { slug: 'calculator', title: 'Calculator', emoji: '🧮', blurb: 'Full calculator, keyboard supported' },
  { slug: 'notes', title: 'Quick Notes', emoji: '📝', blurb: 'Autosaves in this browser' },
  { slug: 'paint', title: 'Paint', emoji: '🎨', blurb: 'Draw, colors, download PNG' },
  { slug: 'piano', title: 'Piano', emoji: '🎹', blurb: 'Playable synth keyboard' },
  { slug: 'timer', title: 'Timer & Stopwatch', emoji: '⏱️', blurb: 'Countdowns and lap timer' },
  { slug: 'weather', title: 'Weather', emoji: '🌤️', blurb: 'Live forecast, no signup' },
  { slug: 'dictionary', title: 'Dictionary', emoji: '📖', blurb: 'Definitions, free API' },
];
