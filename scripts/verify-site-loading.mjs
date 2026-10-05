// Regression QA: npm --prefix client run build + preview on 4175; test Chrome CDP on 9223.
// Node 24's native WebSocket is required. API requests are mocked; no real bot/AI calls.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.env.LOADING_QA_URL || 'http://127.0.0.1:4175';
const cdp = process.env.LOADING_QA_CDP || 'http://127.0.0.1:9223';
const reports = [];
const errors = [];
const specs = [
  ['/', 'home', 'HomePage', '.home-landscape'], ['/me', 'me', 'MePage', '.me-stage'],
  ['/playground', 'playground', 'PlaygroundPage', '.play-opening'], ['/mobile', 'playground', 'MobilePage', '.play-opening'],
  ['/discord', 'discord', 'DiscordPage', '.discord-stage'], ['/chat', 'chat', 'ChatDVTChatPage', '.chatdvt-page'],
  ['/blog', 'blog', 'BlogPage', '.blog-opening'], ['/blog/chatdvt-phan-1', 'article', 'BlogArticlePage', '.blog-article'],
  ['/blog/loading-qa', 'article', 'BlogArticlePage', '.blog-article'],
  ['/ecosystem', 'ecosystem', 'EcosystemPage', '.ecosystem-hero'],
];

for (const [viewport, width, height, dark, reduced] of [['desktop', 1440, 900, false, false], ['tablet', 768, 1024, false, false], ['mobile', 390, 844, true, true]]) {
  for (const [path, view, chunk, selector] of specs) {
    const route = viewport === 'mobile' ? '/en' + (path === '/' ? '' : path) : path;
    const target = await fetch(`${cdp}/json/new?about:blank`, {method: 'PUT'}).then(r => r.json());
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, {once: true}));
    let id = 0, release = false;
    const articleDataTest = path === '/blog/loading-qa';
    const pending = new Map(), held = [], heldApi = [];
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      pending.set(++id, {resolve, reject}); socket.send(JSON.stringify({id, method, params}));
    });
    socket.addEventListener('message', event => {
      const m = JSON.parse(event.data);
      if (m.id) {
        const p = pending.get(m.id); pending.delete(m.id);
        m.error ? p.reject(m.error) : p.resolve(m.result);
      }
      if (m.method === 'Runtime.exceptionThrown') errors.push({route, text: m.params.exceptionDetails.text});
      if (m.method === 'Fetch.requestPaused') {
        const {requestId, request} = m.params;
        let job;
        if (request.url.includes('/api/')) {
          if (articleDataTest && request.url.includes('/blog/posts/')) { heldApi.push(requestId); return; }
          const data = request.url.includes('/bot-info') ? {username: 'ChatDVT', avatar: '/images/chibi/chatdvt.jpg'} : [];
          const responseCode = request.url.includes('/blog/posts/') ? 404 : 200;
          job = send('Fetch.fulfillRequest', {requestId, responseCode, responseHeaders: [{name: 'Content-Type', value: 'application/json'}], body: Buffer.from(JSON.stringify(data)).toString('base64')});
        } else if (!release && request.url.includes(`/assets/${chunk}-`)) held.push(requestId);
        else job = send('Fetch.continueRequest', {requestId});
        job?.catch(error => errors.push({route, text: String(error)}));
      }
    });
    const evaluate = async expression => {
      const r = await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
      if (r.exceptionDetails) throw Error(r.exceptionDetails.text);
      return r.result.value;
    };
    const waitFor = async expression => {
      for (let attempt = 0; attempt < 80; attempt++) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw Error(`Timeout ${route}: ${expression}`);
    };
    try {
      await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
      await send('Network.setCacheDisabled', {cacheDisabled: true}); await send('Network.setBypassServiceWorker', {bypass: true});
      await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor: 1, mobile: viewport === 'mobile'});
      await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference'}]});
      await send('Page.addScriptToEvaluateOnNewDocument', {source: `localStorage.setItem('theme', '${dark ? 'dark' : 'light'}');`});
      await send('Fetch.enable', {patterns: [{urlPattern: '*/assets/*.js'}, {urlPattern: '*/api/*'}]});
      await send('Page.navigate', {url: base + route});
      await waitFor(`document.querySelector('[data-site-loading="${view}"]') !== null`);
      await evaluate('document.fonts.ready.then(() => true)');
      const before = await evaluate(`(() => { const shell = document.querySelector('.site-root'), header = document.querySelector('.site-header'), content = document.querySelector(${JSON.stringify(selector)}); return {width: innerWidth, scrollWidth: document.documentElement.scrollWidth, headerHeight: header.getBoundingClientRect().height, headerWidth: header.getBoundingClientRect().width, brand: document.querySelector('.site-brand').textContent, background: getComputedStyle(shell).backgroundColor, heroHeight: content.getBoundingClientRect().height, status: document.querySelector('[role=status]').textContent, animation: getComputedStyle(document.querySelector('.site-skeleton-block')).animationName, dark: document.documentElement.classList.contains('dark'), footer: !!document.querySelector('.site-footer')}; })()`);
      assert.ok(held.length > 0, 'a real lazy chunk is held');
      assert.ok(before.scrollWidth <= width + 1, `${route} horizontal overflow`);
      assert.match(before.brand, /devtiendang/);
      assert.equal(before.dark, dark);
      assert.match(before.status, viewport === 'mobile' ? /Loading/ : /Đang tải/);
      assert.equal(before.footer, view !== 'chat');
      if (reduced) assert.equal(before.animation, 'none');
      if (view === 'chat') {
        const chat = await evaluate(`(() => {const d = document.querySelector('.chatdvt-directory'); return {display: getComputedStyle(d).display, composer: !!document.querySelector('.chatdvt-composer'), directoryTitle: d.querySelector('h2').getClientRects().length, directoryLinks: [...d.querySelectorAll('.site-skeleton-directory-link')].filter(e => e.getClientRects().length).length};})()`);
        assert.ok(chat.composer);
        if (viewport === 'mobile') { assert.equal(chat.directoryTitle, 0); assert.equal(chat.directoryLinks, 0); }
      }
      if (process.env.LOADING_QA_SCREENSHOTS) {
        const shot = await send('Page.captureScreenshot', {format: 'png'});
        fs.writeFileSync(`${process.env.LOADING_QA_SCREENSHOTS}/${view}-${viewport}.png`, Buffer.from(shot.data, 'base64'));
      }
      release = true;
      await Promise.all(held.map(requestId => send('Fetch.continueRequest', {requestId})));
      if (articleDataTest) {
        await waitFor(`!document.querySelector('[data-site-loading]') && !!document.querySelector('.site-skeleton .blog-article')`);
        assert.ok(heldApi.length > 0, 'article API request is held');
        assert.ok(await evaluate(`!!document.querySelector('.site-skeleton [role=status]')`));
        await Promise.all(heldApi.map(requestId => send('Fetch.fulfillRequest', {requestId, responseCode: 404, responseHeaders: [{name: 'Content-Type', value: 'application/json'}], body: Buffer.from('{"error":"QA missing post"}').toString('base64')})));
        await waitFor(`!document.querySelector('.site-skeleton') && !!document.querySelector('.blog-state')`);
      }
      const loadedSelector = articleDataTest ? '.blog-state' : selector;
      await waitFor(`!document.querySelector('[data-site-loading]') && !!document.querySelector(${JSON.stringify(loadedSelector)})`);
      const after = await evaluate(`(() => {const h = document.querySelector('.site-header'); return {headerHeight: h.getBoundingClientRect().height, headerWidth: h.getBoundingClientRect().width, background: getComputedStyle(document.querySelector('.site-root')).backgroundColor, heroHeight: document.querySelector(${JSON.stringify(loadedSelector)}).getBoundingClientRect().height, scrollWidth: document.documentElement.scrollWidth};})()`);
      assert.equal(after.headerHeight, before.headerHeight);
      assert.equal(after.headerWidth, before.headerWidth);
      assert.equal(after.background, before.background);
      assert.ok(after.scrollWidth <= width + 1);
      reports.push({route, view, viewport, before, after});
      console.log(`PASS ${viewport} ${route}: skeleton -> current page, shared header/theme`);
    } finally {
      await fetch(`${cdp}/json/close/${target.id}`); socket.close();
    }
  }
}
assert.deepEqual(errors, []);
console.log(JSON.stringify({checks: reports.length, errors}));
if (process.env.LOADING_QA_REPORT) fs.writeFileSync(process.env.LOADING_QA_REPORT, JSON.stringify({reports, errors}, null, 2));
