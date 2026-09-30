/** Auto-generated controls + FAQ per category (slots filled with game title at render). */

export interface Guide {
  controls: string[];
  tips: string[];
  faqs: Array<{ q: string; a: string }>;
}

const G: Record<string, Guide> = {
  racing: {
    controls: ['Steer: Arrow keys or A/D', 'Accelerate / brake: W/S or Up/Down', 'Handbrake / drift: Space', 'Restart run: R'],
    tips: ['Brake before corners, not in them', 'Use the whole track on exits', 'Shortcuts are rarely worth the risk'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download. Works on school Chromebooks.' },
      { q: 'What are the controls for {T}?', a: 'Arrows or WASD to drive, Space to drift or brake. Fullscreen button is under the player.' },
      { q: 'Why is {T} laggy?', a: 'Close other tabs and lower your browser zoom. Heavy 3D games need a few seconds to warm up.' },
    ],
  },
  action: {
    controls: ['Move: WASD or Arrows', 'Attack / shoot: Mouse or J/Z', 'Jump: Space', 'Aim: Mouse'],
    tips: ['Keep moving — standing still gets you hit', 'Learn one combo at a time', 'Use fullscreen for aiming games'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download. Works on school Chromebooks.' },
      { q: 'What are the controls for {T}?', a: 'WASD or arrows to move, mouse or J/Z to attack, Space to jump.' },
      { q: 'Can I play {T} on mobile?', a: 'Most action games need a keyboard. Puzzle and clicker games work best on touch.' },
    ],
  },
  puzzle: {
    controls: ['Select / drag: Mouse or touch', 'Undo: U or Z', 'Restart level: R'],
    tips: ['Stuck? Take a break and retry fresh', 'Watch for patterns, not pieces', 'Undo is free — experiment'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download.' },
      { q: 'Is {T} good for short breaks?', a: 'Yes — puzzle games save progress per level and work great on any device.' },
      { q: 'Does {T} need a keyboard?', a: 'No — mouse or touch is enough for nearly every puzzle game here.' },
    ],
  },
  adventure: {
    controls: ['Move: WASD or Arrows', 'Interact: E or Z', 'Inventory / menu: Tab or Esc', 'Fullscreen: button under player'],
    tips: ['Talk to everyone', 'Save often where supported', 'Explore off the main path'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download.' },
      { q: 'How long is {T}?', a: 'Story games range from 20 minutes to several hours. Progress may not save between visits.' },
      { q: 'What are the controls for {T}?', a: 'WASD/arrows to move, E or Z to interact. Check the in-game help for specifics.' },
    ],
  },
  horror: {
    controls: ['Move: WASD', 'Flashlight / interact: F or E', 'Run: Shift', 'Headphones recommended 🎧'],
    tips: ['Play with the lights on (or off, brave)', 'Headphones change everything', 'Check every drawer'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download.' },
      { q: 'Is {T} scary?', a: 'It is in the horror section for a reason. Jump scares likely. You were warned.' },
      { q: 'Why headphones for {T}?', a: 'Horror games hide audio cues — footsteps, breathing, whispers — you will miss on speakers.' },
    ],
  },
  'sports-action': {
    controls: ['Move: Arrows or WASD', 'Kick / throw / punch: Space or X', 'Player 2: separate keys shown in-game'],
    tips: ['Timing beats button-mashing', '2-player mode doubles the chaos', 'Short rounds — perfect for breaks'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download.' },
      { q: 'Can two people play {T} on one keyboard?', a: 'Many sports-action games include local 2-player — check the in-game menu.' },
      { q: 'What are the controls for {T}?', a: 'Arrows/WASD to move, Space or X to act. Player-2 keys are shown in game.' },
    ],
  },
  strategy: {
    controls: ['Select / place: Mouse', 'Speed up: Space or +/-', 'Pause: P', 'Best on desktop'],
    tips: ['Economy first, army second', 'Idle games reward check-ins', 'Read tooltips — seriously'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download.' },
      { q: 'Does {T} save progress?', a: 'Many idle/strategy games autosave in your browser. Clearing site data wipes saves.' },
      { q: 'Is {T} good on mobile?', a: 'Clicker and idle games work on touch; tower defense is best on desktop.' },
    ],
  },
  sandbox: {
    controls: ['Move / camera: WASD + mouse', 'Place / mine: Left click', 'Inventory: E or Tab'],
    tips: ['Experiment — there is no losing', 'Fullscreen helps builders', 'Saves may persist in your browser'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download.' },
      { q: 'Does {T} save my world?', a: 'Many sandbox games autosave locally. Clearing site data wipes saves.' },
      { q: 'What are the controls for {T}?', a: 'WASD + mouse for camera, click to place/mine, E for inventory.' },
    ],
  },
  retro: {
    controls: ['D-pad: Arrows', 'A / B: Z / X', 'Start: Enter', 'Click inside the emulator first'],
    tips: ['Click inside the game before pressing keys', 'Enter opens most menus', 'Save states where supported'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play — the emulator loads in your browser, no download, no BIOS needed.' },
      { q: 'Why do keys not work in {T}?', a: 'Click inside the game frame first so it captures your keyboard.' },
      { q: 'Is {T} the full game?', a: 'Emulator ports mirror the original. All games © their owners — removal via /dmca.' },
    ],
  },
  'rhythm-action': {
    controls: ['Hit notes: Arrow keys / D F J K', 'Pause: Esc or P', 'Calibrate offset in settings if available'],
    tips: ['Use headphones', 'Watch the beat line, not the notes', 'Start on easy speed'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download.' },
      { q: 'Why is my timing off in {T}?', a: 'Bluetooth audio adds delay — use wired headphones or speakers for rhythm games.' },
      { q: 'What are the controls for {T}?', a: 'Arrow keys or D F J K to hit notes. Check settings for key remapping.' },
    ],
  },
  io: {
    controls: ['Move: Mouse or WASD', 'Attack / boost: Click or Space', 'Fullscreen recommended'],
    tips: ['You respawn — play aggressive', 'Eat the small, dodge the big', 'Fullscreen + mute tab audio if needed'],
    faqs: [
      { q: 'How do I play {T} unblocked?', a: 'Click Play — official servers load in your browser, no account needed.' },
      { q: 'Is {T} multiplayer?', a: 'Yes — .io games put you in live arenas with real players worldwide.' },
      { q: 'Why is {T} laggy?', a: 'Live multiplayer depends on your connection. Close other tabs and retry.' },
    ],
  },
};

const FALLBACK: Guide = {
  controls: ['Move: Arrows or WASD', 'Act: Space or mouse', 'Pause: P'],
  tips: ['Fullscreen helps', 'Click inside the game first'],
  faqs: [
    { q: 'How do I play {T} unblocked?', a: 'Click Play and the game loads instantly in your browser — no download.' },
    { q: 'What are the controls for {T}?', a: 'Arrows/WASD to move, Space or mouse to act. In-game help has the rest.' },
    { q: 'Does {T} work on Chromebook?', a: 'Yes — every game here runs in the browser with no install.' },
  ],
};

export function guideFor(category: string): Guide {
  return G[category] ?? FALLBACK;
}

export function fillGuide(g: Guide, title: string): Guide {
  const fill = (s: string) => s.replaceAll('{T}', title);
  return {
    controls: g.controls.map(fill),
    tips: g.tips.map(fill),
    faqs: g.faqs.map((f) => ({ q: fill(f.q), a: fill(f.a) })),
  };
}
