import { archiveItems, mobileItems, projectItems } from './siteData';
import type { SiteItem } from './siteData';

export type CollectionCategory = 'all' | 'mobile' | 'tools' | 'fun';
export const categories: CollectionCategory[] = ['all', 'mobile', 'tools', 'fun'];
const mobileIds = new Set(mobileItems.map(item => item.id));
export function categoryOf(item: SiteItem): Exclude<CollectionCategory, 'all'> {
  if (mobileIds.has(item.id)) return 'mobile';
  if (['chibi', 'survivor', 'quiz', 'food', 'poem'].includes(item.id) || item.section === 'game') return 'fun';
  return 'tools';
}
const priority = ['deeplink', 'android-toolbox', 'webview', 'qr', 'rn-guide', 'mermaid', 'chatdvt', 'cv', 'note', 'detox', 'duel', 'burnout', 'poe2', 'english', 'survivor', 'chibi', 'quiz', 'food', 'poem'];
const promoted = [...projectItems, ...mobileItems].filter(item => item.id !== 'mobile-toolkit' && (item.visibility === 'featured' || item.visibility === 'public'));
export const collectionItems = [...new Map(promoted.map(item => [item.id, item])).values()].sort((a, b) => {
  const rank = (id: string) => priority.includes(id) ? priority.indexOf(id) : 99;
  return rank(a.id) - rank(b.id);
});
export const collectionArchive = archiveItems;
export const categoryNames = {
  all: ['Tất cả', 'All'], mobile: ['Mobile', 'Mobile'], tools: ['Tool', 'Tools'], fun: ['Giải trí', 'Fun'],
};
const descriptions: Record<string, string> = {
  'android-toolbox': 'Connect an Android device over USB to control apps, test permissions, capture screenshots and inspect logs.',
  deeplink: 'Build and test URIs, generate QR codes and app-opening commands for iOS and Android.',
  chatdvt: 'A Discord AI chatbot for conversations, media analysis, summaries and mini games.',
  chibi: 'Turn a photo into chibi stickers in different styles and poses.',
  english: 'Course maps, flashcards, dictation, writing and AI conversations in one learning hub.',
  food: 'Get meal ideas and create a wheel to help choose what to eat.',
  survivor: 'An auto-shooter roguelike with 50 waves, bosses and skill upgrades.',
  webview: 'Test websites in a WebView and inspect their behavior on mobile.',
  qr: 'Generate QR codes for links, text and other everyday uses.',
  'rn-guide': 'A React Native learning guide covering architecture, testing and CI/CD.',
  mermaid: 'Write, preview, style and export flowcharts and diagrams in the browser.',
  cv: 'Review a CV, assess ATS compatibility and improve its wording with AI.',
  quiz: 'Create real-time quiz rooms with questions generated for a topic.',
  note: 'Daily notes with a calendar and streak, stored on your device.',
  detox: 'Track a 30-day challenge to reduce social-media use.',
  duel: 'Compare two technologies and summarize tradeoffs for your needs.',
  burnout: 'A brief self-check on workload; not a medical assessment.',
  poe2: 'Turn an item description into a structured trade query and link.',
  poem: 'Generate poems by topic, tone and form.',
};
export function collectionDescription(item: SiteItem, en: boolean) { return en ? descriptions[item.id] || item.description : item.description; }
