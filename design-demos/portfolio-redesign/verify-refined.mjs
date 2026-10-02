import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const url = 'http://127.0.0.1:4174/direction-3-refined.html';
const target = await fetch(`http://127.0.0.1:9223/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then(r => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let sequence = 0;
const pending = new Map();
const exceptions = [];
const failedRequests = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const entry = pending.get(message.id);
    pending.delete(message.id);
    message.error ? entry.reject(new Error(JSON.stringify(message.error))) : entry.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) failedRequests.push(message.params.response.url);
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
const settle = () => evaluate(`(async()=>{
  await document.fonts.ready;
  await Promise.all([...document.images].map(async image => { image.loading='eager';try{await image.decode()}catch{} }));
  await new Promise(resolve=>setTimeout(resolve,200));
})()`);
const screenshot = async name => {
  const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync(path.join(root, 'screenshots', name), Buffer.from(shot.data, 'base64'));
};
await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
const report = [];
for (const [viewport, width, height, mobile] of [['desktop',1440,900,false],['tablet',768,1024,false],['mobile',390,844,true],['small-mobile',375,812,true]]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
  for (const view of ['home', 'me', 'discord']) {
    await send('Page.navigate', { url: `${url}#${view}` });
    await evaluate('new Promise(resolve=>setTimeout(resolve,300))');
    await settle();
    // A hash-only navigation does not reset the theme from the previous test.
    await evaluate(`document.documentElement.dataset.theme='light';document.querySelector('.theme-toggle').setAttribute('aria-pressed','false')`);
    const metrics = await evaluate(`(()=>{
      const visible=document.querySelector('[data-view]:not([hidden])');
      const image=visible.querySelector('${view === 'discord' ? '.bot-identity>img' : '.person-photo'}');
      return {
        view:visible.dataset.view,width:innerWidth,documentWidth:document.documentElement.scrollWidth,
        headline:visible.querySelector('h1').textContent,
        primaryImage:image.getAttribute('src'),primaryImageSize:image.getBoundingClientRect().width,
        brokenImages:[...document.images].filter(image=>!image.complete||image.naturalWidth===0).map(image=>image.getAttribute('src')),
        overflowingElements:[...visible.querySelectorAll('*')].filter(el=>el.getBoundingClientRect().right>innerWidth+1||el.getBoundingClientRect().left< -1).map(el=>el.className).slice(0,12),
        fontLoaded:document.fonts.check('700 16px "Be Vietnam Pro"'),
        singleVisibleH1:document.querySelectorAll('[data-view]:not([hidden]) h1').length===1,
        contentChecks:visible.dataset.view==='me'?{
          fiveCompanyContributions:visible.querySelectorAll('.company-contributions>li').length===5,
          threeSkillGroups:visible.querySelectorAll('.skill-families>div').length===3,
          companyBeforePersonal:!!(visible.querySelector('#experience').compareDocumentPosition(visible.querySelector('#me-work-title'))&Node.DOCUMENT_POSITION_FOLLOWING),
          descriptiveProjectNames:!/(OmniCXM|PVCFC|Vikki|Woni|DCM)/i.test(visible.textContent),
          roleFromCV:visible.querySelector('.entry-role').textContent==='Mobile Software Engineer',
        }:{},
      };
    })()`);
    await screenshot(`direction-3-refined-${view}-${viewport}.png`);
    const interactions = await evaluate(`(async()=>{
      const result={};
      const theme=document.querySelector('.theme-toggle');theme.click();result.darkMode=document.documentElement.dataset.theme==='dark';
      if(innerWidth<=980){const menu=document.querySelector('.nav-toggle');menu.click();result.menuOpens=menu.getAttribute('aria-expanded')==='true';document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));result.escapeClosesMenu=menu.getAttribute('aria-expanded')==='false';}
      const trigger=document.querySelector('[data-view]:not([hidden]) [data-image]');
      if(trigger){trigger.click();await document.querySelector('dialog img').decode();result.imageOpens=document.querySelector('dialog').open;document.querySelector('.dialog-close').click();await new Promise(resolve=>setTimeout(resolve,40));result.imageCloses=!document.querySelector('dialog').open;result.focusRestored=document.activeElement===trigger;}
      return result;
    })()`);
    if(viewport==='desktop') await screenshot(`direction-3-refined-${view}-dark.png`);
    if(viewport==='desktop' || viewport==='mobile') {
      const detail = { home: '#projects', me: '.experience-section', discord: '#proof' }[view];
      await evaluate(`document.documentElement.dataset.theme='light';window.scrollTo({top:document.querySelector('[data-view="${view}"] ${detail}').getBoundingClientRect().top+scrollY-108,behavior:'instant'})`);
      await screenshot(`direction-3-refined-${view}-${viewport}-detail.png`);
      if(view==='me'){
        await evaluate(`window.scrollTo({top:document.querySelector('[data-view="me"] .experience-entry').getBoundingClientRect().top+scrollY-108,behavior:'instant'})`);
        await screenshot(`direction-3-refined-me-${viewport}-company.png`);
      }
    }
    report.push({ viewport, ...metrics, interactions });
  }
}
const routing = await evaluate(`(async()=>{
  const result={};
  document.querySelector('[data-preview="me"]').click();await new Promise(r=>setTimeout(r,100));result.meRoute=document.querySelector('[data-view]:not([hidden])').dataset.view==='me';
  document.querySelector('.skip-link').click();await new Promise(r=>setTimeout(r,100));result.skipPreservesMe=document.querySelector('[data-view]:not([hidden])').dataset.view==='me';
  document.querySelector('.experience-jump').click();await new Promise(r=>setTimeout(r,100));result.experienceJump=location.hash==='#me/experience'&&document.querySelector('[data-view]:not([hidden])').dataset.view==='me';
  document.querySelector('[data-nav="discord"]').click();await new Promise(r=>setTimeout(r,100));result.discordRoute=document.querySelector('[data-view]:not([hidden])').dataset.view==='discord';
  for(const section of ['mobile','projects','chat','blog']){document.querySelector('[data-nav="'+section+'"]').click();await new Promise(r=>setTimeout(r,100));result[section+'Route']=document.querySelector('[data-view]:not([hidden])').dataset.view==='home'&&location.hash==='#home/'+section;}
  return result;
})()`);
const output = { report, routing, exceptions, failedRequests: [...new Set(failedRequests)].filter(item => !item.endsWith('/favicon.ico')) };
fs.writeFileSync(path.join(root, 'verification-refined.json'), JSON.stringify(output, null, 2)+'\n');
console.log(JSON.stringify(output, null, 2));
await send('Page.close');
socket.close();
if (exceptions.length || output.failedRequests.length || report.some(item => item.documentWidth > item.width || item.brokenImages.length || item.overflowingElements.length || !item.fontLoaded || !item.singleVisibleH1 || Object.values(item.interactions).some(value => value === false) || Object.values(item.contentChecks).some(value => value === false)) || Object.values(routing).some(value => value === false)) process.exitCode=1;
