const artById: Record<string, string> = {
  'android-toolbox': 'usb', deeplink: 'mobile', webview: 'webview', qr: 'qr', 'rn-guide': 'guide',
  chatdvt: 'chatdvt', mermaid: 'tools', cv: 'cv', note: 'note', detox: 'detox', duel: 'duel',
  burnout: 'burnout', poe2: 'trade', english: 'learn', chibi: 'ai', survivor: 'fun', quiz: 'quiz', food: 'food', poem: 'poem',
};

export function FeatureArt({ id, label }: { id: string; label: string }) {
  if (id === 'cicd') return <span className="feature-art art-cicd" data-feature-art={id} role="img" aria-label={label}>
    <svg viewBox="0 0 480 240" aria-hidden="true"><defs><pattern id="cicd-card-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="currentColor" opacity=".12" /></pattern></defs>
      <rect width="480" height="240" fill="url(#cicd-card-grid)" /><rect className="cicd-art-group" x="110" y="34" width="342" height="170" rx="16" />
      <text x="132" y="59" className="cicd-art-heading">GITHUB ACTIONS</text><path className="cicd-art-line" d="M80 120H137 M216 120H241 M320 120H345" />
      <g className="cicd-art-card"><rect x="20" y="87" width="60" height="66" rx="12" /><rect x="137" y="87" width="79" height="66" rx="12" /><rect x="241" y="87" width="79" height="66" rx="12" /><rect x="345" y="87" width="79" height="66" rx="12" /></g>
      <g className="cicd-art-symbol" fill="none" strokeWidth="2.5"><path d="M42 112l-6 6 6 6m15-12 6 6-6 6m-8-17-4 22" /><path d="M169 107v20m0-12h15v12" /><circle cx="169" cy="106" r="3" /><circle cx="169" cy="130" r="3" /><circle cx="184" cy="130" r="3" /><path d="m275 106 12 7v14l-12 7-12-7v-14z" /><path d="M364 114h39m-20-11v31m-8-8 8 8 8-8" /></g>
      <g className="cicd-art-caption"><text x="50" y="144">PUSH</text><text x="176" y="144">CHECKOUT</text><text x="280" y="144">BUILD</text><text x="384" y="144">DEPLOY</text></g>
    </svg><span className="cicd-art-label">YAML → WORKFLOW</span>
  </span>;
  return <span className={'feature-art art-' + (artById[id] || 'tools')} data-feature-art={id} role="img" aria-label={label} />;
}
