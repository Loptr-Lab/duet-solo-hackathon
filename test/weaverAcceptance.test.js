const test = require('node:test');
const a = require('node:assert/strict');
const express = require('express');
const { createWeaverAcceptance, invitationDigest } = require('../services/weaverAcceptance');
const { registerWeaverRoutes, csrf, troubleshooting } = require('../services/weaverRoutes');
const ownerDid = 'did:plc:syntheticowner', did = 'did:plc:syntheticrecipient';
function database() {
  const data = new Map(); let chain = Promise.resolve();
  const db = { data, fail: false, writes: 0,
    collection: name => ({ doc: id => ({ key: `${name}/${id}`, get: async () => snap(`${name}/${id}`) }) }),
    runTransaction(fn) {
      const run = chain.then(async () => {
        const pending = [];
        const value = await fn({ get: async ref => snap(ref.key), create: (ref, record) => pending.push([ref.key, structuredClone(record)]) });
        if (db.fail) throw Error('synthetic storage outage');
        for (const [key, record] of pending) { if(data.has(key)) throw Error('already_exists'); data.set(key,record); db.writes++; }
        return value;
      }); chain = run.catch(()=>{}); return run;
    },
  };
  function snap(key) { if (db.fail) throw Error('synthetic storage outage'); const value = data.get(key); return { exists: value !== undefined, data: () => structuredClone(value) }; }
  return db;
}
function issued() { return { id:'synthetic-invitation', version:'v1', did, status:'invited', text:'Synthetic exact invitation to discuss.', approval:{status:'approved',by:ownerDid,version:'v1',invitationDigest:invitationDigest('Synthetic exact invitation to discuss.')}, verification:{status:'confirmed',subjectDid:did,reviewedBy:ownerDid,reviewedAt:100,evidenceRefs:['synthetic-private-ref']} }; }
function setup() { const db = database(); db.data.set(`duet_auth/invitation_${did}`, issued()); return { db, service:createWeaverAcceptance({db,ownerDid,now:()=>12345}) }; }
const body = { action:'accept_to_discuss', invitationId:'synthetic-invitation', version:'v1', noticeVersion:'discuss-v1', invitationDigest:invitationDigest('Synthetic exact invitation to discuss.') };
test('exact review does not accept; concurrent duplicates save one private durable receipt', async () => {
  const {db,service}=setup(); const view=await service.review(did); a.equal(view.receipt,null); a.equal(db.writes,0); a.match(view.notice,/does not itself confirm/);
  const receipts=await Promise.all(Array.from({length:10},()=>service.accept(did,body)));
  a.equal(db.writes,1); a.ok(receipts.every(x=>JSON.stringify(x)===JSON.stringify(receipts[0]))); a.equal(receipts[0].acceptedAt,12345);
  a.equal((await service.review(did)).receipt.status,'accepted_to_discuss');
  a.deepEqual([...db.data.values()].find(x=>x.acceptedAt).verificationEvidenceRefs,['synthetic-private-ref']);
});
test('missing, unapproved, wrong account, pending, mismatch and stale invitations cannot accept', async () => {
  const mutations=[inv=>{inv.status='requested'},inv=>{delete inv.approval},inv=>{inv.approval.version='old'},inv=>{inv.verification.status='pending'},inv=>{inv.verification.status='mismatch'},inv=>{inv.did='did:plc:wrong'},inv=>{inv.version='v2'},inv=>{delete inv.text},inv=>{inv.text='Changed text, same version'},inv=>{inv.verification.reviewedBy='did:plc:unauthorized'}];
  for(const mutate of mutations){const {db,service}=setup();const inv=issued();mutate(inv);db.data.set(`duet_auth/invitation_${did}`,inv);await a.rejects(service.accept(did,body));a.equal(db.writes,0);}
  const {service}=setup();await a.rejects(service.accept('did:plc:unknown',body),/not_found/);
  await a.rejects(service.accept(did,{...body,action:undefined}),/explicit_acceptance/);
});
test('storage failure cannot return success; retry preserves a single receipt', async () => {
  const {db,service}=setup();db.fail=true;await a.rejects(service.accept(did,body));a.equal(db.writes,0);db.fail=false;await service.accept(did,body);a.equal(db.writes,1);
});
test('revocation after save preserves durable historical acceptance without enabling new acceptance', async()=>{
  const {db,service}=setup();await service.accept(did,body);db.data.get(`duet_auth/invitation_${did}`).status='declined';await a.rejects(service.accept(did,body));a.equal((await service.ownerStatus(ownerDid,did)).receipt.status,'accepted_to_discuss');await a.rejects(service.ownerStatus(did,did),/forbidden/);
});
test('technical troubleshooting drafts deduplicate by code and contain no submitted private data',()=>{
  const x=troubleshooting('named_person_verification_pending');a.deepEqual(x,troubleshooting('named_person_verification_pending'));a.ok(x.searchUrl.includes(x.marker));a.ok(!JSON.stringify(x).includes(did));a.equal(troubleshooting('token=PRIVATE').marker,troubleshooting('service_unavailable').marker);a.match(x.body,/Closing this issue does not approve/);
});
test('HTTP routes enforce session, CSRF, owner boundary and notification retry without changing receipt', async t=>{
  const {db,service}=setup();let bound=true,germ=null,identity=did,outage=false;
  const app=express();app.use(express.json());
  registerWeaverRoutes(app,{db,acceptance:service,ownerDid,baseUrl:'https://weaver.test',getIdentity:async()=>{if(outage)throw Error('provider secret');return identity?{did:identity,csrfToken:csrf('synthetic-session')}:null},provider:{ownerAuthorized:async()=>bound,germ:async()=>germ}});
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>server.close());const origin=`http://127.0.0.1:${server.address().port}`;
  const call=(path,payload,headers={})=>fetch(origin+'/auth/weaver/'+path,{...(payload?{method:'POST',body:JSON.stringify(payload)}:{}),headers:{'Content-Type':'application/json',Origin:'https://weaver.test','X-CSRF-Token':csrf('synthetic-session'),...headers}});
  identity=null;a.equal((await call('invitation')).status,401);identity='did:plc:wrong';a.equal((await call('invitation')).status,404);identity=did;
  for(const headers of[{'X-CSRF-Token':''},{Origin:'https://evil.test'},{'X-CSRF-Token':'é'.repeat(43)}])a.equal((await call('accept',body,headers)).status,403);
  a.equal(db.writes,0);bound=false;a.equal((await call('accept',body)).status,409);bound=true;
  a.equal((await call('owner/status',{recipientDid:did})).status,403);
  outage=true;const failed=await call('invitation');a.equal(failed.status,503);a.ok(!JSON.stringify(await failed.json()).includes('provider secret'));outage=false;
  db.fail=true;a.equal((await call('accept',body)).status,503);db.fail=false;
  a.equal((await call('germ',{})).status,409);a.equal((await call('accept',body)).status,200);a.equal(db.writes,1);
  a.equal((await call('germ',{})).status,409);germ='https://landing.ger.mx/newUser#did:plc:syntheticowner+did:plc:syntheticrecipient';a.equal((await call('germ',{})).status,200);a.equal((await call('germ',{})).status,200);a.equal(db.writes,1);
  a.equal((await call('invitation')).headers.get('cache-control'),'no-store');identity=ownerDid;a.equal((await call('owner/status',{recipientDid:did})).status,200);
});
