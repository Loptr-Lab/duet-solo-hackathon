// Public handoff only. Private synthetic acceptance coverage moved to Companion.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const express=require('express'),a=require('node:assert/strict');
(async()=>{
 const app=express();app.use(express.static(require('node:path').resolve(__dirname,'../site')));
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{const page=await browser.newPage();let authCalls=0;page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/auth'))authCalls++});
 await page.route('https://**/*',r=>r.abort());
 for(const width of[320,390,820,1440]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.locator('#pixieButton').focus();await page.keyboard.press('Enter');
 const link=page.getByRole('link',{name:'Open PIXIE · private Weaver response',exact:true});a.equal(await link.getAttribute('href'),'https://pixie-project-companion-production.up.railway.app/?weaver=1#weaver');
 for(const enlarged of[false,true]){await page.evaluate(big=>document.documentElement.style.fontSize=big?'40px':'',enlarged);a.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
 await page.evaluate(()=>document.documentElement.style.fontSize='');await page.keyboard.press('Escape');a.equal(await page.evaluate(()=>document.activeElement.id),'pixieButton');}
 a.equal(authCalls,0);await page.emulateMedia({reducedMotion:'reduce'});a.equal(await page.locator('.weaver-sigil .core').evaluate(e=>getComputedStyle(e).animationName),'none');
 console.log('PASS public handoff, no auth calls, keyboard/focus, 320/390/820/1440, enlarged text and reduced motion. Private acceptance tested separately in Companion; physical Safari/VoiceOver untested.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
