const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
test('hub artwork survives the existing Pages builder without competing presentation',()=>{
 const root=path.join(__dirname,'..');const html=fs.readFileSync(path.join(root,'duet-review.html'),'utf8');
 assert.doesNotMatch(html,/<style\b|\sstyle=/i);
 const sheets=[...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(sheets,['./style.css']);
 const svg=fs.readFileSync(path.join(root,'review-site/duet-artwork.svg'),'utf8');assert.equal((svg.match(/xmlns=/g)||[]).length,1,'image must remain valid standalone SVG');assert.doesNotMatch(svg,/onclick|onkeydown|tabindex/);
 const source=fs.readFileSync(path.join(root,'public/index.html'),'utf8');for(const points of [...svg.matchAll(/points="([^"]+)"/g)].map(m=>m[1]))assert.ok(source.includes('points="'+points+'"'),'reuse original sigil paths');
 assert.match(fs.readFileSync(path.join(root,'.github/workflows/deploy-pages.yml'),'utf8'),/cp review-site\/\* _site\//,'Pages package includes generated artwork');
});
