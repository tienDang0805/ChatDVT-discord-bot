import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const pages = [
  ['1', 'direction-1-cinematic-signal.html'],
  ['2', 'direction-2-recruiter-ledger.html'],
  ['3', 'direction-3-human-sidekick.html'],
];
const report = [];

for (const [number, file] of pages) {
  const url = new URL(file, import.meta.url).href;
  const target = await fetch(`http://127.0.0.1:9223/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then(response => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      message.error ? entry.reject(new Error(JSON.stringify(message.error))) : entry.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const [name, width, height, scale, mobile] of [
    ['desktop', 1440, 900, 1, false],
    ['mobile', 390, 844, 2, true],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile, screenWidth: width, screenHeight: height });
    await send('Page.navigate', { url });
    await evaluate('new Promise(resolve => setTimeout(resolve, 500))');
    await evaluate('document.fonts.ready');
    await evaluate(`Promise.all([...document.images].map(async image => {
      image.loading = 'eager';
      try { await image.decode(); } catch {}
    }))`);
    await evaluate('new Promise(resolve => setTimeout(resolve, 300))');
    const metrics = await evaluate(`({
      width: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.getAttribute('src')),
      sectionCount: document.querySelectorAll('section[id]').length
    })`);
    const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    fs.writeFileSync(path.join(root, 'screenshots', `direction-${number}-${name}.png`), Buffer.from(screenshot.data, 'base64'));
    const interactions = await evaluate(`(() => {
      const results = {};
      const toggle = document.querySelector('.menu-toggle, .nav-toggle');
      if (${mobile} && toggle) {
        toggle.click();
        results.menuOpens = toggle.getAttribute('aria-expanded') === 'true';
        toggle.click();
        results.menuCloses = toggle.getAttribute('aria-expanded') === 'false';
      }
      const imageButton = document.querySelector('.image-button');
      if (imageButton) {
        imageButton.click();
        results.imageOpens = document.querySelector('dialog').open;
        document.querySelector('.dialog-close').click();
        results.imageCloses = !document.querySelector('dialog').open;
      }
      return results;
    })()`);
    report.push({ direction: number, viewport: name, ...metrics, interactions, errors: [...errors] });
  }
  await send('Page.close');
  socket.close();
}
fs.writeFileSync(path.join(root, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
