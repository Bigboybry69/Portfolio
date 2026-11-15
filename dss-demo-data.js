// Synthetic coordination scenarios informed by qualitative experience, not measured results.
export const projects = ['PHX-01 · Sonoran', 'PHX-02 · Saguaro', 'DFW-01 · Trinity', 'DFW-02 · Prairie', 'IAD-01 · Potomac', 'IAD-02 · Blue Ridge', 'ATL-01 · Peachtree', 'PDX-01 · Cascade'];
export const trades = ['Mechanical', 'Plumbing', 'Electrical', 'Fire', 'Structure', 'Architecture'];
export const areas = ['Mechanical rooms', 'Data halls', 'Electrical rooms', 'Generator yards'];
export const severities = ['Critical', 'High', 'Medium', 'Low'];

// a, b, unique clashes, severity percentages, area percentages (in the order above).
// Electrical leads in volume. Mechanical/structural interfaces lead in severity.
const scenarios = [
  { a: 0, b: 1, n: 300, severity: [6, 22, 50, 22], area: [78, 4, 10, 8] },
  { a: 0, b: 2, n: 650, severity: [10, 30, 44, 16], area: [48, 7, 40, 5] },
  { a: 0, b: 3, n: 380, severity: [24, 39, 29, 8], area: [76, 8, 13, 3] },
  { a: 0, b: 4, n: 340, severity: [42, 37, 17, 4], area: [78, 7, 10, 5] },
  { a: 0, b: 5, n: 90, severity: [8, 32, 42, 18], area: [62, 8, 28, 2] },
  { a: 1, b: 2, n: 600, severity: [5, 23, 49, 23], area: [26, 2, 17, 55] },
  { a: 1, b: 3, n: 100, severity: [4, 17, 50, 29], area: [80, 5, 10, 5] },
  { a: 1, b: 4, n: 140, severity: [14, 29, 40, 17], area: [56, 2, 7, 35] },
  { a: 1, b: 5, n: 50, severity: [3, 17, 48, 32], area: [73, 3, 19, 5] },
  { a: 2, b: 3, n: 430, severity: [3, 17, 53, 27], area: [15, 8, 72, 5] },
  { a: 2, b: 4, n: 250, severity: [15, 29, 40, 16], area: [17, 3, 25, 55] },
  { a: 2, b: 5, n: 100, severity: [4, 24, 45, 27], area: [15, 5, 70, 10] },
  { a: 3, b: 4, n: 140, severity: [24, 35, 30, 11], area: [55, 8, 32, 5] },
  { a: 3, b: 5, n: 45, severity: [7, 28, 43, 22], area: [42, 8, 48, 2] },
  { a: 4, b: 5, n: 35, severity: [14, 26, 40, 20], area: [50, 5, 40, 5] },
  // Same-trade coordination is counted once, including in matrix diagonal cells.
  { a: 2, b: 2, n: 1600, severity: [2, 13, 53, 32], area: [6, 7, 77, 10] },
  { a: 1, b: 1, n: 600, severity: [3, 15, 51, 31], area: [68, 2, 7, 23] },
  { a: 0, b: 0, n: 180, severity: [12, 31, 41, 16], area: [78, 8, 12, 2] },
];
export const pairSpecs = scenarios.map(({ a, b, n }) => [a, b, n]);

// Seeded pseudo-random draws keep reloads stable and avoid coupling area and severity.
let seed = 20261115;
function draw() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function weighted(values, weights) {
  const target = draw() * weights.reduce((sum, n) => sum + n, 0);
  let cumulative = 0;
  return values[weights.findIndex(n => (cumulative += n) > target)] ?? values.at(-1);
}
function scopeFor(tradePair, area) {
  if (tradePair[0] === tradePair[1]) {
    if (tradePair[0] === 'Electrical') return area === 'Generator yards' ? 'Underground electrical conduit banks beneath transformers, generators and switchgear' : 'Electrical conduit-to-conduit, cable tray and service-clearance coordination';
    if (tradePair[0] === 'Plumbing') return area === 'Generator yards' ? 'Underground storm, waste and drainage beneath transformers, generators and switchgear' : 'Plumbing-to-plumbing routing, slopes and service clearances';
    return 'Mechanical equipment, ductwork and maintenance clearances within the trade';
  }
  if (tradePair.includes('Architecture')) return 'Early penetration, sleeve and firestop coordination';
  if (area === 'Generator yards') {
    if (tradePair.includes('Plumbing') && tradePair.includes('Electrical')) return 'Underground electrical versus storm, waste and drainage beneath transformers, generators and switchgear';
    if (tradePair.includes('Electrical')) return 'Underground electrical banks, cable trays and foundation interfaces';
    if (tradePair.includes('Plumbing')) return 'Underground storm, waste and drainage versus foundations';
  }
  if (tradePair.includes('Plumbing') && tradePair.includes('Structure')) return 'Underground plumbing versus foundations and structural elements';
  if (tradePair.includes('Mechanical') && tradePair.includes('Structure')) return 'Mechanical equipment / ductwork versus primary structure';
  if (tradePair.includes('Mechanical')) return 'Equipment access, ductwork and multi-trade routing';
  return 'Service routing, clearances and installation access';
}
export const issues = scenarios.flatMap(({ a, b, n, severity, area }, pairIndex) =>
  Array.from({ length: n }, (_, i) => {
    const selectedArea = weighted(areas, area);
    // Spacious, repeated data-hall layouts reduce both volume and severity.
    const adjustedSeverity = selectedArea === 'Data halls'
      ? [severity[0] * .25, severity[1] * .5, severity[2], severity[3] + severity[0] * .75 + severity[1] * .5]
      : severity;
    const selectedSeverity = weighted(severities, adjustedSeverity);
    const project = projects[Math.floor(draw() * projects.length)];
    const openChance = { Critical: .26, High: .18, Medium: .1, Low: .06 }[selectedSeverity];
    const resolved = draw() >= openChance;
    const structural = a === 4 || b === 4;
    const baseline = { Critical: 25, High: 16, Medium: 8, Low: 4 }[selectedSeverity];
    const duration = Math.max(1, baseline + (structural ? 3 : 0) + (selectedArea === 'Generator yards' ? 2 : 0) + (draw() - .5) * 6);
    const tradePair = [trades[a], trades[b]];
    return { id: `DSS-${pairIndex}-${i}`, project, trades: tradePair, area: selectedArea,
      severity: selectedSeverity, status: resolved ? 'Resolved' : 'Open',
      days: resolved ? Math.round(duration * 10) / 10 : null, scope: scopeFor(tradePair, selectedArea) };
  })
);
export const areaNotes = {
  'Mechanical rooms': 'Dense multi-trade routing and larger mechanical / structural or fire conflicts drive risk. Most plumbing clashes are within plumbing and are less severe.',
  'Data halls': 'Repeated layouts and more available space mean fewer, less severe conflicts; maintain consistent routing and service clearances.',
  'Electrical rooms': 'Highest clash volume, dominated by conduit-to-conduit and cable-tray coordination; most issues are medium or low severity.',
  'Generator yards': 'Coordinate underground electrical and storm / waste / drainage beneath transformers, generators and switchgear; focus on equipment pads and foundation interfaces.',
};

// Compare areas within the same project/trade/severity scope. An area selection
// does not inflate its volume component by changing the reference denominator.
export function rankAreas(rows, referenceRows = rows) {
  const maximumVolume = Math.max(1, ...areas.map(area => referenceRows.filter(x => x.area === area).length));
  return areas.map(area => {
    const matches = rows.filter(x => x.area === area);
    const resolved = matches.filter(x => x.days !== null);
    const severity = matches.length ? matches.reduce((sum,x) => sum + ({Critical:100,High:75,Medium:40,Low:15}[x.severity]),0) / matches.length : 0;
    const days = resolved.length ? resolved.reduce((sum,x) => sum+x.days,0) / resolved.length : null;
    const volume = matches.length / maximumVolume * 100;
    const score = matches.length ? Math.round(.5 * severity + .3 * Math.min(100,(days ?? 0)/30*100) + .2 * volume) : 0;
    return { area, score, count: matches.length, severity, days, volume,
      highShare: matches.length ? matches.filter(x=>['Critical','High'].includes(x.severity)).length / matches.length * 100 : 0 };
  }).sort((a,b) => b.score-a.score || b.count-a.count);
}
