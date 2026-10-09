require('ts-node/register');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const { prisma } = require('../src/database/prisma');
const { createPublicPageHandler, renderPublicHtml } = require('../src/api/public-renderer');
const { createClientFilesRouter, preventResponseCaching } = require('../src/api/client-files');
const { createSeoFallbackHandler, generateSitemapXml } = require('../src/api/seo');
const renderer = require('../dist/seo/renderer.cjs');
const template = fs.readFileSync(path.join(__dirname, '../client/index.html'), 'utf8');

function rootContent(html) {
  return html.match(/<div id="root" data-ssr="true">([\s\S]*)<\/div>/)?.[1] || '';
}

// These assertions inspect the visible React output, not merely metadata or noscript.
test('public VI/EN pages contain visible content without executing JavaScript', () => {
  for (const route of ['/', '/me', '/playground', '/discord', '/chat']) {
    for (const localized of [route, route === '/' ? '/en' : `/en${route}`]) {
      const html = renderPublicHtml(template, localized);
      assert.match(rootContent(html), /<main id="site-main"/);
      assert.match(rootContent(html), /<h1[ >]/);
      assert.doesNotMatch(rootContent(html), /data-guide=|data-tour-progress|guide-speech|chat-widget-container/);
      assert.match(rootContent(html), /href="\/(en\/)?me"/);
      assert.doesNotMatch(html, /<noscript>|template data-msg|Ối! Có lỗi xảy ra/);
      assert.match(html, new RegExp(`<html class="dark" lang="${localized.startsWith('/en') ? 'en' : 'vi'}"`));
    }
  }
  const en = renderPublicHtml(template, '/en/me');
  const vi = renderPublicHtml(template, '/me');
  assert.match(en, /About Đặng Văn Tiến — React Native/);
  assert.match(vi, /Về Đặng Văn Tiến — Kỹ sư/);
  assert.match(renderPublicHtml(template, '/en/me'), /About Đặng Văn Tiến — React Native/);
  assert.doesNotMatch(generateSitemapXml(), /<loc>https:\/\/devtiendang.blog\/(en\/)?mobile<\/loc>/);
});

test('public identity and ChatDVT history remain readable and agree with structured data', () => {
  function schema(html) {
    return JSON.parse(html.match(/<script id="page-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  }
  for (const prefix of ['', '/en']) {
    const home = renderPublicHtml(template, prefix || '/');
    const about = renderPublicHtml(template, `${prefix}/me`);
    const bot = renderPublicHtml(template, `${prefix}/discord`);
    for (const fact of ['Đặng Văn Tiến', 'South Telecom', '2023', 'Android Barcode Scanning SDK', 'CameraX', 'React Native', 'Woni Service Robot', 'Vikki Bank', 'ChatDVT', 'Node.js']) {
      assert.ok(rootContent(about).includes(fact), `Visible profile is missing ${fact}`);
    }
    assert.match(rootContent(home), /Mobile Software Engineer/);
    assert.match(rootContent(home), /React Native/);
    for (const html of [home, about]) assert.match(html, /name="robots" content="index, follow/);
    assert.match(rootContent(bot), /Đặng Văn Tiến/);
    assert.match(rootContent(bot), /8D/);
    assert.match(rootContent(bot), /Telegram/);
    assert.match(rootContent(bot), /href="\/(en\/)?blog\/chatdvt-phan-1"/);
    const person = schema(about).mainEntity;
    assert.equal(person.worksFor.name, 'South Telecom');
    assert.equal(person.alumniOf.name, 'PTIT HCM');
    for (const name of ['Tiến Đặng', 'Tien Dang', 'Dang Van Tien', 'devtiendang']) assert.ok(person.alternateName.includes(name));
    assert.match(person.homeLocation.name, /Hồ Chí Minh/);
    assert.deepEqual(schema(home)['@graph'].find(node => node['@type'] === 'Person'), person);
    assert.deepEqual(schema(bot).creator, person);
    assert.equal(schema(bot).name, 'ChatDVT');
    assert.equal(schema(bot)['@id'], 'https://devtiendang.blog/discord#chatdvt');
    assert.ok(schema(bot).sameAs.includes('https://github.com/tienDang0805/ChatDVT-discord-bot'));
    assert.doesNotMatch(schema(bot).featureList.join(' '), /discovery guide|Giới thiệu website/);
    assert.match(schema(bot).featureList[0], prefix ? /web and Discord/ : /web và Discord/);
    for (const topic of ['Mobile App Development', 'React Native', 'Android', 'Kotlin', 'Discord.js', 'Google Gemini']) assert.ok(person.knowsAbout.includes(topic));
    const chat = schema(renderPublicHtml(template, `${prefix}/chat`));
    assert.equal(chat.name, 'ChatDVT Chat');
    assert.equal(chat.applicationCategory, 'CommunicationApplication');
    assert.deepEqual(chat.author, person);
    assert.match(schema(bot).description, /8D/);
    const sitemap = generateSitemapXml();
    for (const route of [prefix || '/', `${prefix}/me`, `${prefix}/discord`]) {
      const lastmod = route.endsWith('/me') || route.endsWith('/discord') ? '2026-10-09' : '2026-10-06';
      assert.ok(sitemap.includes(`<loc>https://devtiendang.blog${route}</loc>\n    <lastmod>${lastmod}</lastmod>`));
    }
  }
});

test('ChatDVT has a linked product and history identity while Home remains a personal portfolio', () => {
  const schema = html => JSON.parse(html.match(/<script id="page-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  for (const prefix of ['', '/en']) {
    const home = renderPublicHtml(template, prefix || '/');
    assert.match(home, /<title>Đặng Văn Tiến — Mobile Developer<\/title>/);
    assert.equal(schema(home)['@graph'].find(node => node['@type'] === 'WebSite').name, 'Đặng Văn Tiến');

    const product = renderPublicHtml(template, `${prefix}/discord`);
    const introduction = rootContent(product).match(/<p class="lede">([\s\S]*?)<\/p>/)[1];
    for (const fact of ['ChatDVT', 'Đặng Văn Tiến', '8D', 'Telegram', 'Discord']) assert.ok(introduction.includes(fact));
    assert.ok(introduction.includes(`href="${prefix}/me"`));
    assert.doesNotMatch(rootContent(product), /class="discord-origin/);
    assert.ok(rootContent(product).includes(`href="${prefix}/blog/chatdvt-phan-1"`));

    const articlePath = `${prefix}/blog/chatdvt-phan-1`;
    // A narrative CMS excerpt must not replace the agreed history summary.
    const post = { ...renderer.DEFAULT_BLOG_POST, excerpt: 'A narrative excerpt from the CMS.' };
    const article = renderPublicHtml(template, articlePath, { pathname: articlePath, post });
    const description = article.match(/<meta name="description" content="([^"]*)"/)[1];
    for (const fact of ['ChatDVT', 'Đặng Văn Tiến', '8D', 'Telegram', 'Google Apps Script', 'Gemini', 'Discord.js']) assert.ok(description.includes(fact));
    assert.equal(schema(article).about['@id'], schema(product)['@id']);
    assert.equal(schema(article).author['@id'], schema(product).creator['@id']);
    assert.equal(schema(article).datePublished, post.publishedAt);
    assert.equal(schema(article).dateModified, post.updatedAt);
    assert.ok(rootContent(article).includes(`href="${prefix}/discord"`));
    assert.ok(rootContent(article).includes(`href="${prefix}/me"`));
    assert.match(article, /rel="canonical" href="https:\/\/devtiendang.blog\/blog\/chatdvt-phan-1"/);
    assert.match(article, prefix ? /name="robots" content="noindex, nofollow/ : /name="robots" content="index, follow/);

    const about = rootContent(renderPublicHtml(template, `${prefix}/me`));
    const sideProject = about.match(/<section class="me-side[\s\S]*?<\/section>/)[0];
    assert.ok(sideProject.includes(`href="${prefix}/discord"`));
    assert.ok(sideProject.includes(`href="${articlePath}"`));
    for (const fact of ['8D', 'Telegram', 'Discord']) assert.ok(sideProject.includes(fact));
  }
  const pathname = '/blog/unrelated-post';
  const post = { ...renderer.DEFAULT_BLOG_POST, slug: 'unrelated-post', title: 'Another project', excerpt: 'Its own description.' };
  const article = renderPublicHtml(template, pathname, { pathname, post });
  assert.match(article, /name="description" content="Its own description\."/);
  assert.equal(schema(article).about, undefined);
  assert.doesNotMatch(rootContent(article).match(/<footer class="blog-article__footer">([\s\S]*?)<\/footer>/)[1], /Xem ChatDVT/);
});

test('desktop app pages expose localized content, Windows downloads and product identity without JavaScript', () => {
  const source = 'https://github.com/tienDang0805/TD_WallpaperEngine';
  const sitemap = generateSitemapXml();
  for (const prefix of ['', '/en']) {
    const listPath = `${prefix}/apps`, appPath = `${listPath}/td-wallpaperengine`;
    const list = renderPublicHtml(template, listPath), app = renderPublicHtml(template, appPath);
    assert.match(rootContent(list), /TD-WallpaperEngine/);
    assert.ok(rootContent(list).includes(`href="${appPath}"`));
    assert.match(rootContent(app), /Windows 10 \/ 11/);
    assert.match(rootContent(app), /C# · .NET 10 · WPF · mpv/);
    assert.ok(rootContent(app).includes(`href="${source}/releases/latest"`));
    assert.ok(rootContent(app).includes(`href="${source}"`));
    assert.match(rootContent(app), prefix ? /Images and videos, right on your desktop/ : /Ảnh và video làm hình nền desktop/);
    assert.match(rootContent(app), /href="#download"/);
    assert.match(rootContent(app), /id="download"/);
    assert.ok(rootContent(app).includes(`aria-current="page" class="is-active" href="${listPath}"`));
    for (const [route, html] of [[listPath, list], [appPath, app]]) {
      assert.match(html, /name="robots" content="index, follow/);
      assert.ok(html.includes(`rel="canonical" href="https://devtiendang.blog${route}"`));
      assert.ok(sitemap.includes(`<loc>https://devtiendang.blog${route}</loc>`));
      assert.ok(html.includes(`hreflang="en" href="https://devtiendang.blog/en${route.replace(/^\/en/, '')}"`));
    }
    const schema = JSON.parse(app.match(/<script id="page-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@type'], 'SoftwareApplication');
    assert.equal(schema.name, 'TD-WallpaperEngine');
    assert.equal(schema['@id'], 'https://devtiendang.blog/apps/td-wallpaperengine#software');
    assert.equal(schema.operatingSystem, 'Windows 10, Windows 11 (64-bit)');
    assert.equal(schema.applicationCategory, 'DesktopEnhancementApplication');
    assert.equal(schema.creator['@id'], 'https://devtiendang.blog/me#person');
    assert.equal(schema.downloadUrl, `${source}/releases/latest`);
    assert.equal(schema.featureList.length, 6);
    assert.ok(schema.sameAs.includes(source));
    assert.ok(schema.image.startsWith('https://devtiendang.blog/images/apps/'));
    assert.equal(schema.aggregateRating, undefined);
  }
});

test('SSR article sanitization and embedded JSON cannot introduce executable HTML', () => {
  const pathname = '/blog/security-example';
  const post = { ...renderer.DEFAULT_BLOG_POST, slug: 'security-example', title: 'Example $& </script><script>bad()</script>',
    excerpt: '</script><img src=x onerror=bad()>',
    content: '<h2>Article body</h2><p>Readable text</p><script>bad()</script><img src="x" onerror="bad()"><a href="jav&#x61;script:bad()">Unsafe link</a><img src="data:image/svg+xml;base64,abc"><a href="https://example.com">Safe link</a>' };
  const html = renderPublicHtml(template, pathname, { pathname, post });
  const content = rootContent(html);
  assert.match(content, /Article body/);
  assert.match(content, /Readable text/);
  assert.doesNotMatch(content, /<script>|onerror=|href="javascript:|data:image\/svg/);
  assert.match(content, /href="https:\/\/example.com" target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /<script>bad\(\)<\/script>/);
  const latePost = { ...post, publishedAt: '2026-10-05T20:00:00.000Z' };
  assert.match(rootContent(renderPublicHtml(template, pathname, { pathname, post: latePost })), /06.10.2026/);
  const payload = html.match(/<script id="public-page-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(payload).post.title, post.title);
  const structuredData = html.match(/<script id="page-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.ok(JSON.parse(structuredData));
  assert.match(JSON.parse(structuredData).headline, /Example \$&/);
});

test('HTTP public renderer reads published blog data, protects errors and preserves SPA routes', async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'devtiendang-seo-'));
  fs.writeFileSync(path.join(root, 'index.html'), template);
  fs.mkdirSync(path.join(root, 'blog'));
  fs.writeFileSync(path.join(root, 'blog/index.html'), '<html>stale prerendered blog list</html>');
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const post = { ...renderer.DEFAULT_BLOG_POST, id: 100, slug: 'published-example', title: 'Published example',
    excerpt: 'Latest database excerpt', content: '<h2>Full published article</h2><p>Visible without JavaScript.</p>',
    publishedAt: new Date('2026-10-05T00:00:00Z'), createdAt: new Date('2026-10-01T00:00:00Z'), updatedAt: new Date('2026-10-05T00:00:00Z') };
  const originalMany = prisma.blogPost.findMany, originalFirst = prisma.blogPost.findFirst;
  let unavailable = false;
  prisma.blogPost.findMany = async (query) => {
    assert.deepEqual(query.where, { status: 'published' });
    if (unavailable) throw new Error('Simulated database unavailability');
    const { content, ...summary } = post;
    return [summary];
  };
  prisma.blogPost.findFirst = async (query) => {
    assert.equal(query.where.status, 'published');
    if (unavailable) throw new Error('Simulated database unavailability');
    return query.where.slug === post.slug ? post : null;
  };
  t.after(() => { prisma.blogPost.findMany = originalMany; prisma.blogPost.findFirst = originalFirst; });
  const app = express();
  app.use(preventResponseCaching);
  app.get('*', createPublicPageHandler(root));
  app.use(createClientFilesRouter(root));
  app.get('*', createSeoFallbackHandler(root));
  const server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const route of ['/', '/en', '/me', '/en/me', '/playground', '/en/playground', '/apps', '/en/apps', '/apps/td-wallpaperengine', '/en/apps/td-wallpaperengine', '/discord', '/en/discord', '/chat', '/en/chat', '/blog', '/blog/published-example', '/blog/chatdvt-phan-1']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    assert.equal(response.headers.get('cache-control'), 'no-cache, max-age=0, must-revalidate');
    const html = await response.text();
    assert.match(html, /data-ssr="true"/, route);
    assert.doesNotMatch(html, /stale prerendered blog list/);
    if (route === '/blog') assert.match(rootContent(html), /published-example/);
    if (route === '/blog/published-example') assert.match(rootContent(html), /Full published article/);
  }
  const head = await fetch(base + '/blog/published-example', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const enBlog = await fetch(base + '/en/blog/published-example');
  assert.equal(enBlog.status, 200);
  assert.equal(enBlog.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.match(await enBlog.text(), /rel="canonical" href="https:\/\/devtiendang.blog\/blog\/published-example"/);
  for (const route of ['/blog/a-draft', '/en/blog/a-draft']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(await response.text(), /404/);
  }
  const filtered = await fetch(base + '/playground?category=mobile');
  const filteredHtml = rootContent(await filtered.text());
  assert.match(filteredHtml, /data-filter="mobile" aria-pressed="true"/);
  assert.doesNotMatch(filteredHtml, /data-project-card="true" data-category="fun"/);
  for (const route of ['/qr-generator', '/?frame_id=test']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200);
    assert.doesNotMatch(await response.text(), /data-ssr="true"|site-main/);
  }
  unavailable = true;
  const response = await fetch(base + '/blog/published-example');
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.doesNotMatch(await response.text(), /Simulated database/);
});
