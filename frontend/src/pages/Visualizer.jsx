import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import SceneRoot from '../components/Scene/SceneRoot'
import { BUILDINGS } from '../utils/visualizerData'

const STOPS = ['Qatar', 'Education City', 'Building']

function Breadcrumb({ stop, selectedId }) {
  const segments = {
    'Qatar':          [{ label: 'Qatar Peninsula', active: true }, { label: 'National Overview', active: false }],
    'Education City': [{ label: 'Qatar', active: false }, { label: 'Education City', active: true }, { label: 'QF Campus', active: false }],
    'Building':       [{ label: 'Qatar', active: false }, { label: 'Education City', active: false }, { label: `${selectedId} · ${BUILDINGS[selectedId]?.name ?? ''}`, active: true }],
  }
  const crumbs = segments[stop] ?? []
  return (
    <div style={{
      position: 'absolute', top: 58, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'rgba(5,13,26,0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(14,165,233,0.14)',
      borderRadius: 999,
      padding: '4px 14px',
      pointerEvents: 'none',
      transition: 'opacity 0.15s ease',
    }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && (
            <span style={{ fontSize: 9, color: 'rgba(14,165,233,0.40)', userSelect: 'none' }}>›</span>
          )}
          <span style={{
            fontSize: 10,
            fontWeight: c.active ? 700 : 400,
            letterSpacing: c.active ? '0.06em' : '0.03em',
            color: c.active ? 'var(--primary)' : 'rgba(200,225,245,0.45)',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}>
            {c.label}
          </span>
        </span>
      ))}
    </div>
  )
}

const PANEL_BASE = {
  position: 'absolute',
  zIndex: 6,
  background: 'rgba(10,25,41,0.78)',
  backdropFilter: 'blur(18px) saturate(140%)',
  WebkitBackdropFilter: 'blur(18px) saturate(140%)',
  border: '1px solid rgba(14,165,233,0.22)',
  borderRadius: 12,
  padding: '12px 14px',
  boxShadow: '0 10px 32px rgba(0,0,0,0.45)',
}

const LABEL_STYLE = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(14,165,233,0.80)',
  display: 'block',
  marginBottom: 8,
}

const DIVIDER = (
  <div style={{ width: '100%', height: 1, background: 'rgba(14,165,233,0.10)', borderRadius: 2, margin: '8px 0' }} />
)

function StatRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
      <span style={{ fontSize: 10, color: 'rgba(200,225,245,0.80)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', color: accent || 'var(--text)' }}>
        {value}
      </span>
    </div>
  )
}

// ── Qatar Solar Overview ──────────────────────────────────────────────────────
function QatarSummaryPanel({ style }) {
  return (
    <div className="hud-panel" style={{ ...PANEL_BASE, ...style }}>
      <span style={LABEL_STYLE}>Qatar Solar Overview</span>
      {DIVIDER}
      <StatRow label="National Installed" value="875 MWp" accent="#0ea5e9" />
      <StatRow label="Today's Output" value="6,240 MWh" accent="#22d3ee" />
      <StatRow label="Grid Share" value="22%" accent="#f59e0b" />
      {DIVIDER}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['KAHRAMAA', 'IRENA', 'QEERI'].map(tag => (
          <span key={tag} style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.08em',
            padding: '2px 7px', borderRadius: 999,
            border: '1px solid rgba(14,165,233,0.28)',
            color: 'rgba(200,225,245,0.65)',
          }}>{tag}</span>
        ))}
      </div>
    </div>
  )
}

// ── QF Campus Efficiency ──────────────────────────────────────────────────────
function ArcGauge({ pct, size = 80 }) {
  const r = 30
  const cx = size / 2
  const cy = size / 2
  const circ = Math.PI * r  // half-circle
  const filled = circ * (pct / 100)
  return (
    <svg width={size} height={size / 2 + 10} style={{ overflow: 'visible', display: 'block', margin: '0 auto 6px' }}>
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(14,165,233,0.12)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
        style={{ filter: 'drop-shadow(0 0 4px rgba(14,165,233,0.6))' }}
      />
      {/* Value */}
      <text x={cx} y={cy + 2} textAnchor="middle" fill="#f0f9ff"
        fontSize="13" fontWeight="700" fontFamily="'Syne', sans-serif">
        {pct}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(200,225,245,0.65)"
        fontSize="8" fontFamily="'DM Sans', sans-serif" letterSpacing="0.08em">
        EFFICIENCY
      </text>
    </svg>
  )
}

function QFCampusPanel({ style }) {
  return (
    <div className="hud-panel" style={{ ...PANEL_BASE, ...style }}>
      <span style={LABEL_STYLE}>QF Campus Efficiency</span>
      {DIVIDER}
      <ArcGauge pct={84} />
      <StatRow label="Active Systems" value="4 / 5" />
      <StatRow label="Campus Output" value="2,373 kWh" accent="#22d3ee" />
      <StatRow label="Peak Power" value="1.85 MW" accent="#f59e0b" />
    </div>
  )
}

// ── Selected Building ─────────────────────────────────────────────────────────
const PV_BADGE_COLOR = { rooftop: '#0ea5e9', facade: '#6366f1', canopy: '#f59e0b' }
const STATUS_COLOR   = { Active: '#22d3ee', Maintenance: '#f59e0b', Offline: '#ef4444' }

function SelectedBuildingPanel({ selectedId, style }) {
  const bld = BUILDINGS[selectedId]
  if (!bld) return null
  const pvColor  = PV_BADGE_COLOR[bld.pvType]  || '#0ea5e9'
  const stColor  = STATUS_COLOR[bld.status]     || '#22d3ee'
  return (
    <div className="hud-panel" style={{ ...PANEL_BASE, ...style }}>
      <span style={LABEL_STYLE}>Selected Building</span>
      {DIVIDER}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: 4 }}>
          {selectedId} · {bld.name}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
            padding: '2px 8px', borderRadius: 999,
            border: `1px solid ${pvColor}55`,
            color: pvColor, background: `${pvColor}18`,
          }}>{bld.pvType.toUpperCase()}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
            padding: '2px 8px', borderRadius: 999,
            border: `1px solid ${stColor}55`,
            color: stColor, background: `${stColor}18`,
          }}>{bld.status.toUpperCase()}</span>
        </div>
      </div>
      {DIVIDER}
      <StatRow label="Capacity" value={`${bld.size} kWp`} />
      <StatRow label="Today's Output" value={`${bld.output} kWh`} accent="#22d3ee" />
      <StatRow label="Efficiency" value={`${bld.efficiency}%`} accent="#0ea5e9" />
    </div>
  )
}

// ── Simulation Controls ───────────────────────────────────────────────────────
function SimControlsPanel({ style }) {
  const rows = [
    { label: 'Tracking Mode', value: 'Fixed Tilt', active: true },
    { label: 'Inverter Load', value: '87%', active: true },
    { label: 'Shading Loss', value: '2.1%', active: false },
    { label: 'Temperature', value: '38 °C', active: false },
  ]
  return (
    <div className="hud-panel" style={{ ...PANEL_BASE, ...style }}>
      <span style={LABEL_STYLE}>Simulation Controls</span>
      {DIVIDER}

      {/* Sun elevation slider */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: 'rgba(200,225,245,0.80)' }}>Sun Elevation</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>62°</span>
        </div>
        <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'rgba(14,165,233,0.12)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '70%', borderRadius: 2, background: 'linear-gradient(90deg, #0ea5e9, #f59e0b)' }} />
          <div style={{ position: 'absolute', left: '70%', top: '50%', transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.7)' }} />
        </div>
      </div>

      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: 'rgba(200,225,245,0.80)' }}>{r.label}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: r.active ? 'var(--text)' : 'rgba(200,225,245,0.50)' }}>{r.value}</span>
        </div>
      ))}

      {DIVIDER}
      <button style={{
        width: '100%', padding: '6px 0', borderRadius: 6,
        border: '1px solid rgba(14,165,233,0.35)',
        background: 'rgba(14,165,233,0.10)', cursor: 'pointer',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
        color: 'var(--primary)', fontFamily: 'var(--font-body)',
        transition: 'all 0.18s ease',
      }}>▶ RUN SIMULATION</button>
    </div>
  )
}

// ── Live Energy Flow ──────────────────────────────────────────────────────────
function FlowNode({ label, value, color, icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}18`,
        border: `1px solid ${color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
        boxShadow: `0 0 12px ${color}33`,
      }}>{icon}</div>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color, textAlign: 'center' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function FlowArrow({ value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
      <div style={{
        width: '100%', height: 2,
        background: 'linear-gradient(90deg, rgba(14,165,233,0.6), rgba(14,165,233,0.15))',
        position: 'relative', overflow: 'hidden', borderRadius: 1,
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '-60%',
          width: '60%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.9), transparent)',
          animation: 'flowPulse 1.6s linear infinite',
        }} />
      </div>
      <span style={{ fontSize: 9, color: 'rgba(200,225,245,0.60)', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}

function EnergyFlowPanel({ style }) {
  return (
    <div className="hud-panel" style={{ ...PANEL_BASE, ...style }}>
      <span style={LABEL_STYLE}>Live Energy Flow</span>
      {DIVIDER}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <FlowNode label="SOLAR" value="1.85 MW" color="#f59e0b" icon="☀️" />
        <FlowArrow value="1.62 MW →" />
        <FlowNode label="CAMPUS" value="1.62 MW" color="#0ea5e9" icon="🏛️" />
        <FlowArrow value="0.23 MW →" />
        <FlowNode label="GRID" value="0.23 MW" color="#22d3ee" icon="⚡" />
      </div>
      {DIVIDER}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <StatRow label="Self-Consumption" value="87.5%" accent="#22d3ee" />
      </div>
      <StatRow label="CO₂ Saved Today" value="910 kg" accent="#f59e0b" />
    </div>
  )
}

// ── Compass + Coordinates ─────────────────────────────────────────────────────
function CompassPanel({ style, heading }) {
  // heading: camera azimuth in degrees. Rotate rose by -heading so N stays at true north.
  const rotation = -heading
  return (
    <div className="hud-panel" style={{ ...PANEL_BASE, ...style, display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* Compass rose */}
      <svg width={52} height={52} viewBox="0 0 52 52" style={{ overflow: 'visible' }}>
        {/* Fixed outer ring */}
        <circle cx={26} cy={26} r={24} fill="none" stroke="rgba(14,165,233,0.18)" strokeWidth={1.2} />
        {/* Rotating rose group */}
        <g transform={`rotate(${rotation}, 26, 26)`} style={{ transition: 'transform 0.08s linear' }}>
          {/* Tick marks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
            const rad = (deg - 90) * Math.PI / 180
            const r1 = 20, r2 = 24
            return (
              <line key={deg}
                x1={26 + r1 * Math.cos(rad)} y1={26 + r1 * Math.sin(rad)}
                x2={26 + r2 * Math.cos(rad)} y2={26 + r2 * Math.sin(rad)}
                stroke="rgba(14,165,233,0.35)" strokeWidth={deg % 90 === 0 ? 1.5 : 0.8}
              />
            )
          })}
          {/* North needle (amber) */}
          <polygon
            points="26,6 23,26 26,22 29,26"
            fill="#f59e0b"
            style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.7))' }}
          />
          {/* South needle */}
          <polygon points="26,46 23,26 26,30 29,26" fill="rgba(14,165,233,0.35)" />
          {/* Cardinal labels */}
          <text x={26} y={5}  textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="700">N</text>
          <text x={26} y={51} textAnchor="middle" fill="rgba(200,225,245,0.60)" fontSize="7">S</text>
          <text x={50} y={28} textAnchor="middle" fill="rgba(200,225,245,0.60)" fontSize="7">E</text>
          <text x={2}  y={28} textAnchor="middle" fill="rgba(200,225,245,0.60)" fontSize="7">W</text>
        </g>
        {/* Fixed centre dot */}
        <circle cx={26} cy={26} r={2.5} fill="rgba(14,165,233,0.6)" />
      </svg>

      {/* Coordinates */}
      <div>
        <div style={{ fontSize: 9, color: 'rgba(14,165,233,0.80)', letterSpacing: '0.10em', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase' }}>Education City · QF</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em', marginBottom: 2 }}>
          25.3138° N
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>
          51.4240° E
        </div>
        <div style={{ fontSize: 9, color: 'rgba(200,225,245,0.60)', marginTop: 5 }}>Alt: 32 m · UTC+3</div>
      </div>
    </div>
  )
}

// ── Visualizer page ───────────────────────────────────────────────────────────
export default function Visualizer() {
  const [stop, setStop] = useState('Education City')
  const [selectedId, setSelectedId] = useState('B01')
  const [heading, setHeading] = useState(0)

  const handleHeadingChange = useCallback((deg) => setHeading(deg), [])

  function handleSelectBuilding(id) {
    setSelectedId(id)
    setStop('Building')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    >
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 55% 35%, #0b2040 0%, #050d1a 65%)',
    }}>

      {/* Aurora blob — blue */}
      <div style={{
        position: 'absolute', zIndex: 1, pointerEvents: 'none',
        width: 600, height: 600, borderRadius: '50%',
        top: '-140px', left: '18%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.13) 0%, transparent 70%)',
        filter: 'blur(48px)',
      }} />

      {/* Aurora blob — amber */}
      <div style={{
        position: 'absolute', zIndex: 1, pointerEvents: 'none',
        width: 420, height: 420, borderRadius: '50%',
        bottom: '8%', right: '12%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 70%)',
        filter: 'blur(48px)',
      }} />

      {/* CSS grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: [
          'linear-gradient(rgba(14,165,233,0.045) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(14,165,233,0.045) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '44px 44px',
      }} />

      {/* Horizon fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 140, zIndex: 5, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, transparent, #050d1a)',
      }} />

      {/* R3F Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <SceneRoot stop={stop} selectedId={selectedId} onSelectBuilding={handleSelectBuilding} onHeadingChange={handleHeadingChange} />
      </div>

      {/* ── Top-center toolbar ── */}
      <div style={{
        position: 'absolute', top: 16, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10, display: 'flex', alignItems: 'center', gap: 4,
        background: 'rgba(10,25,41,0.78)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(14,165,233,0.22)',
        borderRadius: 999, padding: '5px 6px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}>
        {STOPS.map(s => (
          <button
            key={s}
            onClick={() => setStop(s)}
            style={{
              position: 'relative',
              padding: '5px 14px', borderRadius: 999,
              border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: stop === s ? 600 : 500,
              fontFamily: 'var(--font-body)',
              transition: 'all 0.18s ease',
              background: stop === s ? 'var(--primary)' : 'transparent',
              color: stop === s ? '#fff' : 'rgba(200,225,245,0.55)',
              boxShadow: stop === s ? '0 0 14px rgba(14,165,233,0.45)' : 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {stop === s && (
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(255,255,255,0.85)',
                boxShadow: '0 0 6px rgba(255,255,255,0.6)',
                animation: 'pillDot 2s ease-in-out infinite',
                flexShrink: 0,
              }} />
            )}
            {s}
          </button>
        ))}

      </div>

      {/* ── Breadcrumb + HUD panels ── */}
      <Breadcrumb stop={stop} selectedId={selectedId} />
      <QatarSummaryPanel     style={{ top: 16,    left: 16,                  width: 260 }} />
      <QFCampusPanel         style={{ top: 16,    right: 16,                 width: 200 }} />
      <SelectedBuildingPanel style={{ top: '50%', right: 16, width: 240, transform: 'translateY(-50%)' }} selectedId={selectedId} />
      <SimControlsPanel      style={{ bottom: 80, left: 16,                  width: 260 }} />
      <EnergyFlowPanel       style={{ bottom: 80, right: 16,                 width: 340 }} />
      <CompassPanel          style={{ bottom: 80, left: '50%', transform: 'translateX(-50%)' }} heading={heading} />

      <style>{`
        .hud-panel { position: relative; }
        .hud-panel::before,
        .hud-panel::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          border: 1.5px solid rgba(14,165,233,0.50);
        }
        .hud-panel::before {
          top: -1px; left: -1px;
          border-right: none; border-bottom: none;
          border-radius: 12px 0 0 0;
        }
        .hud-panel::after {
          bottom: -1px; right: -1px;
          border-left: none; border-top: none;
          border-radius: 0 0 12px 0;
        }
        @keyframes flowPulse {
          0%   { left: -60%; }
          100% { left: 120%; }
        }
        @keyframes pillDot {
          0%, 100% { opacity: 1;    transform: scale(1);    }
          50%       { opacity: 0.5; transform: scale(0.65); }
        }
      `}</style>
    </div>
    </motion.div>
  )
}
