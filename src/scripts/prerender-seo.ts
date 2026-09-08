import fs from 'fs';
import path from 'path';
import { injectSeoMeta, generateSitemapXml } from '../api/seo';

const CLIENT_DIST = path.join(__dirname, '../../client/dist');

const PRERENDER_ROUTES = [
  '/',
  '/food-wheel',
  '/excuse-generator',
  '/handsome',
  '/cv-review',
  '/music',
  '/pixel-agents',
  '/numerology',
  '/gender-quiz',
  '/astrology',
  '/qr-generator',
  '/cost-study',
  '/tarot',
  '/magic-ball',
  '/deep-status',
  '/chicken-game',
  '/burnout-check',
  '/poem-generator',
  '/chibi-sticker',
  '/face-reader',
  '/dream-interpreter',
  '/tech-duel',
  '/english',
  '/english/chat',
  '/english/flashcard',
  '/english/challenge',
  '/english/dictionary',
  '/english/daily-puzzle',
  '/english/word-sprint',
  '/english/spelling-bee',
  '/english/course',
  '/english/writing',
  '/english/dictation',
  '/english/scramble',
  '/english/word-match',
  '/english/idiom-quest',
  '/english/context-clues',
  '/petlandingpage',
  '/tutien',
  '/quiz',
  '/mermaid-editor',
  '/mermaid-tutorial',
  '/digital-detox',
  '/poe2-trade-link',
  '/note-daily',
  '/love8d',
  '/profile',
  '/emulator-check',
];

function prerender(): void {
  const indexHtmlPath = path.join(CLIENT_DIST, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ client/dist/index.html not found. Run `npm run build-client` first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  let created = 0;

  for (const route of PRERENDER_ROUTES) {
    if (route === '/') continue;

    const dirPath = path.join(CLIENT_DIST, route);
    const filePath = path.join(dirPath, 'index.html');

    if (fs.existsSync(filePath)) continue;

    const injectedHtml = injectSeoMeta(baseHtml, route);

    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, injectedHtml, 'utf-8');
    created++;
  }

  const rootHtml = injectSeoMeta(baseHtml, '/');
  fs.writeFileSync(indexHtmlPath, rootHtml, 'utf-8');

  const sitemapPath = path.join(CLIENT_DIST, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, generateSitemapXml(), 'utf-8');

  console.log(`✅ Pre-rendered ${created} routes + root index.html + sitemap.xml`);
}

prerender();
