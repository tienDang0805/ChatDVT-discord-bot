import fs from 'node:fs';
const mode=process.argv[2]||'prototype', base=mode==='prototype'?'http://127.0.0.1:4174/direction-3-complete.html':'http://127.0.0.1:4175';
const target=await fetch('http://127.0.0.1:9223/json/new?'+encodeURIComponent(base),{method:'PUT'}).then(r=>r.json());
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text)});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
await send('Page.enable');await send('Runtime.enable');
if(mode!=='prototype')await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.setItem("theme","light");'});
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
const routes=mode==='prototype'?['home','mobile','projects','discord','chat','blog','me']:['/','/mobile','/playground','/discord','/chat','/blog','/me','/blog/chatdvt-phan-1'];
const reports=[];
for(const [name,width,height,mobile] of [['desktop',1440,900,false],['tablet',768,1024,false],['mobile',390,844,true],['small-mobile',375,812,true]]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile,screenWidth:width,screenHeight:height});
 for(const route of routes){
 await send('Page.navigate',{url:mode==='prototype'?base+'#'+route:base+route});
 await run('(async()=>{await new Promise(r=>setTimeout(r,650));await document.fonts.ready;await Promise.all([...document.images].map(async i=>{i.loading="eager";try{await i.decode()}catch{}}))})()');
 if(mode==='prototype')await run('document.documentElement.dataset.theme="light"');else await run('window.scrollTo(0,0)');
 const metric=await run('({width:innerWidth,documentWidth:document.documentElement.scrollWidth,h1:[...document.querySelectorAll("h1")].filter(e=>e.getClientRects().length).map(e=>e.textContent),brokenImages:[...document.images].filter(i=>i.getClientRects().length&&(!i.complete||!i.naturalWidth)).map(i=>i.src),font:document.fonts.check(\'700 16px "Be Vietnam Pro"\')})');
 const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
 const label=route.replaceAll('/','-')||'home';
 fs.writeFileSync('design-demos/portfolio-redesign/screenshots/'+mode+'-'+label+'-'+name+'.png',Buffer.from(shot.data,'base64'));
 reports.push({route,viewport:name,...metric});
 if(metric.documentWidth>width+1||metric.brokenImages.length||metric.h1.length!==1||!metric.font)throw Error(JSON.stringify(reports.at(-1)));
 }
}
fs.writeFileSync('design-demos/portfolio-redesign/verification-'+mode+'-complete.json',JSON.stringify({reports,errors},null,2));
await fetch('http://127.0.0.1:9223/json/close/'+target.id);socket.close();console.log(JSON.stringify({mode,checks:reports.length,errors}));
