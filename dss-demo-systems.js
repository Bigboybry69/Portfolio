// Same-trade system categories: no additional issues are added to portfolio totals.
export const systemProfiles = {
  Electrical: [
    { systems: ['Power conduits', 'Cable trays'], weight: 48, note: 'Conduit routes intersect tray runs and their support zones.', hangerShare: .72 },
    { systems: ['Power conduits', 'Lighting'], weight: 24, note: 'Lighting supports and hangers obstruct power routing.', hangerShare: .83 },
    { systems: ['Power conduits', 'Fan power connections'], weight: 17, note: 'Fan connection routes and supports overlap power conduits.', hangerShare: .78 },
    { systems: ['Cable trays', 'Lighting'], weight: 11, note: 'Tray supports compete with lighting hangers and access.', hangerShare: .76 },
  ],
  Plumbing: [
    { systems: ['Cold water', 'Hot water'], weight: 40, note: 'Parallel water routes compete for elevation and clearances.', hangerShare: .12 },
    { systems: ['Cold water', 'Drainage'], weight: 24, note: 'Drain slope and water distribution routes overlap.', hangerShare: .1 },
    { systems: ['Hot water', 'Drainage'], weight: 20, note: 'Sloped drains cross hot-water runs.', hangerShare: .1 },
    { systems: ['Split-unit refrigerant lines', 'Cold / hot water'], weight: 10, note: 'Congested office and hallway service routes.', hangerShare: .16 },
    { systems: ['Split-unit refrigerant lines', 'Drainage'], weight: 6, note: 'Split-unit pipe runs intersect drainage in tight service routes.', hangerShare: .12 },
  ],
  Mechanical: [
    { systems: ['Supply ducts', 'Return ducts'], weight: 48, note: 'Large duct sections compete for routing space and elevation.', hangerShare: .14 },
    { systems: ['Chilled-water pipes', 'Ductwork'], weight: 24, note: 'Chiller piping crosses large supply and return duct routes.', hangerShare: .14 },
    { systems: ['Steam pipes', 'Ductwork'], weight: 16, note: 'Steam routing and clearances conflict with ductwork.', hangerShare: .12 },
    { systems: ['Chilled-water pipes', 'Steam pipes'], weight: 12, note: 'Mechanical pipe systems compete for routing and support space.', hangerShare: .18 },
  ],
};
export function assignSystemDetail(issue) {
  if (issue.trades[0] !== issue.trades[1]) return null;
  const profiles = systemProfiles[issue.trades[0]];
  if (!profiles) return null;
  // Independent per-record hash leaves existing severity/area/project assignments intact.
  let state = 2166136261;
  for (const c of issue.id) state = Math.imul(state ^ c.charCodeAt(0), 16777619) >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  let target = random() * profiles.reduce((sum, x) => sum + x.weight, 0);
  const profile = profiles.find(x => (target -= x.weight) < 0) || profiles.at(-1);
  const underground = issue.area === 'Generator yards' && ['Electrical', 'Plumbing'].includes(issue.trades[0]);
  if (underground) {
    const electrical = issue.trades[0] === 'Electrical';
    return { systems: electrical ? ['Underground power ducts', 'Equipment feeder conduits'] : ['Storm / waste drains', 'Underground drainage branches'],
      mechanism: 'Underground route / equipment interface',
      note: 'Below transformers, generators and switchgear; coordinate equipment pads and foundations.' };
  }
  return { systems: profile.systems, mechanism: random() < profile.hangerShare ? 'Hanger / support interference' : 'Route / clearance conflict', note: profile.note };
}
export function summarizeSystems(rows, trade) {
  const groups = new Map();
  for (const issue of rows) {
    if (issue.trades[0] !== trade || issue.trades[1] !== trade || !issue.systemDetail) continue;
    const key = issue.systemDetail.systems.join(' × ');
    if (!groups.has(key)) groups.set(key, { label: key, count: 0, hangers: 0, high: 0, days: [], note: issue.systemDetail.note });
    const group = groups.get(key);
    group.count++;
    group.hangers += Number(issue.systemDetail.mechanism === 'Hanger / support interference');
    group.high += Number(['Critical', 'High'].includes(issue.severity));
    if (issue.days !== null) group.days.push(issue.days);
  }
  return [...groups.values()].sort((a,b) => b.count-a.count || a.label.localeCompare(b.label));
}
