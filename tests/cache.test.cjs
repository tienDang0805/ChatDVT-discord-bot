require('ts-node/register');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const http = require('node:http');
const express = require('express');
const { createClientFilesRouter, preventResponseCaching, REVALIDATE } = require('../src/api/client-files');
const { createSeoFallbackHandler } = require('../src/api/seo');

test('HTTP cache policies for public pages, assets, API, and missing files', async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'devtiendang-cache-'));
  const fixtures = {
    'index.html': '<html><head><title>Test</title></head><body><div id="root"></div></body></html>',
    'me/index.html': '<html>Profile</html>',
    'assets/HomePage-048a7b4d.js': 'export default "home";',
    'assets/unversioned.js': 'export default "tool";',
    'sw.js': '// migration worker',
    'manifest.json': '{}',
    'images/profile.png': 'public image',
    'hbd/private.png': 'private image',
  };
  for (const [file, content] of Object.entries(fixtures)) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const app = express();
  app.use(preventResponseCaching);
  app.get('/api/test', (_req, res) => res.json({ user: 'private' }));
  app.use(createClientFilesRouter(root));
  app.get('*', createSeoFallbackHandler(root));
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  for (const route of ['/', '/me', '/en/me', '/sw.js', '/manifest.json']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, route);
    assert.equal(response.headers.get('cache-control'), REVALIDATE, route);
    await response.text();
  }
  const assetUrl = `${base}/assets/HomePage-048a7b4d.js`;
  const asset = await fetch(assetUrl);
  assert.equal(asset.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  assert.match(asset.headers.get('content-type'), /javascript/);
  const etag = asset.headers.get('etag');
  await asset.text();
  // Node fetch adds Cache-Control: no-cache to conditional requests, which
  // deliberately prevents Express from replying 304. Use the HTTP client here.
  const conditional = await new Promise((resolve, reject) => {
    http.get(assetUrl, { headers: { 'If-None-Match': etag } }, (response) => {
      response.resume();
      response.on('end', () => resolve(response));
    }).on('error', reject);
  });
  assert.equal(conditional.statusCode, 304);
  assert.equal(conditional.headers['cache-control'], 'public, max-age=31536000, immutable');
  const head = await fetch(assetUrl, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');

  for (const route of ['/assets/unversioned.js', '/images/profile.png']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=3600', route);
    await response.text();
  }
  for (const route of ['/api/test', '/hbd/private.png']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.headers.get('cache-control'), 'private, no-store', route);
    await response.text();
  }
  for (const route of ['/assets/missing.js', '/assets/missing.js?retry=1', '/unknown-page']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 404, route);
    assert.equal(response.headers.get('cache-control'), 'no-store', route);
    if (route.startsWith('/assets/')) {
      assert.match(response.headers.get('content-type'), /text\/plain/);
      assert.equal(await response.text(), 'File not found');
    } else {
      await response.text();
    }
  }
});

test('worker migration clears only app caches and leaves requests to HTTP caching', async () => {
  const listeners = {};
  const deleted = [];
  let claimed = false;
  let skipped = false;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../client/public/sw.js'), 'utf8'), {
    self: {
      addEventListener: (name, callback) => { listeners[name] = callback; },
      skipWaiting: async () => { skipped = true; },
      clients: { claim: async () => { claimed = true; } },
    },
    caches: {
      keys: async () => ['devtiendang-v4', 'devtiendang-v5', 'other-app'],
      delete: async (key) => { deleted.push(key); return true; },
    },
  });
  let work;
  listeners.install({ waitUntil: (promise) => { work = promise; } });
  await work;
  assert.equal(skipped, true);
  listeners.activate({ waitUntil: (promise) => { work = promise; } });
  await work;
  assert.deepEqual(deleted, ['devtiendang-v4', 'devtiendang-v5']);
  assert.equal(claimed, true);
  assert.equal(listeners.fetch, undefined);
});
