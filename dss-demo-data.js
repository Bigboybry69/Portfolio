// Synthetic coordination scenarios informed by qualitative experience, not measured results.
export const projects = ['PHX-01 · Sonoran', 'PHX-02 · Saguaro', 'DFW-01 · Trinity', 'DFW-02 · Prairie', 'IAD-01 · Potomac', 'IAD-02 · Blue Ridge', 'ATL-01 · Peachtree', 'PDX-01 · Cascade'];
export const trades = ['Mechanical', 'Plumbing', 'Electrical', 'Fire', 'Structure', 'Architecture'];
export const areas = ['Mechanical rooms', 'Data halls', 'Electrical rooms', 'Generator yards'];
export const severities = ['Critical', 'High', 'Medium', 'Low'];

// a, b, unique clashes, severity percentages, area percentages (in the order above).
// Electrical leads in volume. Mechanical/structural interfaces lead in severity.
const scenarios = [
  { a: 0, b: 1, n: 480, severity: [24, 39, 29, 8], area: [65, 18, 7, 10] },
  { a: 0, b: 2, n: 650, severity: [9, 29, 46, 16], area: [35, 30, 30, 5] },
  { a: 0, b: 3, n: 380, severity: [27, 40, 26, 7], area: [45, 40, 12, 3] },
  { a: 0, b: 4, n: 340, severity: [42, 37, 17, 4], area: [53, 30, 12, 5] },
  { a: 0, b: 5, n: 90, severity: [8, 32, 42, 18], area: [40, 35, 23, 2] },
  { a: 1, b: 2, n: 540, severity: [5, 20, 51, 24], area: [30, 7, 18, 45] },
  { a: 1, b: 3, n: 160, severity: [10, 27, 45, 18], area: [65, 25, 5, 5] },
  { a: 1, b: 4, n: 300, severity: [36, 40, 20, 4], area: [60, 8, 7, 25] },
  { a: 1, b: 5, n: 50, severity: [6, 28, 44, 22], area: [65, 15, 15, 5] },
  { a: 2, b: 3, n: 430, severity: [3, 17, 53, 27], area: [10, 35, 50, 5] },
  { a: 2, b: 4, n: 320, severity: [18, 31, 37, 14], area: [15, 15, 25, 45] },
  { a: 2, b: 5, n: 100, severity: [4, 24, 45, 27], area: [15, 20, 55, 10] },
  { a: 3, b: 4, n: 140, severity: [24, 35, 30, 11], area: [30, 45, 20, 5] },
  { a: 3, b: 5, n: 45, severity: [7, 28, 43, 22], area: [25, 45, 28, 2] },
  { a: 4, b: 5, n: 35, severity: [20, 35, 32, 13], area: [35, 35, 25, 5] },
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
  if (tradePair.includes('Architecture')) return 'Early penetration, sleeve and firestop coordination';
  if (area === 'Generator yards') {
    if (tradePair.includes('Plumbing') && tradePair.includes('Electrical')) return 'Underground electrical / cable tray versus storm, waste and drainage routing';
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
    const selectedSeverity = weighted(severities, severity);
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
  'Mechanical rooms': 'Coordinate equipment access and mechanical / fire / plumbing routes first; resolve underground plumbing against foundations early.',
  'Data halls': 'Review mechanical distribution against fire protection and primary structure; reserve electrical routes and service clearances.',
  'Electrical rooms': 'High electrical content drives routing and clearance clashes; most are medium or low severity rather than critical.',
  'Generator yards': 'Coordinate underground electrical, cable trays, storm / waste / drainage routes and foundation interfaces together.',
};
