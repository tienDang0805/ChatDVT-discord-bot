const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../client/src/site/components/siteLoadingView.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(compiled, sandbox);
const { siteLoadingView } = sandbox.exports;

test('portfolio loading variants match both VI and EN routes', () => {
  const routes = { '/': 'home', '/me': 'me', '/playground': 'playground', '/discord': 'discord', '/chat': 'chat', '/blog': 'blog', '/blog/a-post': 'article', '/ecosystem': 'ecosystem', '/mobile': 'playground', '/chatDVT': 'discord' };
  for (const [route, view] of Object.entries(routes)) {
    assert.equal(siteLoadingView(route), view, route);
    assert.equal(siteLoadingView('/en' + (route === '/' ? '' : route)), view, 'EN ' + route);
  }
  assert.equal(siteLoadingView('/en/'), 'home');
});

test('tools, admin, Discord activities and unknown routes never get a portfolio skeleton', () => {
  for (const route of ['/english', '/english/chat', '/admin', '/admin/blog', '/login', '/activity', '/pixel-agents-activity', '/deeplink-tester', '/chatty', '/blogger', '/enigma', '/en/not-a-page', '/blog/a/b']) {
    assert.equal(siteLoadingView(route), null, route);
  }
});
