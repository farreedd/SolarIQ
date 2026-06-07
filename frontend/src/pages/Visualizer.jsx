import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import SceneRoot from '../components/Scene/SceneRoot'
import { BUILDINGS } from '../utils/visualizerData'
import { useWindowSize } from '../hooks/useWindowSize'
import Icon from '../components/UI/Icon'

const STOPS = ['Qatar', 'Education City', 'Building']
const BUILDING_IDS = Object.keys(BUILDINGS)

// Sun elevation → relative output factor. At Qatar's latitude, output scales
// roughly with sin(elevation); clamped so the readout never reads zero at dusk.
function outputFactor(elevationDeg) {
  return Math.max(0.08, Math.sin((elevationDeg * Math.PI) / 180))
}

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
      background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
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
  background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 12,
  padding: '12px 14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
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
      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: accent || 'var(--text)' }}>
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
        fontSize="13" fontWeight="700" fontFamily="var(--font-mono)" style={{ fontVariantNumeric: 'tabular-nums' }}>
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

// Campus peak at sun elevation 90°, used by the merged bottom dock's estimate.
const BASE_PEAK_MW = 1.85

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
      }}><Icon name={icon} color={color} size={16} /></div>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color, textAlign: 'center' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>{value}</span>
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
      <span style={{ fontSize: 9, color: 'rgba(200,225,245,0.60)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

// ── Combined bottom dock: Conditions (slider) + Live Energy Flow ──────────────
// Merges the two formerly separate panels into one horizontal dock so the 3D
// canvas stays the dominant region on the Building / desktop view.
function BottomDock({ style, elevation, onElevation }) {
  const factor = outputFactor(elevation)
  const estOutput = (BASE_PEAK_MW * factor).toFixed(2)
  return (
    <div className="hud-panel" style={{ ...PANEL_BASE, ...style }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, flexWrap: 'nowrap' }}>

        {/* Conditions cluster */}
        <div style={{ flex: '1 1 190px', minWidth: 178 }}>
          <span style={LABEL_STYLE}>Current Conditions</span>
          <div style={{ marginBottom: 8 }}>
            <label
              htmlFor="sun-elevation"
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sun Elevation</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{elevation}°</span>
            </label>
            <input
              id="sun-elevation"
              type="range"
              min={0}
              max={90}
              step={1}
              value={elevation}
              onChange={(e) => onElevation(Number(e.target.value))}
              aria-label="Adjust sun elevation in degrees"
              className="sun-slider"
              style={{ '--pct': `${(elevation / 90) * 100}%` }}
            />
          </div>
          <StatRow label={`Est. Output at ${elevation}°`} value={`${estOutput} MW`} accent="#22d3ee" />
          <StatRow label="Inverter Load" value="87%" />
          <StatRow label="Temperature" value="38 °C" />
        </div>

        {/* Vertical divider */}
        <div aria-hidden="true" style={{ width: 1, background: 'rgba(14,165,233,0.12)', alignSelf: 'stretch' }} />

        {/* Energy-flow cluster */}
        <div style={{ flex: '1.6 1 300px', minWidth: 262 }}>
          <span style={LABEL_STYLE}>Live Energy Flow</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 8 }}>
            <FlowNode label="SOLAR" value="1.85 MW" color="#f59e0b" icon="sun" />
            <FlowArrow value="1.62 MW →" />
            <FlowNode label="CAMPUS" value="1.62 MW" color="#0ea5e9" icon="landmark" />
            <FlowArrow value="0.23 MW →" />
            <FlowNode label="GRID" value="0.23 MW" color="#22d3ee" icon="zap" />
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 120px' }}>
              <StatRow label="Self-Consumption" value="87.5%" accent="#22d3ee" />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <StatRow label="CO₂ Saved Today" value="910 kg" accent="#f59e0b" />
            </div>
          </div>
        </div>
      </div>
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
        <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em', marginBottom: 2 }}>
          25.3138° N
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>
          51.4240° E
        </div>
        <div style={{ fontSize: 9, color: 'rgba(200,225,245,0.60)', marginTop: 5 }}>
          Alt: <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>32 m</span> · UTC+3
        </div>
      </div>
    </div>
  )
}

// ── PV-type / status legend (text + swatch, not colour-only) ──────────────────
const PV_LEGEND = [
  { label: 'Rooftop', color: '#0ea5e9' },
  { label: 'Facade',  color: '#6366f1' },
  { label: 'Canopy',  color: '#f59e0b' },
]

// Keyboard-operable building selector with the PV-mounting legend merged in
// (was two separate panels). Lives in the left column flow.
function BuildingsPanel({ selectedId, stop, onSelect, onCycle, style }) {
  return (
    <div
      role="group"
      aria-label="Select campus building"
      className="hud-panel"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); onCycle(1) }
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); onCycle(-1) }
      }}
      style={{ ...PANEL_BASE, ...style }}
    >
      <span style={LABEL_STYLE}>Buildings</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {BUILDING_IDS.map(id => {
          const b = BUILDINGS[id]
          const active = selectedId === id && stop === 'Building'
          const pvColor = PV_BADGE_COLOR[b.pvType] || '#0ea5e9'
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              aria-pressed={active}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8,
                cursor: 'pointer', textAlign: 'left',
                border: active ? '1px solid rgba(14,165,233,0.45)' : '1px solid transparent',
                background: active ? 'rgba(14,165,233,0.12)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: pvColor }} />
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', minWidth: 26 }}>{id}</span>
              <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{b.name}</span>
            </button>
          )
        })}
      </div>
      {/* PV mounting legend, merged here (was a separate panel) */}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(14,165,233,0.10)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {PV_LEGEND.map(item => (
          <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 2, flexShrink: 0, background: item.color, boxShadow: `0 0 5px ${item.color}88` }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── First-load control hint (dismissible + re-summonable) ─────────────────────
function ControlHint({ onDismiss, mobile }) {
  // On touch, "drag/scroll" read as touch gestures and the hint must clear the
  // bottom toolbar; it sits higher and the close target grows to 44px.
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      style={{
        position: 'absolute', bottom: mobile ? 84 : 24, left: '50%',
        transform: 'translateX(-50%)', zIndex: 11,
        maxWidth: 'calc(100% - 24px)',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.62)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 999, padding: mobile ? '6px 6px 6px 16px' : '8px 8px 8px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14)',
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        {mobile ? (
          <>
            <strong style={{ color: 'var(--text)' }}>Drag</strong> to orbit
            <span style={{ color: 'var(--text-dim)' }}> · </span>
            <strong style={{ color: 'var(--text)' }}>Pinch</strong> to zoom
            <span style={{ color: 'var(--text-dim)' }}> · </span>
            <strong style={{ color: 'var(--text)' }}>Tap</strong> a building
          </>
        ) : (
          <>
            <strong style={{ color: 'var(--text)' }}>Drag</strong> to orbit
            <span style={{ color: 'var(--text-dim)' }}> · </span>
            <strong style={{ color: 'var(--text)' }}>Scroll</strong> to zoom
            <span style={{ color: 'var(--text-dim)' }}> · </span>
            <strong style={{ color: 'var(--text)' }}>Click</strong> a building
          </>
        )}
      </span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss controls hint"
        style={{
          width: mobile ? 44 : 28, height: mobile ? 44 : 28, borderRadius: '50%', flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(14,165,233,0.10)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <Icon name="x" size={mobile ? 16 : 13} color="currentColor" />
      </button>
    </motion.div>
  )
}

// ── Visualizer page ───────────────────────────────────────────────────────────
export default function Visualizer() {
  const [stop, setStop] = useState('Education City')
  const [selectedId, setSelectedId] = useState('B01')
  const [heading, setHeading] = useState(0)
  const [elevation, setElevation] = useState(62)
  const [fitNonce, setFitNonce] = useState(0)
  const [webglStatus, setWebglStatus] = useState('loading') // 'loading' | 'live' | 'failed'
  const [hintDismissed, setHintDismissed] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false) // mobile bottom sheet (HUD panels)
  const [hudHidden, setHudHidden] = useState(false) // desktop focus mode: clear the HUD so the 3D model is unobstructed

  const prefersReduced = useReducedMotion()
  const { width } = useWindowSize()
  const isMobile = width <= 900

  const handleHeadingChange = useCallback((deg) => setHeading(deg), [])
  const handleReady = useCallback(() => setWebglStatus('live'), [])
  const handleError = useCallback(() => setWebglStatus('failed'), [])

  const handleSelectBuilding = useCallback((id) => {
    setSelectedId(id)
    setStop('Building')
  }, [])

  // Persistent re-center / fit-view: bump nonce → CameraRig replays current stop.
  const handleRecenter = useCallback(() => setFitNonce((n) => n + 1), [])

  // Keyboard: ← / → cycle buildings while the selector toolbar has focus.
  const cycleBuilding = useCallback((dir) => {
    setSelectedId((cur) => {
      const i = BUILDING_IDS.indexOf(cur)
      const next = BUILDING_IDS[(i + dir + BUILDING_IDS.length) % BUILDING_IDS.length]
      return next
    })
    setStop('Building')
  }, [])

  // Selected-building summary, spoken via aria-live for screen-reader users.
  const selectedSummary = useMemo(() => {
    const b = BUILDINGS[selectedId]
    if (!b) return ''
    return `Selected building ${selectedId}, ${b.name}. ` +
      `Capacity ${b.size} kilowatts peak. ${b.pvType} mounted. ` +
      `Status ${b.status}. Today's output ${b.output} kilowatt hours. ` +
      `Efficiency ${b.efficiency} percent.`
  }, [selectedId])

  const webglChip = {
    loading: { label: 'Initializing…', color: '#7ea8c9', dot: '#7ea8c9' },
    live:    { label: 'WebGL Live',    color: '#22d3ee', dot: '#22d3ee' },
    failed:  { label: 'WebGL Off',     color: '#f59e0b', dot: '#f59e0b' },
  }[webglStatus]

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
        <SceneRoot
          stop={stop}
          selectedId={selectedId}
          onSelectBuilding={handleSelectBuilding}
          onHeadingChange={handleHeadingChange}
          onReady={handleReady}
          onError={handleError}
          fitNonce={fitNonce}
          reducedMotion={!!prefersReduced}
          lowPower={isMobile}
        />
      </div>

      {/* Screen-reader live region: the selected building's data as text.
          The 3D meshes are pointer-only, so this is the non-mouse data path. */}
      <div
        aria-live="polite"
        style={{
          position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
          overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
        }}
      >
        {selectedSummary}
      </div>

      {/* ── Top-center toolbar ── */}
      <div style={{
        position: 'absolute', top: 16, left: '50%',
        transform: 'translateX(-50%)',
        width: 'max-content',  // avoid the left:50% shrink-to-fit cap that wraps the pills on narrower desktops
        zIndex: 10, display: 'flex', alignItems: 'center', gap: 4,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 999, padding: '5px 6px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
      }}>
        <div role="group" aria-label="Camera zoom level" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {STOPS.map(s => (
            <button
              key={s}
              onClick={() => setStop(s)}
              aria-pressed={stop === s}
              style={{
                position: 'relative',
                padding: isMobile ? '9px 14px' : '5px 14px',
                minHeight: isMobile ? 44 : undefined,
                borderRadius: 999,
                border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: stop === s ? 600 : 500,
                fontFamily: 'var(--font-body)',
                transition: 'all 0.18s ease',
                background: stop === s ? 'var(--primary)' : 'transparent',
                color: stop === s ? '#fff' : 'var(--text-muted)',
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

        {/* Divider */}
        <span aria-hidden="true" style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />

        {/* Re-center / fit-view — persistent */}
        <button
          onClick={handleRecenter}
          aria-label="Re-center view"
          title="Re-center view"
          style={{
            minWidth: isMobile ? 44 : 34, height: isMobile ? 44 : 34,
            padding: isMobile ? 0 : '0 10px', borderRadius: 999,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: 'transparent', color: 'var(--text-muted)',
            fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(14,165,233,0.12)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <Icon name="refresh-cw" size={13} color="currentColor" />
          {!isMobile && <span style={{ fontSize: 12 }}>Re-center</span>}
        </button>

        {/* Focus mode — hide/show the HUD panels so the 3D model is unobstructed (desktop) */}
        {!isMobile && (
          <button
            onClick={() => setHudHidden((v) => !v)}
            aria-pressed={hudHidden}
            aria-label={hudHidden ? 'Show panels' : 'Hide panels for an unobstructed 3D view'}
            title={hudHidden ? 'Show panels' : 'Focus the 3D (hide panels)'}
            style={{
              minWidth: 34, height: 34, padding: '0 10px', borderRadius: 999,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: hudHidden ? 'rgba(14,165,233,0.18)' : 'transparent',
              color: hudHidden ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => { if (!hudHidden) { e.currentTarget.style.background = 'rgba(14,165,233,0.12)'; e.currentTarget.style.color = 'var(--text)' } }}
            onMouseLeave={(e) => { if (!hudHidden) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
          >
            {hudHidden ? (
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* ── WebGL status chip (real state) ── */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(13,31,56,0.55)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 999, padding: '5px 12px',
        }}
      >
        <span aria-hidden="true" style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: webglChip.dot,
          boxShadow: webglStatus === 'live' ? `0 0 6px ${webglChip.dot}` : 'none',
        }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: webglChip.color, fontFamily: 'var(--font-body)' }}>
          {webglChip.label}
        </span>
      </div>

      {/* ── Breadcrumb + HUD columns ── */}
      {!isMobile && <Breadcrumb stop={stop} selectedId={selectedId} />}

      {/* ─────────────────────────────────────────────────────────────────────────
          DESKTOP HUD (> 900px): floating glass columns + a single merged bottom
          dock. At the Building stop the simultaneous panels are kept to four
          (Buildings · QF Campus · Selected Building · merged dock) so the 3D
          canvas stays the dominant region.
         ───────────────────────────────────────────────────────────────────────── */}
      {!isMobile && !hudHidden && (
        <>
          {/* Left column — stacks with no overlap; the gaps stay draggable for the 3D */}
          <div style={{
            position: 'absolute', top: 16, left: 16, width: 248, zIndex: 6,
            display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none',
          }}>
            {stop === 'Qatar' && (
              <QatarSummaryPanel style={{ position: 'relative', width: '100%', pointerEvents: 'auto' }} />
            )}
            <BuildingsPanel
              style={{ position: 'relative', width: '100%', pointerEvents: 'auto' }}
              selectedId={selectedId}
              stop={stop}
              onSelect={handleSelectBuilding}
              onCycle={cycleBuilding}
            />
          </div>

          {/* Right column */}
          <div style={{
            position: 'absolute', top: 56, right: 16, width: 232, zIndex: 6,
            display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none',
          }}>
            <QFCampusPanel style={{ position: 'relative', width: '100%', pointerEvents: 'auto' }} />
            <SelectedBuildingPanel style={{ position: 'relative', width: '100%', pointerEvents: 'auto' }} selectedId={selectedId} />
          </div>

          {/* Merged bottom dock (Conditions + Live Energy Flow) */}
          <BottomDock
            style={{ bottom: 24, left: 16, right: 268, maxWidth: 620 }}
            elevation={elevation}
            onElevation={setElevation}
          />
          <CompassPanel style={{ bottom: 24, right: 16 }} heading={heading} />
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          MOBILE HUD (<= 900px): no fixed multi-column overlap. A compact bottom
          toolbar shows the current selection; a "Details" toggle opens a single
          scrollable bottom sheet with the stop-relevant panels.
         ───────────────────────────────────────────────────────────────────────── */}
      {isMobile && (
        <>
          {/* Compact bottom toolbar */}
          <div style={{
            ...PANEL_BASE,
            bottom: 16, left: 12, right: 12, top: 'auto', zIndex: 8,
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.80)' }}>
                {stop === 'Building'
                  ? `${selectedId} · ${BUILDINGS[selectedId]?.name ?? ''}`
                  : stop}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                {stop === 'Building'
                  ? `${BUILDINGS[selectedId]?.output ?? '—'} kWh today · ${BUILDINGS[selectedId]?.efficiency ?? '—'}% eff.`
                  : 'Campus 2,373 kWh · 1.85 MW peak'}
              </div>
            </div>
            <button
              onClick={() => setSheetOpen(true)}
              aria-expanded={sheetOpen}
              aria-controls="visualizer-sheet"
              style={{
                flexShrink: 0, minHeight: 44, padding: '0 16px', borderRadius: 999,
                border: '1px solid rgba(14,165,233,0.45)', cursor: 'pointer',
                background: 'rgba(14,165,233,0.14)', color: 'var(--text)',
                fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Details
            </button>
          </div>

          {/* Bottom sheet with the stop-relevant panels */}
          <AnimatePresence>
            {sheetOpen && (
              <>
                <motion.div
                  key="sheet-backdrop"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSheetOpen(false)}
                  style={{ position: 'absolute', inset: 0, zIndex: 12, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
                />
                <motion.div
                  key="sheet"
                  id="visualizer-sheet"
                  role="dialog"
                  aria-label="Scene details"
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={prefersReduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 34 }}
                  style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 13,
                    maxHeight: '78%', overflowY: 'auto',
                    padding: '8px 12px 20px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)), rgba(8,20,38,0.92)',
                    backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderTop: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '18px 18px 0 0',
                    boxShadow: '0 -12px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Header + close — sticky so the close target stays reachable while scrolling */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 8, position: 'sticky', top: 0, zIndex: 1,
                    padding: '4px 0', background: 'rgba(8,20,38,0.92)',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.80)' }}>
                      Details
                    </span>
                    <button
                      onClick={() => setSheetOpen(false)}
                      aria-label="Close details"
                      style={{
                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(14,165,233,0.10)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Icon name="x" size={16} color="currentColor" />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {stop === 'Qatar' && (
                      <QatarSummaryPanel style={{ position: 'relative', width: '100%' }} />
                    )}
                    <SelectedBuildingPanel style={{ position: 'relative', width: '100%' }} selectedId={selectedId} />
                    <BuildingsPanel
                      style={{ position: 'relative', width: '100%' }}
                      selectedId={selectedId}
                      stop={stop}
                      onSelect={(id) => { handleSelectBuilding(id); setSheetOpen(false) }}
                      onCycle={cycleBuilding}
                    />
                    <BottomDock
                      style={{ position: 'relative', width: '100%' }}
                      elevation={elevation}
                      onElevation={setElevation}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* First-load control discoverability hint (dismissible) */}
      <AnimatePresence>
        {!hintDismissed && webglStatus !== 'failed' && (
          <ControlHint key="control-hint" onDismiss={() => setHintDismissed(true)} mobile={isMobile} />
        )}
      </AnimatePresence>

      <style>{`
        /* Sun-elevation range input — themed to the glass HUD. 44px-tall hit area. */
        .sun-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 22px; margin: 0; background: transparent; cursor: pointer;
        }
        .sun-slider:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; border-radius: 4px; }
        .sun-slider::-webkit-slider-runnable-track {
          height: 4px; border-radius: 2px;
          background: linear-gradient(90deg, #0ea5e9, #f59e0b var(--pct, 70%), rgba(14,165,233,0.12) var(--pct, 70%));
        }
        .sun-slider::-moz-range-track {
          height: 4px; border-radius: 2px; background: rgba(14,165,233,0.12);
        }
        .sun-slider::-moz-range-progress {
          height: 4px; border-radius: 2px; background: linear-gradient(90deg, #0ea5e9, #f59e0b);
        }
        .sun-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; margin-top: -5px; border-radius: 50%;
          background: #f59e0b; border: 2px solid #050d1a;
          box-shadow: 0 0 8px rgba(245,158,11,0.7);
        }
        .sun-slider::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #f59e0b; border: 2px solid #050d1a;
          box-shadow: 0 0 8px rgba(245,158,11,0.7);
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
