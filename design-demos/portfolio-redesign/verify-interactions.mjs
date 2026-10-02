import fs from 'node:fs';
const target=await fetch('http://127.0.0.1:9223/json/new?about:blank',{method:'PUT'}).then(r=>r.json());
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),exceptions=[],checks={},requests=[];
let failChat=false;
ws.addEventListener('message',async e=>{
 const m=JSON.parse(e.data);
 if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}
 if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.text);
 if(m.method==='Fetch.requestPaused'){
  const {requestId,request}=m.params;let code=200,data={};
  if(request.url.includes('/web-chat')){requests.push(JSON.parse(request.postData));code=failChat?500:200;data=failChat?{error:'Controlled test error'}:{response:'**Mock response** for UI verification.\n\n| Item | Status |\n| --- | --- |\n| React UI | Tested |'}}
  else if(request.url.includes('/blog/posts')){code=500;data={error:'Controlled fallback test'}}
  else if(request.url.includes('/bot-info'))data={id:'test',username:'ChatDVT',avatar:'/images/chibi/chatdvt.jpg'};
  await send('Fetch.fulfillRequest',{requestId,responseCode:code,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
 }
});
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
const wait=()=>run('new Promise(r=>setTimeout(r,350))');
async function navigate(route){await send('Page.navigate',{url:'http://127.0.0.1:4175'+route});await run('(async()=>{await new Promise(r=>setTimeout(r,650));await document.fonts.ready})()');}
function check(name,value){checks[name]=value;if(!value)throw Error('FAILED '+name);}
const input=async(selector,value)=>run(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,"value").set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event("input",{bubbles:true}))})()`);
await send('Page.enable');await send('Runtime.enable');
await send('Fetch.enable',{patterns:[{urlPattern:'*/api/*',requestStage:'Request'}]});
await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.setItem("theme","light");window.confirm=()=>true;'});
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await navigate('/');
check('humanOwnsHome',await run('document.querySelector(".identity-photo").naturalWidth>0&&document.querySelector(".identity-photo").getBoundingClientRect().width>document.querySelector(".identity-sidekick img").getBoundingClientRect().width'));
await run('document.querySelector(".site-menu-button").click()');
check('menuOpensAndFocuses',await run('!!document.querySelector("[role=dialog]")&&document.querySelector("[role=dialog]").contains(document.activeElement)&&document.body.style.overflow==="hidden"'));
await run('document.querySelector(".site-mobile-nav button:last-child").focus()');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
check('menuFocusTrapped',await run('document.querySelector(".site-mobile-nav").contains(document.activeElement)'));
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await wait();
check('menuEscapeRestoresFocus',await run('!document.querySelector(".site-mobile-nav")&&document.activeElement===document.querySelector(".site-menu-button")&&document.body.style.overflow!== "hidden"'));
await run('document.querySelector(".site-menu-button").click()');await wait();
await run('[...document.querySelectorAll(".site-mobile-nav .site-languages button")].find(b=>b.textContent==="EN").click()');await wait();
check('languageSwitchRoutes',await run('location.pathname==="/en"&&document.documentElement.lang==="en"'));
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
for(const route of ['/','/mobile','/playground','/discord','/chat','/blog','/me']){
 await navigate('/en'+(route==='/'?'':route));
 check('englishRoute'+route,await run('document.documentElement.lang==="en"&&document.querySelectorAll("#site-main h1").length===1&&document.documentElement.scrollWidth<=innerWidth+1'));
 await run('document.querySelector(".site-header__actions>button:not(.site-menu-button)").click()');await wait();
 check('darkToggle'+route,await run('document.documentElement.classList.contains("dark")&&getComputedStyle(document.querySelector(".site-root")).getPropertyValue("--site-bg").trim()==="#20211e"'));
 const dark=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
 fs.writeFileSync('design-demos/portfolio-redesign/screenshots/production-dark-'+(route.replaceAll('/','-')||'home')+'.png',Buffer.from(dark.data,'base64'));
}
await navigate('/playground');
const publicCount=await run('document.querySelectorAll(".experiment-grid:not(.experiment-grid--featured):not(.experiment-grid--archive)>.experiment-card").length');
await input('.site-search','no-project-matches-765xyz');await wait();
check('projectSearchEmpty',await run('!!document.querySelector(".projects-empty")'));
await input('.site-search','');await run('document.querySelectorAll(".filter-tabs button")[2].click()');await wait();
check('projectCategoryFilter',await run('document.querySelectorAll(".filter-tabs button")[2].getAttribute("aria-pressed")==="true"&&document.querySelectorAll(".experiment-grid:not(.experiment-grid--featured):not(.experiment-grid--archive)>.experiment-card").length<'+publicCount));
await run('document.querySelector(".filter-tabs button").click();document.querySelector(".archive-panel button").click()');await wait();
check('archiveExpands',await run('document.querySelector(".archive-panel button").getAttribute("aria-expanded")==="true"&&!!document.querySelector(".experiment-grid--archive")'));
await navigate('/discord');
check('productOwnsDiscord',await run('document.querySelector(".discord-avatar img").getBoundingClientRect().width>document.querySelector(".creator-credit img").getBoundingClientRect().width'));
await run('document.querySelector(".product-proof__image").click()');await wait();
check('galleryOpens',await run('document.querySelector("dialog[open] img").naturalWidth>0'));
await send('Page.bringToFront');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await wait();
check('galleryEscapeRestoresFocus',await run('!document.querySelector("dialog[open]")&&document.activeElement===document.querySelector(".product-proof__image")'));
await navigate('/me');
check('fiveCompanyContributions',await run('document.querySelectorAll(".company-contributions li").length===5'));
check('threeSkillFamilies',await run('document.querySelectorAll(".skill-families>div").length===3'));
check('noConfidentialClientNames',await run('!/(OmniCXM|PVCFC|Vikki|Woni|DCM)/i.test(document.querySelector("#experience").textContent)'));
await navigate('/blog/chatdvt-phan-1');
check('blogApiFallback',await run('!!document.querySelector(".blog-prose h2")&&document.querySelector(".blog-article__header h1").textContent.includes("ChatDVT")'));
await navigate('/chat');
await run('localStorage.removeItem("web_chat_history_vi");localStorage.removeItem("web_chat_history");window.dispatchEvent(new CustomEvent("web-chat-history-updated",{detail:[]}))');await wait();
check('chatEmptyScrollAtTop',await run('document.querySelector(".chatdvt-thread").scrollTop===0'));
await input('.chatdvt-composer textarea','UI verification message');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',modifiers:8});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});
check('shiftEnterDoesNotSend',requests.length===0);
await run('document.querySelector(".chatdvt-composer button").click()');await wait();
check('chatPayloadPreserved',requests[0]?.message==='UI verification message'&&requests[0]?.locale==='vi'&&Array.isArray(requests[0]?.history));
check('chatMarkdownRenders',await run('document.querySelectorAll(".chatdvt-message").length===2&&!!document.querySelector(".chatdvt-markdown strong")&&!!document.querySelector(".chatdvt-table-wrap table")'));
await send('Page.reload');await wait();await wait();
check('chatHistoryRestores',await run('document.querySelectorAll(".chatdvt-message").length===2'));
failChat=true;await input('.chatdvt-composer textarea','Controlled error test');await run('document.querySelector(".chatdvt-composer button").click()');await wait();
await input('.chatdvt-composer textarea','Can continue after error');await wait();
check('chatErrorHandled',await run('document.querySelector(".chatdvt-messages").textContent.includes("Controlled test error")&&!document.querySelector(".chatdvt-composer button").disabled'));
await run('document.querySelector(".chatdvt-new-chat").click()');await wait();
check('chatNewConversationClears',await run('!!document.querySelector(".chatdvt-welcome")&&localStorage.getItem("web_chat_history_vi")===null'));
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait();
check('chatWelcomeVisibleOnMobile',await run('document.querySelector(".chatdvt-thread").scrollTop===0&&document.querySelector(".chatdvt-avatar--welcome").getBoundingClientRect().top>=document.querySelector(".chatdvt-chat-header").getBoundingClientRect().bottom'));
check('noRuntimeExceptions',exceptions.length===0);
fs.writeFileSync('design-demos/portfolio-redesign/verification-production-interactions.json',JSON.stringify({checks,exceptions,chatRequests:requests.map(r=>({locale:r.locale,message:r.message,historyLength:r.history.length})),apiMode:'Mocked API responses only. No live Gemini request.'},null,2));
await fetch('http://127.0.0.1:9223/json/close/'+target.id);ws.close();console.log(JSON.stringify({passed:Object.keys(checks).length,exceptions,apiMode:'mock'}));
