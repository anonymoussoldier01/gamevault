export default function DmcaPage() {
  return (
    <article className="surface mx-auto max-w-3xl rounded-3xl p-6 sm:p-10">
      <h1 className="font-display text-3xl font-bold">DMCA Takedown — GameVault</h1>
      <p className="t-muted mt-2 text-sm">17 U.S.C. §512 · abuse@gamevault.gg · 48-hour removal promise</p>
      <div className="t-muted mt-4 space-y-4 text-sm leading-relaxed">
        <p>GameVault respects copyright. We embed third-party content only and host no infringing files. To request removal of a listing, email <strong>abuse@gamevault.gg</strong> with:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Your name, company, and authority to act for the owner</li>
          <li>Exact GameVault URL (e.g. /play/fnaf1) + original work identification</li>
          <li>Proof of ownership (store link, registration, or signed statement)</li>
          <li>“I have a good-faith belief…” + “under penalty of perjury…” statements + physical/electronic signature</li>
        </ol>
        <p>Process: acknowledge in 24h → remove/disable in 48h → confirm by email. To dispute over-blocking, reply with a counter-notice including consent to jurisdiction.</p>
        <p className="surface2 rounded-xl p-3 text-xs t-muted">Mail template: Subject “DMCA — [game title] — [your company]”. Body: URLs, proof, statements, contact. Send to abuse@gamevault.gg.</p>
      </div>
    </article>
  );
}
