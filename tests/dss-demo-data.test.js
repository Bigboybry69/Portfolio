import test from 'node:test';
import assert from 'node:assert/strict';
import { issues, trades, areas, projects, rankAreas, pairSpecs } from '../dss-demo-data.js';
const involved = trade => issues.filter(x => x.trades.includes(trade));
const pair = (a,b) => issues.filter(x => x.trades[0] === a && x.trades[1] === b || x.trades[0] === b && x.trades[1] === a);
const criticalShare = rows => rows.filter(x => x.severity === 'Critical').length / rows.length;
const highShare = rows => rows.filter(x => ['Critical', 'High'].includes(x.severity)).length / rows.length;
test('electrical leads volume while mechanical and structure have higher critical shares', () => {
  assert.equal([...trades].sort((a,b) => involved(b).length-involved(a).length)[0], 'Electrical');
  assert.ok(criticalShare(involved('Electrical')) < .12);
  assert.ok(criticalShare(involved('Mechanical')) > criticalShare(involved('Electrical')) * 2);
  assert.ok(criticalShare(involved('Structure')) > criticalShare(involved('Mechanical')));
});
test('mechanical / structural and fire risks exceed mechanical / plumbing', () => {
  assert.ok(highShare(pair('Mechanical', 'Structure')) > .7);
  assert.ok(highShare(pair('Mechanical','Fire')) > .55);
  assert.ok(highShare(pair('Mechanical','Plumbing')) < .35);
  assert.ok(criticalShare(pair('Plumbing','Structure')) < criticalShare(pair('Mechanical','Structure')) / 2);
});
test('plumbing concentrates in mechanical rooms and structural conflicts include underground scope', () => {
  const rows = involved('Plumbing');
  assert.ok(rows.filter(x => x.area === 'Mechanical rooms').length > rows.length * .45);
  assert.ok(pair('Plumbing','Structure').every(x => /underground/i.test(x.scope)));
});
test('generator yards emphasize electrical and plumbing with underground coordination', () => {
  const yard = issues.filter(x => x.area === 'Generator yards');
  assert.ok(yard.filter(x => x.trades.includes('Electrical') || x.trades.includes('Plumbing')).length / yard.length > .85);
  assert.ok(yard.some(x => /storm, waste and drainage/.test(x.scope)));
});
test('architecture has low volume and early penetration scope', () => {
  assert.ok(involved('Architecture').length / issues.length < .1);
  assert.ok(involved('Architecture').every(x => /Early penetration/.test(x.scope)));
});
test('all project records, statuses, durations and identities remain consistent', () => {
  assert.equal(new Set(issues.map(x => x.id)).size, issues.length);
  assert.equal(new Set(issues.map(x => x.project)).size, 8);
  for (const row of issues) {
    assert.ok(projects.includes(row.project) && areas.includes(row.area));
    assert.equal(row.trades.length, 2);
    assert.ok(row.trades.every(t => trades.includes(t)));
    if (row.status === 'Resolved') assert.ok(Number.isFinite(row.days) && row.days > 0);
    else assert.equal(row.days, null);
  }
});

test('electrical rooms lead clash count while data halls have fewest and mildest issues', () => {
  const ranked = rankAreas(issues);
  const byCount = [...ranked].sort((a,b)=>b.count-a.count);
  assert.equal(byCount[0].area, 'Electrical rooms');
  assert.equal(byCount.at(-1).area, 'Data halls');
  assert.equal([...ranked].sort((a,b)=>a.severity-b.severity)[0].area, 'Data halls');
  assert.equal(ranked[0].area, 'Mechanical rooms');
  assert.equal(ranked.at(-1).area, 'Data halls');
  const electrical = issues.filter(x=>x.area==='Electrical rooms');
  assert.ok(electrical.filter(x=>x.trades[0]==='Electrical' && x.trades[1]==='Electrical').length / electrical.length > .5);
});
test('plumbing primarily clashes with itself and yard scopes mention equipment interfaces', () => {
  const plumbingPairs = trades.map(t=>({t,count:pair('Plumbing',t).length})).sort((a,b)=>b.count-a.count);
  assert.equal(plumbingPairs[0].t, 'Plumbing');
  const yard = issues.filter(x=>x.area==='Generator yards');
  assert.ok(yard.filter(x=>/transformers, generators and switchgear/.test(x.scope)).length / yard.length > .6);
});
test('area selection preserves priority baseline and handles empty scopes', () => {
  for(const area of areas) {
    const full = rankAreas(issues).find(x=>x.area===area);
    const selected = rankAreas(issues.filter(x=>x.area===area),issues).find(x=>x.area===area);
    assert.equal(selected.score,full.score);
  }
  assert.ok(rankAreas([]).every(x=>x.score===0 && x.days===null));
});

test('pair totals partition unique issues including internal system categories', () => {
  const sum = pairSpecs.reduce((total,[a,b])=>total+pair(trades[a],trades[b]).length,0);
  assert.equal(sum,issues.length);
  for(const [a,b,n] of pairSpecs) assert.equal(pair(trades[a],trades[b]).length,n);
});
