const test = require('node:test');
const a = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const { createAtprotoAuth } = require('../services/atprotoAuth');

test('existing OAuth BFF enforces expiry, DID binding, cookie attributes and logout using isolated synthetic sessions', async t => {
  const previous = Object.fromEntries(['ATPROTO_BASE_URL','ATPROTO_OAUTH_PRIVATE_KEY'].map(k=>[k,process.env[k]]));
  t.after(()=>{for(const [k,v] of Object.entries(previous)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
  process.env.ATPROTO_BASE_URL='https://weaver.test';
  process.env.ATPROTO_OAUTH_PRIVATE_KEY=crypto.generateKeyPairSync('ec',{namedCurve:'P-256'}).privateKey.export({type:'pkcs8',format:'pem'});
  const data=new Map();let failDelete=false;
  const db={collection:name=>({doc:id=>({
    get:async()=>({exists:data.has(`${name}/${id}`),data:()=>data.get(`${name}/${id}`)}),
    set:async value=>data.set(`${name}/${id}`,value),delete:async()=>{if(failDelete)throw Error('synthetic private storage error');return data.delete(`${name}/${id}`);}
  })})};
  const auth=await createAtprotoAuth({db});
  let restore=0;
  auth.client.restore=async did=>{restore++;return {did};};
  for(const expiresAt of [undefined,null,NaN,Infinity,'tomorrow',Date.now()-1]){
    data.set('duet_auth/browser_expired',{did:'did:plc:synthetic',expiresAt});
    a.equal(await auth.getIdentity('expired'),null);a.equal(data.has('duet_auth/browser_expired'),false);
  }
  a.equal(restore,0);
  data.set('duet_auth/browser_valid',{did:'did:plc:synthetic',expiresAt:Date.now()+60000});
  a.equal((await auth.getIdentity('valid')).did,'did:plc:synthetic');
  auth.client.restore=async()=>({did:'did:plc:other'});
  await a.rejects(auth.getIdentity('valid'),/session_identity_mismatch/);
  auth.client.restore=async()=>{throw Error('synthetic provider outage');};
  await a.rejects(auth.getIdentity('valid'),/provider outage/);
  const headers={};await auth.attachIdentity({getHeader:k=>headers[k],setHeader:(k,v)=>headers[k]=v},'did:plc:synthetic');
  const cookie=headers['Set-Cookie'][0];
  for(const flag of ['HttpOnly','Secure','SameSite=Lax','Path=/'])a.ok(cookie.includes(flag));
  const app=express();app.use(express.json());auth.routes(app);
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>server.close());
  const origin=`http://127.0.0.1:${server.address().port}`;
  let r=await fetch(origin+'/auth/weaver/session',{headers:{Cookie:'duet_at_session=%ZZ'}});a.equal(r.status,401);
  failDelete=true;r=await fetch(origin+'/auth/logout',{method:'POST',headers:{Cookie:cookie.split(';')[0]}});a.equal(r.status,503);a.equal((await r.json()).error,'service_unavailable');a.equal(r.headers.get('set-cookie'),null);failDelete=false;
  r=await fetch(origin+'/auth/logout',{method:'POST',headers:{Cookie:cookie.split(';')[0]}});a.equal(r.status,204);a.match(r.headers.get('set-cookie'),/Max-Age=0/);
  a.equal([...data.keys()].filter(k=>k.startsWith('duet_auth/browser_')).length,1);
  const metadata=await (await fetch(origin+'/client-metadata.json')).json();
  a.deepEqual(metadata.redirect_uris,['https://weaver.test/auth/atproto/callback']);a.equal(metadata.token_endpoint_auth_method,'private_key_jwt');
  const jwks=await(await fetch(origin+'/jwks.json')).json();a.ok(jwks.keys.length);a.ok(jwks.keys.every(k=>!('d' in k)));
});
