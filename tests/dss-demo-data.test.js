import test from 'node:test';
import assert from 'node:assert/strict';
import { issues, trades, areas, projects } from '../dss-demo-data.js';
const involved = trade => issues.filter(x => x.trades.includes(trade));
const pair = (a, b) => involved(a).filter(x => x.trades.includes(b));
const criticalShare = rows => rows.filter(x => x.severity === 'Critical').length / rows.length;
const highShare = rows => rows.filter(x => ['Critical', 'High'].includes(x.severity)).length / rows.length;
test('electrical leads volume while mechanical and structure have higher critical shares', () => {
  assert.equal([...trades].sort((a,b) => involved(b).length-involved(a).length)[0], 'Electrical');
  assert.ok(criticalShare(involved('Electrical')) < .12);
  assert.ok(criticalShare(involved('Mechanical')) > criticalShare(involved('Electrical')) * 2);
  assert.ok(criticalShare(involved('Structure')) > criticalShare(involved('Mechanical')));
});
test('mechanical / structural, fire, and plumbing interfaces carry elevated severity', () => {
  assert.ok(highShare(pair('Mechanical', 'Structure')) > .7);
  for (const trade of ['Fire','Plumbing']) assert.ok(highShare(pair('Mechanical', trade)) > .6);
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
    assert.equal(new Set(row.trades).size, 2);
    assert.ok(row.trades.every(t => trades.includes(t)));
    if (row.status === 'Resolved') assert.ok(Number.isFinite(row.days) && row.days > 0);
    else assert.equal(row.days, null);
  }
});
