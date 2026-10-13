const {chromium}=require(process.env.CICD_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
const out=process.env.CICD_ARTIFACT_DIR || require('node:path').join(require('node:os').tmpdir(), 'cicd-visualizer-qa');
fs.mkdirSync(out,{recursive:true});
const base=process.env.CICD_BASE_URL || 'http://127.0.0.1:4175';
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CICD_CHROME_EXECUTABLE,headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});const errors=[];const findings=[];let sourceUploads=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST'&&r.postData()?.includes('SCRIPT_SENTINEL'))sourceUploads.push(r.url());});
const check=async(name,fn)=>{try{await fn();findings.push(name);console.log('PASS',name)}catch(e){await browser.close();throw e}};
const ready=async(count)=>{await page.waitForFunction(n=>{const nodes=[...document.querySelectorAll('.react-flow__node-step')];const file=document.querySelector('.cicd-document-bar select')?.value;return nodes.length===n&&nodes.every(node=>node.dataset.id.startsWith(file+'/job/'))&&!document.querySelector('.cicd-loading');},count,{timeout:20000});await page.waitForTimeout(300);};
const overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
const openEditor=async()=>{if(!await page.locator('.cm-content').count())await page.getByRole('button',{name:'Mở YAML',exact:true}).click();};
const paste=async(text)=>{await openEditor();await page.locator('.cm-content').fill(text);};
const visualize=()=>page.getByRole('button',{name:'Visualize ↗',exact:true}).click();
await check('Playground has one CI/CD card and opens dedicated page',async()=>{
 await page.goto(base+'/playground');await page.waitForSelector('[data-id=cicd]');assert.equal(await page.locator('[data-project-card]').count(),1);
 await page.screenshot({path:out+'/live-playground.png',fullPage:true});await page.locator('[data-id=cicd] a').click();await page.waitForSelector('.cm-content');assert.match(page.url(),/\/cicd-visualizer$/);
});
await check('deployment example: one job, seven steps, script annotation lane',async()=>{
 await page.getByRole('button',{name:'Dùng ví dụ',exact:true}).click();await ready(7);assert.equal(await page.locator('.react-flow__node-job').count(),1);assert.equal(await page.locator('.cicd-script-stages article').count(),5);assert.equal(await overflow(),false);
 await page.screenshot({path:out+'/live-desktop-dark.png',fullPage:true});
});
await check('node selection and exact YAML source navigation',async()=>{
 await page.locator('.react-flow__node-step').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.cicd-inspector h2').innerText(),'Checkout Code');await page.getByRole('button',{name:'Xem YAML',exact:true}).click();await page.waitForSelector('.cm-content');await page.waitForSelector('.cm-selectionBackground');
});
await check('invalid paste retains stale graph and disables exports',async()=>{
 await paste('name: invalid\non: push\njobs: [');await visualize();await page.waitForSelector('.cicd-diagnostics li[data-severity=error]');assert.equal(await page.locator('.react-flow__node-step').count(),7);assert.ok(await page.locator('.cicd-stale').count());assert.equal(await page.getByRole('button',{name:'PNG',exact:true}).isDisabled(),true);assert.equal(await page.getByRole('button',{name:'JSON',exact:true}).isDisabled(),true);
});
const yaml='name: Imported workflow\non: [push, pull_request]\nenv: {TOKEN: SECRET_SENTINEL}\njobs:\n  compile:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Compile project\n        run: echo SCRIPT_SENTINEL\n  verify:\n    needs: compile\n    runs-on: ubuntu-latest\n    steps:\n      - name: Verify project\n        run: npm test\n';
await check('real .yaml file import generates a different graph',async()=>{
 await page.locator('input[type=file]').setInputFiles({name:'imported.yaml',mimeType:'text/yaml',buffer:Buffer.from(yaml)});await ready(2);assert.equal(await page.locator('.react-flow__node-job').count(),2);assert.equal(await page.locator('.cicd-graph-panel h2').innerText(),'Imported workflow');assert.equal(await page.locator('.react-flow__edge.cicd-edge-dependency').count(),1);
});
await check('CRLF file source navigation and source-to-node selection',async()=>{
 await page.locator('input[type=file]').setInputFiles({name:'windows-crlf.yaml',mimeType:'text/yaml',buffer:Buffer.from(yaml.replaceAll('\n','\r\n'))});await ready(2);
 await page.locator('.react-flow__node-step').last().click();await page.getByRole('button',{name:'Xem YAML',exact:true}).click();await page.waitForSelector('.cm-content');
 await page.waitForSelector('.cm-selectionBackground');
 await page.getByRole('tab',{name:'YAML',exact:true}).click();assert.match(await page.locator('.cicd-source-excerpt pre').textContent(),/name: Verify project\r\n/);
 await page.locator('.cm-line').filter({hasText:'- name: Compile project'}).click();assert.equal(await page.locator('.cicd-inspector h2').innerText(),'Compile project');
 await page.getByRole('combobox',{name:'File workflow đang mở',exact:true}).selectOption({label:'imported.yaml'});await ready(2);if(await page.locator('.cm-content').count())await page.getByRole('button',{name:'Ẩn YAML',exact:true}).click();
});
await check('JSON preview/download excludes raw script and env',async()=>{
 await page.getByRole('button',{name:'JSON',exact:true}).click();await page.waitForSelector('dialog[open]');const text=await page.locator('.cicd-export-dialog pre').innerText();assert.doesNotMatch(text,/SCRIPT_SENTINEL|SECRET_SENTINEL|rawText/);assert.equal(JSON.parse(text).counts.jobs,2);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Tải xuống',exact:true}).click();await(await download).saveAs(out+'/workflow-summary.json');await page.keyboard.press('Escape');
});
await check('PNG preview/download includes full graph',async()=>{
 await page.getByRole('button',{name:'PNG',exact:true}).click();await page.waitForSelector('dialog[open] img',{timeout:20000});assert.ok(await page.locator('dialog img').evaluate(el=>el.naturalWidth===1600&&el.naturalHeight>=800));const colors=await page.locator('dialog img').evaluate(el=>{const c=document.createElement('canvas');c.width=el.naturalWidth;c.height=el.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(el,0,0);const d=ctx.getImageData(0,0,c.width,c.height).data;const s=new Set();for(let i=0;i<d.length;i+=400)s.add(d.slice(i,i+4).join(','));return s.size});assert.ok(colors>20,'PNG must include nodes and labels, not a blank background');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Tải xuống',exact:true}).click();await(await download).saveAs(out+'/workflow-export.png');await page.keyboard.press('Escape');
});
await check('auto update refreshes changed YAML',async()=>{
 await paste(yaml.replace('Imported workflow','Auto workflow'));await page.getByRole('checkbox',{name:'Tự cập nhật',exact:true}).check();await page.waitForFunction(()=>document.querySelector('.cicd-graph-panel h2')?.textContent==='Auto workflow');await ready(2);assert.equal(await page.locator('.cicd-stale').count(),0);assert.equal(await page.locator('.cm-content').count(),1);await page.locator('.cm-content').fill(yaml.replace('Imported workflow','Second auto update'));await page.waitForFunction(()=>document.querySelector('.cicd-graph-panel h2')?.textContent==='Second auto update');assert.equal(await page.locator('.cm-content').count(),1);await page.getByRole('checkbox',{name:'Tự cập nhật',exact:true}).uncheck();
});
await check('matrix, parallel jobs, overview and collapse controls',async()=>{
 const select=page.getByRole('combobox',{name:'Workflow mẫu',exact:true});await select.selectOption('matrix');await page.getByRole('button',{name:'Dùng ví dụ',exact:true}).click();await ready(3);assert.match(await page.locator('.cicd-badge').innerText(),/matrix/);
 await select.selectOption('parallel');await page.getByRole('button',{name:'Dùng ví dụ',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.react-flow__node-job').length===4);await page.waitForTimeout(300);assert.equal(await page.locator('.react-flow__node-step').count(),0);
 await page.getByRole('button',{name:'Chi tiết',exact:true}).click();await ready(7);await page.getByRole('button',{name:'Thu gọn jobs',exact:true}).click();await ready(0);
});
await check('file switch restores matching document model',async()=>{
 await page.getByRole('combobox',{name:'File workflow đang mở',exact:true}).selectOption({label:'deploy-to-vm.yml'});await ready(7);assert.equal(await page.locator('.cicd-graph-panel h2').innerText(),'Deploy to Alibaba VM');await page.getByRole('combobox',{name:'Workflow mẫu',exact:true}).selectOption('deployment');await page.getByRole('button',{name:'Dùng ví dụ',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.cicd-stale'));await ready(7);
});
await check('light theme and mobile list/diagram have no horizontal overflow',async()=>{
 await page.locator('.site-header .site-icon-button').first().click();await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('light')),true);await page.screenshot({path:out+'/live-desktop-light.png',fullPage:true});
 await page.setViewportSize({width:375,height:812});await page.getByRole('button',{name:'Đọc dạng danh sách',exact:true}).click();assert.equal(await overflow(),false);await page.screenshot({path:out+'/live-mobile-light.png',fullPage:true});
 await page.getByRole('button',{name:'Đọc dạng danh sách',exact:true}).click();await page.waitForTimeout(300);assert.equal(await overflow(),false);await page.screenshot({path:out+'/live-mobile-diagram.png',fullPage:true});
});
await check('English Playground card opens localized converter',async()=>{
 await page.goto(base+'/en/playground');await page.waitForSelector('[data-id=cicd]');assert.equal(await page.locator('[data-id=cicd] a').getAttribute('href'),'/en/cicd-visualizer');await page.locator('[data-id=cicd] a').click();await page.waitForSelector('.cm-content');assert.match(await page.locator('.cicd-lede').innerText(),/Turn a YAML file/);
});
assert.deepEqual(errors,[]);assert.deepEqual(sourceUploads,[]);assert.equal(await page.evaluate(()=>Object.values(localStorage).some(v=>v.includes('SCRIPT_SENTINEL')||v.includes('SECRET_SENTINEL'))),false);fs.writeFileSync(out+'/feature-verification.json',JSON.stringify({date:'2026-10-13',browser:'Chrome headless',findings,errors,sourceUploads},null,2));console.log('ALL PASS',findings.length);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
