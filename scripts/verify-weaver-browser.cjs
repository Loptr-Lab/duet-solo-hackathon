const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const express=require('express');
const a=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..');
const {createWeaverAcceptance,invitationDigest}=require(root+'/services/weaverAcceptance');
const {registerWeaverRoutes,csrf}=require(root+'/services/weaverRoutes');
const ownerDid='did:plc:syntheticowner', did='did:plc:syntheticrecipient';
const {syntheticWeaverStore}=require(root+'/test/helpers/weaverStore');
const store=syntheticWeaverStore(),data=store.data;
let signedIn=true,delay=false,release,reviewStarted;
const invitation={id:'synthetic-invitation',did,status:'invited',version:'v1',text:'Exact synthetic invitation <script>window.injected=true</script>.',approval:{status:'approved',by:ownerDid,version:'v1'},verification:{status:'confirmed',subjectDid:did,reviewedBy:ownerDid,reviewedAt:100,evidenceRefs:['synthetic-ref']}};
invitation.approval.invitationDigest=invitationDigest(invitation.text);data.set(`invitation:${did}`,invitation);
const service=createWeaverAcceptance({store,ownerDid});const originalReview=service.review;service.review=async(...args)=>{if(delay){reviewStarted?.();await new Promise(r=>release=r);}return originalReview(...args);};
(async()=>{
 const app=express();app.use(express.json());app.get('/auth/weaver/capabilities',(q,r)=>r.json({backend:true}));app.post('/auth/logout',(q,r)=>{signedIn=false;r.status(204).end();});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const origin=`http://127.0.0.1:${server.address().port}`;
 registerWeaverRoutes(app,{store,acceptance:service,ownerDid,baseUrl:origin,getIdentity:async()=>signedIn?{did,csrfToken:csrf('synthetic-session')}:null,provider:{ownerAuthorized:async()=>true,germ:async()=>null}});
 app.use('/duet',express.static(root+'/site'));app.use(express.static(root+'/public'));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage();page.setDefaultTimeout(10000);console.log('Browser launched');await page.route('https://**/*',r=>r.abort());
 await page.goto(origin+'/weaver/#invitation');console.log('Loaded synthetic page');await page.getByRole('button',{name:'Accept invitation to discuss',exact:true}).waitFor();
 a.equal(store.writes,0);a.equal(await page.evaluate(()=>window.injected),undefined);a.ok((await page.locator('#invitation-content pre').first().innerText()).includes('<script>'));
 store.fail=true;await page.getByRole('button',{name:'Accept invitation to discuss',exact:true}).click();await page.getByText('Verification or storage could not be confirmed.',{exact:false}).waitFor();a.equal(store.writes,0);a.equal(await page.getByRole('heading',{name:'Your acceptance receipt'}).count(),0);
 store.fail=false;await page.getByRole('button',{name:'Accept invitation to discuss',exact:true}).click();await page.getByRole('heading',{name:'Your acceptance receipt'}).waitFor();a.equal(store.writes,1);
 console.log('Acceptance saved');const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download this receipt'}).click();const download=await downloadPromise;a.equal(download.suggestedFilename(),'weaver-acceptance-receipt.json');
 data.get(`invitation:${did}`).status='declined';await page.getByRole('button',{name:'Check saved acceptance and notification options'}).click();await page.getByText('An issued invitation is required.',{exact:false}).waitFor();
 await page.getByText('Retrieve an earlier acceptance receipt',{exact:true}).click();await page.getByLabel('Invitation ID',{exact:true}).fill('synthetic-invitation');await page.getByLabel('Invitation version',{exact:true}).fill('v1');await page.getByRole('button',{name:'Retrieve saved receipt'}).click();await page.getByRole('heading',{name:'Your acceptance receipt'}).waitFor();a.equal(store.writes,1);
 data.get(`invitation:${did}`).status='invited';await page.getByRole('button',{name:'Check current invitation'}).click();await page.getByRole('button',{name:'Sign out and clear this view'}).waitFor();
 console.log('Receipt recovered');delay=true;const started=new Promise(r=>reviewStarted=r);await page.getByRole('button',{name:'Check my invitation',exact:true}).click();await started;await page.getByRole('button',{name:'Sign out and clear this view'}).click();await page.getByText('You are signed out.',{exact:false}).waitFor();release();await page.waitForTimeout(150);a.equal(await page.getByRole('heading',{name:'Your acceptance receipt'}).count(),0);a.equal(await page.locator('#invitation-content').innerText().then(s=>s.includes('syntheticrecipient')),false);
 console.log('PASS synthetic HTTP/browser: explicit acceptance, exact text/XSS safety, storage failure, retry, receipt download/recovery, logout race; one write.');
 // Static review has no backend: intercept the capabilities request as a static 404.
 await page.route('**/auth/weaver/capabilities',r=>r.fulfill({status:404,contentType:'text/html',body:'Not found'}));
 await page.goto(origin+'/duet/');await page.locator('#pixieButton').focus();await page.keyboard.press('Enter');await page.getByText('Invitation acceptance is not available on this deployment.',{exact:false}).waitFor();await page.keyboard.press('Escape');a.equal(await page.evaluate(()=>document.activeElement.id),'pixieButton');
 for(const width of [320,390,820,1440]){
  await page.setViewportSize({width,height:1000});await page.locator('#pixieButton').click();
  for(const enlarged of [false,true]){
   await page.evaluate(big=>document.documentElement.style.fontSize=big?'40px':'',enlarged);
   const dims=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,panel:document.getElementById('pixiePanel').scrollWidth,panelWidth:document.getElementById('pixiePanel').clientWidth}));
   a.ok(dims.page<=width+1,JSON.stringify({width,enlarged,...dims}));a.ok(dims.panel<=dims.panelWidth+1,JSON.stringify({width,enlarged,...dims}));
  }
  await page.evaluate(()=>document.documentElement.style.fontSize='');await page.keyboard.press('Escape');
 }
 await page.emulateMedia({reducedMotion:'reduce'});const animations=await page.locator('.weaver-sigil .core').evaluateAll(es=>es.map(e=>getComputedStyle(e).animationName));a.ok(animations.every(v=>v==='none'));
 console.log('PASS local Chromium: static fail-closed, keyboard/Enter/Escape/focus, 320/390/820/1440 widths, 200% text reflow, reduced motion. Physical Safari/VoiceOver untested.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
