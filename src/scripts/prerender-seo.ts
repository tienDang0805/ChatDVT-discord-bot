import fs from 'fs';
import path from 'path';
import { generateSitemapXml, getIndexableRoutePaths, injectSeoMeta } from '../api/seo';
import { loadPublicRenderer, renderPublicHtml, RENDERER_DIRECTORY } from '../api/public-renderer';

const CLIENT_DIST = path.join(__dirname, '../../client/dist');
const indexHtmlPath = path.join(CLIENT_DIST, 'index.html');
if (!fs.existsSync(indexHtmlPath)) throw new Error('Build the client before prerendering.');
const shellPath = path.join(RENDERER_DIRECTORY, 'app-shell.html');
// Keep the empty SPA template separate so fallback routes never inherit Home content.
const builtHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const baseHtml = builtHtml.includes('data-ssr="true"') ? fs.readFileSync(shellPath, 'utf8') : builtHtml;
fs.mkdirSync(RENDERER_DIRECTORY, { recursive: true });
fs.writeFileSync(shellPath, baseHtml);
const renderer = loadPublicRenderer();
let rendered = 0;
for (const route of getIndexableRoutePaths()) {
  // Blog data changes without deployments; Express renders these routes at request time.
  if (/^\/(en\/)?blog(?:\/|$)/.test(route)) continue;
  const html = renderer.canRenderPage(route) ? renderPublicHtml(baseHtml, route) : injectSeoMeta(baseHtml, route);
  const target = path.join(CLIENT_DIST, route, 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
  if (renderer.canRenderPage(route)) rendered++;
}
fs.writeFileSync(path.join(CLIENT_DIST, 'sitemap.xml'), generateSitemapXml());
console.log(`Rendered content for ${rendered} public routes; generated metadata and sitemap for remaining routes.`);
