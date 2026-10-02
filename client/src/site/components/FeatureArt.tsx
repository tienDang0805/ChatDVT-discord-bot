const artById: Record<string, string> = {
  'android-toolbox': 'usb', deeplink: 'mobile', webview: 'webview', qr: 'qr', 'rn-guide': 'guide',
  chatdvt: 'chatdvt', mermaid: 'tools', cv: 'cv', note: 'note', detox: 'detox', duel: 'duel',
  burnout: 'burnout', poe2: 'trade', english: 'learn', chibi: 'ai', survivor: 'fun', quiz: 'quiz', food: 'food', poem: 'poem',
};

export function FeatureArt({ id, label }: { id: string; label: string }) {
  return <span className={'feature-art art-' + (artById[id] || 'tools')} data-feature-art={id} role="img" aria-label={label} />;
}
