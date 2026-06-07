// ── Buildings ─────────────────────────────────────────────────────────────────
export const BUILDINGS = {
  B01: { name: 'Research Complex',  size: 500, output:  872, efficiency: 18.6, status: 'Active',      pvType: 'rooftop' },
  B02: { name: 'Admin Tower',       size: 320, output:  561, efficiency: 17.8, status: 'Active',      pvType: 'facade'  },
  B03: { name: 'Lab Block',         size: 280, output:  449, efficiency: 16.2, status: 'Maintenance', pvType: 'rooftop' },
  B04: { name: 'Parking Structure', size: 750, output: 1243, efficiency: 19.1, status: 'Active',      pvType: 'canopy'  },
  B05: { name: 'QF Auditorium',     size: 150, output:  248, efficiency: 18.0, status: 'Active',      pvType: 'rooftop' },
}

// ── Building 3D geometry ──────────────────────────────────────────────────────
// position [x, y, z] (y=0 ground level); mesh centres at height/2
export const BUILDING_GEOMETRY = {
  B04: { position: [-8,  0, -9], footprint: [12, 8], height: 2   },
  B01: { position: [-3,  0,  1], footprint: [8,  6], height: 5   },
  B02: { position: [ 7,  0, -1], footprint: [4,  4], height: 9   },
  B03: { position: [ 5,  0,  8], footprint: [7,  5], height: 4   },
  B05: { position: [-8,  0,  8], footprint: [5,  5], height: 3.5 },
}

// ── Qatar peninsula outline ───────────────────────────────────────────────────
// Rotation [-π/2, 0, 0] maps shape(x,y) → world(x, 0, -y). Clockwise from SW.
export const QATAR_SHAPE_PTS = [
  [-35,  70],  // SW (Saudi border, west)
  [-35,  25],  // west coast lower
  [-37, -13],  // west coast mid
  [-32, -50],  // west coast upper
  [-25, -80],  // NW peninsula base
  [-10,-100],  // NW tip
  [  5,-107],  // northernmost point
  [ 20, -97],  // NE
  [ 32, -62],  // east coast upper
  [ 35, -20],  // east coast mid
  [ 32,  30],  // east coast lower
  [ 20,  65],  // SE
  [  0,  75],  // south (Saudi border east)
]

// Education City marker — world position
export const EC_MARKER_POS = [20, 0, -12]

// ── Qatar landmarks (world-space positions) ───────────────────────────────────
// The Qatar stop views the peninsula from the +z (north) side, so a marker's
// screen-vertical order is the reverse of its real north→south order. The labels
// below are assigned in flipped order against the position slots so the map reads
// correctly top→bottom (Lusail/north at top → Hamad airport/south at bottom). Only
// the label text is flipped; every marker keeps its original position and geometry.
export const QATAR_LANDMARKS = {
  doha:    { label: 'Aspire Tower',          type: 'cluster',  position: [28, 0,  20], count: 5, spread: 3.5, baseHeight: 5.5, heightVar: 3.5 },
  lusail:  { label: 'Hamad International',    type: 'cluster',  position: [23, 0,  50], count: 3, spread: 2.2, baseHeight: 5,   heightVar: 2.5 },
  pearl:   { label: 'QF · National Library', type: 'cluster',  position: [34, 0,  28], count: 3, spread: 1.4, baseHeight: 2.5, heightVar: 1.5, ring: true },
  aspire:  { label: 'Doha · West Bay',       type: 'cylinder', position: [18, 0,   3], height: 10, radius: 0.7 },
  mia:     { label: 'Museum of Islamic Art', type: 'angled', position: [32, 0,  15], size: [2.4, 2.4, 2.4] },
  qnl:     { label: 'The Pearl',             type: 'slab',  position: [22, 0, -10], size: [4, 1.3, 3] },
  airport: { label: 'Lusail',                type: 'strip', position: [28, 0, -25], size: [7, 0.6, 2.8] },
}

// ── Camera stops ──────────────────────────────────────────────────────────────
export const CAMERA_STOPS = {
  'Qatar':          { position: [0, 140, 130], target: [0, 0, 0] },
  'Education City': { position: [12, 10,  18], target: [0, 0, 0] },
  'Building':       { position: [ 8,  6,  10], target: [0, 2, 0] },
}
