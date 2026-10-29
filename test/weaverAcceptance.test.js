const test = require('node:test');
const a = require('node:assert/strict');
const express = require('express');
const { createWeaverAcceptance, invitationDigest } = require('../services/weaverAcceptance');
const { registerWeaverRoutes, csrf, troubleshooting } = require('../services/weaverRoutes');
const ownerDid = 'did:plc:syntheticowner', did = 'did:plc:syntheticrecipient';
const { syntheticWeaverStore } = require('./helpers/weaverStore');
function issued() { return { id:'synthetic-invitation', version:'v1', did, status:'invited', text:'Synthetic exact invitation to discuss.', approval:{status:'approved',by:ownerDid,version:'v1',invitationDigest:invitationDigest('Synthetic exact invitation to discuss.')}, verification:{status:'confirmed',subjectDid:did,reviewedBy:ownerDid,reviewedAt:100,evidenceRefs:['synthetic-private-ref']} }; }
function setup() { const store = syntheticWeaverStore(); store.data.set(`invitation:${did}`, issued()); return { store, service:createWeaverAcceptance({store,ownerDid,now:()=>12345}) }; }
const body = { action:'accept_to_discuss', invitationId:'synthetic-invitation', version:'v1', noticeVersion:'discuss-v1', invitationDigest:invitationDigest('Synthetic exact invitation to discuss.') };
test('exact review does not accept; concurrent duplicates save one private durable receipt', async () => {
  const {store,service}=setup(); const view=await service.review(did); a.equal(view.receipt,null); a.equal(store.writes,0); a.match(view.notice,/does not itself confirm/);
  const receipts=await Promise.all(Array.from({length:10},()=>service.accept(did,body)));
  a.equal(store.writes,1); a.ok(receipts.every(x=>JSON.stringify(x)===JSON.stringify(receipts[0]))); a.equal(receipts[0].acceptedAt,12345);
  a.equal((await service.review(did)).receipt.status,'accepted_to_discuss');
  a.deepEqual([...store.data.values()].find(x=>x.acceptedAt).verificationEvidenceRefs,['synthetic-private-ref']);
});
test('missing, unapproved, wrong account, pending, mismatch and stale invitations cannot accept', async () => {
  const mutations=[inv=>{inv.status='requested'},inv=>{delete inv.approval},inv=>{inv.approval.version='old'},inv=>{inv.verification.status='pending'},inv=>{inv.verification.status='mismatch'},inv=>{inv.did='did:plc:wrong'},inv=>{inv.version='v2'},inv=>{delete inv.text},inv=>{inv.text='Changed text, same version'},inv=>{inv.verification.reviewedBy='did:plc:unauthorized'}];
  for(const mutate of mutations){const {store,service}=setup();const inv=issued();mutate(inv);store.data.set(`invitation:${did}`,inv);await a.rejects(service.accept(did,body));a.equal(store.writes,0);}
  const {service}=setup();await a.rejects(service.accept('did:plc:unknown',body),/not_found/);
  await a.rejects(service.accept(did,{...body,action:undefined}),/explicit_acceptance/);
});
test('storage failure cannot return success; retry preserves a single receipt', async () => {
  const {store,service}=setup();store.fail=true;await a.rejects(service.accept(did,body));a.equal(store.writes,0);store.fail=false;await service.accept(did,body);a.equal(store.writes,1);
});
test('revocation after save preserves durable historical acceptance without enabling new acceptance', async()=>{
  const {store,service}=setup();await service.accept(did,body);store.data.get(`invitation:${did}`).status='declined';await a.rejects(service.accept(did,body));a.equal((await service.ownerStatus(ownerDid,did)).receipt.status,'accepted_to_discuss');await a.rejects(service.ownerStatus(did,did),/forbidden/);
});
test('technical troubleshooting drafts deduplicate by code and contain no submitted private data',()=>{
  const x=troubleshooting('named_person_verification_pending');a.deepEqual(x,troubleshooting('named_person_verification_pending'));a.ok(x.searchUrl.includes(x.marker));a.ok(!JSON.stringify(x).includes(did));a.equal(troubleshooting('token=PRIVATE').marker,troubleshooting('service_unavailable').marker);a.match(x.body,/Closing this issue does not approve/);
});
test('HTTP routes enforce session, CSRF, owner boundary and notification retry without changing receipt', async t=>{
  const {store,service}=setup();let bound=true,germ=null,identity=did,outage=false;
  const app=express();app.use(express.json());
  registerWeaverRoutes(app,{store,acceptance:service,ownerDid,baseUrl:'https://weaver.test',getIdentity:async()=>{if(outage)throw Error('provider secret');return identity?{did:identity,csrfToken:csrf('synthetic-session')}:null},provider:{ownerAuthorized:async()=>bound,germ:async()=>germ}});
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>server.close());const origin=`http://127.0.0.1:${server.address().port}`;
  const call=(path,payload,headers={})=>fetch(origin+'/auth/weaver/'+path,{...(payload?{method:'POST',body:JSON.stringify(payload)}:{}),headers:{'Content-Type':'application/json',Origin:'https://weaver.test','X-CSRF-Token':csrf('synthetic-session'),...headers}});
  identity=null;a.equal((await call('invitation')).status,401);identity='did:plc:wrong';a.equal((await call('invitation')).status,404);identity=did;
  for(const headers of[{'X-CSRF-Token':''},{Origin:'https://evil.test'},{'X-CSRF-Token':'é'.repeat(43)}])a.equal((await call('accept',body,headers)).status,403);
  a.equal(store.writes,0);bound=false;a.equal((await call('accept',body)).status,409);bound=true;
  a.equal((await call('owner/status',{recipientDid:did})).status,403);
  outage=true;const failed=await call('invitation');a.equal(failed.status,503);a.ok(!JSON.stringify(await failed.json()).includes('provider secret'));outage=false;
  store.fail=true;a.equal((await call('accept',body)).status,503);store.fail=false;
  a.equal((await call('germ',{})).status,409);a.equal((await call('accept',body)).status,200);a.equal(store.writes,1);
  a.equal((await call('germ',{})).status,409);germ='https://landing.ger.mx/newUser#did:plc:syntheticowner+did:plc:syntheticrecipient';a.equal((await call('germ',{})).status,200);a.equal((await call('germ',{})).status,200);a.equal(store.writes,1);
  a.equal((await call('invitation')).headers.get('cache-control'),'no-store');identity=ownerDid;a.equal((await call('owner/status',{recipientDid:did})).status,200);
});

test('recipient can recover an immutable receipt after revocation or invitation deletion, without evidence or cross-account access', async()=>{
  const {store,service}=setup();const saved=await service.accept(did,body);
  store.data.get(`invitation:${did}`).status='declined';
  a.deepEqual(await service.savedReceipt(did,body.invitationId,body.version),saved);
  store.data.delete(`invitation:${did}`);
  a.deepEqual(await service.savedReceipt(did,body.invitationId,body.version),saved);
  a.ok(!JSON.stringify(saved).includes('synthetic-private-ref'));
  await a.rejects(service.savedReceipt('did:plc:other',body.invitationId,body.version),/receipt_not_found/);
  await a.rejects(service.savedReceipt(did,body.invitationId,'v2'),/receipt_not_found/);
  await a.rejects(service.savedReceipt(did,{},body.version),/invalid_receipt_reference/);
  a.equal(store.writes,1);
});

test('receipt HTTP access stays DID-bound with owner/provider failures; external statusCode errors are sanitized',async t=>{
  const {store,service}=setup();await service.accept(did,body);store.data.delete(`invitation:${did}`);
  let identity=did, failure=false;
  const app=express();app.use(express.json());
  registerWeaverRoutes(app,{store,acceptance:service,ownerDid,baseUrl:'https://weaver.test',getIdentity:async()=>{
    if(failure)throw Object.assign(Error('private identity token or evidence'),{statusCode:403});
    return identity?{did:identity,csrfToken:csrf('synthetic-session')}:null;
  },provider:{ownerAuthorized:async()=>false,germ:async()=>{throw Error('provider outage')}}});
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>server.close());
  const url=`http://127.0.0.1:${server.address().port}/auth/weaver/receipt?invitationId=${body.invitationId}&version=${body.version}`;
  let r=await fetch(url);a.equal(r.status,200);a.equal(r.headers.get('cache-control'),'no-store');a.equal((await r.json()).receipt.recipientDid,did);
  identity='did:plc:other';a.equal((await fetch(url+'&recipientDid='+did)).status,404);
  identity=null;a.equal((await fetch(url)).status,401);
  failure=true;r=await fetch(url);a.equal(r.status,503);a.equal((await r.json()).error,'service_unavailable');a.equal(store.writes,1);
});

test('storage boundary awaits asynchronous creation and commit; failed writes never return receipts',async()=>{
  for(const flag of ['failCreate','failCommit']){
    const {store,service}=setup();store[flag]=true;
    await a.rejects(service.accept(did,body));a.equal(store.writes,0);
    a.equal([...store.data.keys()].filter(k=>k.startsWith('receipt:')).length,0);
    store[flag]=false;const saved=await service.accept(did,body);a.equal(saved.status,'accepted_to_discuss');a.equal(store.writes,1);
  }
});

test('receipt records are create-only; mismatched adapter results cannot disclose another recipient',async()=>{
  const {store,service}=setup();await service.accept(did,body);
  const {acceptanceId}=require('../services/weaverAcceptance');const key=acceptanceId(issued(),did);
  await a.rejects(store.transaction(tx=>tx.createReceipt(key,{recipientDid:'did:plc:other'})),/immutable/);
  a.equal((await service.savedReceipt(did,body.invitationId,body.version)).recipientDid,did);
  const record=store.data.get(`receipt:${key}`);record.recipientDid='did:plc:other';
  await a.rejects(service.savedReceipt(did,body.invitationId,body.version),/receipt_not_found/);
  await a.rejects(service.review(did),/invitation_version_changed/);
  await a.rejects(service.accept(did,body),/invitation_version_changed/);
  await a.rejects(service.ownerStatus(ownerDid,did),/receipt_not_found/);
});

test('unconfigured production storage does not use a historical database or enable acceptance',async t=>{
  const {productionWeaverStore,storeAvailable,capabilities,UNAVAILABLE_MESSAGE}=require('../services/weaverStore');
  const historicalDb=new Proxy({}, {get(){throw Error('historical database must not be read')}});
  const service=createWeaverAcceptance({db:historicalDb,ownerDid});
  for(const operation of [()=>service.review(did),()=>service.accept(did,body),()=>service.savedReceipt(did,body.invitationId,body.version),()=>service.ownerStatus(ownerDid,did)])await a.rejects(operation(),/acceptance_unavailable/);
  a.equal(storeAvailable(productionWeaverStore()),false);a.equal(capabilities(productionWeaverStore(),true).backend,false);
  let identityReads=0;const app=express();app.use(express.json());
  registerWeaverRoutes(app,{db:historicalDb,getIdentity:async()=>{identityReads++;throw Error('must not read identity')}});
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>server.close());
  for(const [path,method] of [['session','GET'],['invitation','GET'],['receipt?invitationId=x&version=v1','GET'],['accept','POST'],['germ','POST'],['owner/status','POST']]){
    const r=await fetch(`http://127.0.0.1:${server.address().port}/auth/weaver/${path}`,{method});
    a.equal(r.status,503);a.equal(r.headers.get('cache-control'),'no-store');a.deepEqual(await r.json(),{error:'acceptance_unavailable',message:UNAVAILABLE_MESSAGE});
  }
  a.equal(identityReads,0);
});

test('test storage cannot be enabled in production by environment or dependency injection',()=>{
  const {spawnSync}=require('node:child_process');
  const result=spawnSync(process.execPath,['-e',`
    const a=require('node:assert/strict');
    const {productionWeaverStore,storeAvailable,capabilities}=require('./services/weaverStore');
    const {syntheticWeaverStore}=require('./test/helpers/weaverStore');
    const store=syntheticWeaverStore();a.equal(storeAvailable(store),false);
    a.equal(capabilities(store,true).backend,false);
    a.equal(productionWeaverStore({adapter:store}).available,false);
    const {createWeaverAcceptance}=require('./services/weaverAcceptance');
    createWeaverAcceptance({store}).review('did:plc:synthetic').then(()=>process.exit(1),e=>{a.equal(e.message,'acceptance_unavailable')});
  `],{cwd:require('node:path').resolve(__dirname,'..'),env:{...process.env,NODE_ENV:'production',WEAVER_STORAGE_ADAPTER:'memory',WEAVER_TEST_STORE:'true'},encoding:'utf8'});
  a.equal(result.status,0,result.stderr);
});
