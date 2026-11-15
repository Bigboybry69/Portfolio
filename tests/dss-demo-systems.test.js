import test from 'node:test';
import assert from 'node:assert/strict';
import { issues } from '../dss-demo-data.js';
import { assignSystemDetail, summarizeSystems } from '../dss-demo-systems.js';
test('system groups partition existing same-trade issues without additional clashes',()=>{
 for(const trade of ['Electrical','Plumbing','Mechanical']){
  const rows=issues.filter(x=>x.trades[0]===trade&&x.trades[1]===trade);
  const groups=summarizeSystems(issues,trade);
  assert.equal(groups.reduce((s,x)=>s+x.count,0),rows.length);
  assert.ok(rows.every(x=>x.systemDetail?.systems.length===2));
  assert.ok(rows.every(x=>JSON.stringify(assignSystemDetail(x))===JSON.stringify(x.systemDetail)));
 }
 assert.ok(issues.filter(x=>x.trades[0]!==x.trades[1]).every(x=>x.systemDetail===null));
});
test('largest system interfaces reflect the supplied coordination experience',()=>{
 assert.equal(summarizeSystems(issues,'Electrical')[0].label,'Power conduits × Cable trays');
 assert.equal(summarizeSystems(issues,'Electrical')[1].label,'Power conduits × Lighting');
 assert.equal(summarizeSystems(issues,'Plumbing')[0].label,'Cold water × Hot water');
 assert.equal(summarizeSystems(issues,'Mechanical')[0].label,'Supply ducts × Return ducts');
 const electrical=summarizeSystems(issues,'Electrical');
 assert.ok(electrical.reduce((s,x)=>s+x.hangers,0)>800);
});
test('generator yards use underground systems and equipment interfaces',()=>{
 const yard=issues.filter(x=>x.area==='Generator yards');
 for(const trade of ['Electrical','Plumbing']){
  const groups=summarizeSystems(yard,trade);
  assert.equal(groups.length,1);
  assert.match(groups[0].label,/Underground/);
  assert.match(groups[0].note,/transformers, generators and switchgear/);
  assert.equal(groups[0].hangers,0);
 }
});
test('filtered summaries conserve counts and do not leak other trades',()=>{
 const scope=issues.filter(x=>x.area==='Mechanical rooms'&&x.severity==='High'&&x.project==='PHX-01 · Sonoran');
 for(const trade of ['Electrical','Plumbing','Mechanical']){
  assert.equal(summarizeSystems(scope,trade).reduce((s,x)=>s+x.count,0),scope.filter(x=>x.trades.every(t=>t===trade)).length);
 }
 assert.deepEqual(summarizeSystems([], 'Electrical'), []);
 assert.deepEqual(summarizeSystems(issues.filter(x=>x.trades.includes('Fire')), 'Electrical'), []);
});
