export default function TermsPage() {
  return (
    <article className="surface mx-auto max-w-3xl rounded-3xl p-6 sm:p-10">
      <h1 className="font-display text-3xl font-bold">Terms of Service — GameVault</h1>
      <p className="t-muted mt-2 text-sm">Last updated: September 2026 · Contact: abuse@gamevault.gg</p>
      <div className="t-muted mt-4 space-y-4 text-sm leading-relaxed">
        <p><strong>1. No hosting, embeds only.</strong> GameVault hosts no game files, ROMs, or binaries (except tiny cloak icons). All titles are embedded from third-party sources via iframes, or loaded at runtime from public CDNs (jsDelivr, GitHub Pages, EmulatorJS). We claim no ownership.</p>
        <p><strong>2. Ownership.</strong> All games, trademarks (e.g. FNAF, Pokemon, Minecraft, Subway Surfers, GTA), and art belong to their respective owners. Titles shown are for identification/search only.</p>
        <p><strong>3. Takedown.</strong> Rights holders may request removal via <a href="/dmca" className="underline">/dmca</a>. We remove or disable the listing within 48 hours. Repeat notices for the same host result in permanent domain-level blocks.</p>
        <p><strong>4. Risk accepted.</strong> You acknowledged embed risk. If our host (e.g. Vercel) issues a notice, affected listings are removed immediately — no counter-notice filed on unlicensed mirrors.</p>
        <p><strong>5. Use.</strong> Games are provided “as is” for personal entertainment. Heavy Unity/Godot ports (300MB+) require a modern desktop browser. Flash titles run via Ruffle; emulator titles require your own lawful ROM rights where applicable.</p>
        <p><strong>6. Cloak features.</strong> Tab disguise, about:blank stealth, and panic redirects are provided for privacy. Do not use them to violate school/workplace policies — you are responsible for compliance.</p>
      </div>
    </article>
  );
}
