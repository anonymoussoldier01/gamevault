export default function PrivacyPage() {
  return (
    <article className="surface mx-auto max-w-3xl rounded-3xl p-6 sm:p-10">
      <h1 className="font-display text-3xl font-bold">Privacy Policy — GameVault</h1>
      <p className="t-muted mt-2 text-sm">Last updated: September 2026</p>
      <div className="t-muted mt-4 space-y-4 text-sm leading-relaxed">
        <p><strong>Local-first.</strong> Cloak mode, theme, favorites, recent games, ratings, notes, and search history live in your browser’s localStorage only. We run no accounts and no server-side tracking.</p>
        <p><strong>Third-party embeds.</strong> Playing a game loads the provider’s iframe (e.g. *.github.io, jsDelivr, EmulatorJS CDN, Ruffle CDN). Those providers may set cookies or log IPs per their own policies — we cannot control them. Heavy ports stream large files from jsDelivr at your request only (after click-to-play).</p>
        <p><strong>Analytics/ads (future).</strong> If enabled later (e.g. privacy-friendly analytics, AdSense), this page will be updated and consent requested where required.</p>
        <p><strong>Contact.</strong> Privacy questions or deletion (nothing stored server-side, but embed concerns): abuse@gamevault.gg.</p>
      </div>
    </article>
  );
}
