const test=require('node:test'),a=require('node:assert/strict');
const{destination,germHandoff,providers}=require('../services/germHandoff');
const recipientDid='did:plc:syntheticowner',senderDid='did:plc:syntheticsender';
const declaration=()=>({value:{$type:'com.germnetwork.declaration',version:'1.0.0',currentKey:{$bytes:'AQ=='},messageMe:{showButtonTo:'everyone',messageMeUrl:'https://landing.ger.mx/newUser'}}});
function run(patch={}){return germHandoff({declaration:declaration(),recipientDid,senderDid,follows:async()=>false,reachable:async()=>true,...patch});}
test('Germ URL recipient then sender ordering and supported destination only',async()=>{
  a.equal(await run(),`https://landing.ger.mx/newUser#${recipientDid}+${senderDid}`);
  for(const url of['javascript:alert(1)','http://landing.ger.mx/newUser','https://landing.ger.mx.evil.test/newUser','https://evil.test/newUser','https://landing.ger.mx/newUser#old','https://user@landing.ger.mx/newUser','https://landing.ger.mx/newUser?text=private','https://landing.ger.mx/unrecognized','https://landing.ger.mx:443/newUser#']){a.equal(destination(url,recipientDid,senderDid),null,url);}
});
test('all permission states and follow direction fail closed',async()=>{
  for(const policy of['none','unknown',null]){const d=declaration();d.value.messageMe.showButtonTo=policy;a.equal(await run({declaration:d}),null);}
  const d=declaration();d.value.messageMe.showButtonTo='usersIFollow';let args;
  a.equal(await run({declaration:d,follows:async(...x)=>{args=x;return true}}),`https://landing.ger.mx/newUser#${recipientDid}+${senderDid}`);a.deepEqual(args,[recipientDid,senderDid]);
  a.equal(await run({declaration:d,follows:async()=>false}),null);a.equal(await run({declaration:d,follows:async()=>{throw Error('outage')}}),null);
});
test('missing/invalid declarations and failed destination checks never offer an actionable link',async()=>{
  for(const d of[null,{}, {value:{}}, {...declaration(),value:{...declaration().value,messageMe:null}}, {...declaration(),value:{...declaration().value,currentKey:null}}, {...declaration(),value:{...declaration().value,version:'invalid'}}])a.equal(await run({declaration:d}),null);
  a.equal(await run({reachable:async()=>false}),null);a.equal(await run({reachable:async()=>{throw Error('inaccessible')}}),null);
});
test('provider adapter validates current owner binding and owner-to-sender follow; no sending API',async()=>{
  const owner={handle:'owner.test',did:recipientDid,pds:'https://pds.test'};const calls=[];
  const fetcher=async(url,options)=>{calls.push([url,options]);let body;
    if(url.includes('resolveHandle'))body={did:recipientDid};
    else if(url.includes('plc.directory'))body={id:recipientDid,alsoKnownAs:['at://owner.test'],service:[{id:'#atproto_pds',serviceEndpoint:'https://pds.test'}]};
    else if(url.includes('getRecord'))body={uri:`at://${recipientDid}/com.germnetwork.declaration/self`,...declaration()};
    else if(url.startsWith('https://landing.ger.mx'))return{ok:true};
    else throw Error('unexpected endpoint');
    return{ok:true,text:async()=>JSON.stringify(body)};
  };
  const p=providers(fetcher,owner);a.equal(await p.ownerAuthorized(),true);a.ok(await p.germ(senderDid));a.ok(calls.every(([,o])=>!o.method||o.method==='HEAD'));
  a.equal(await providers(async()=>{throw Error('offline')},owner).ownerAuthorized(),false);
  a.equal(await providers(async()=>({ok:false}),owner).germ(senderDid),null);
});
test('HTTP follow adapter refuses reversed follow evidence and failed destination checks',async()=>{
 const owner={handle:'owner.test',did:recipientDid,pds:'https://pds.test'};let reverse=true,reachable=true,query;
 const fetcher=async(url,options)=>{
  if(url.startsWith('https://landing.ger.mx'))return{ok:reachable};
  let body;
  if(url.includes('resolveHandle'))body={did:recipientDid};
  else if(url.includes('plc.directory'))body={id:recipientDid,alsoKnownAs:['at://owner.test'],service:[{id:'#atproto_pds',serviceEndpoint:'https://pds.test'}]};
  else if(url.includes('getRecord')){body={uri:`at://${recipientDid}/com.germnetwork.declaration/self`,...declaration()};body.value.messageMe.showButtonTo='usersIFollow';}
  else if(url.includes('getRelationships')){query=new URL(url);body={actor:recipientDid,relationships:[{did:senderDid,following:`at://${reverse?senderDid:recipientDid}/app.bsky.graph.follow/synthetic`}]};}
  else throw Error('unexpected');
  return{ok:true,text:async()=>JSON.stringify(body)};
 };
 const p=providers(fetcher,owner);a.equal(await p.germ(senderDid),null);a.equal(query.searchParams.get('actor'),recipientDid);a.equal(query.searchParams.get('others'),senderDid);
 reverse=false;a.ok(await p.germ(senderDid));reachable=false;a.equal(await p.germ(senderDid),null);
});
