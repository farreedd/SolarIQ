import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useSolarData } from '../hooks/useSolarData'
import { useDemoMode } from '../hooks/useDemoMode'
import ErrorCard from '../components/UI/ErrorCard'
import LoadingSkeleton from '../components/UI/LoadingSkeleton'
import Icon from '../components/UI/Icon'

// ── Shared liquid-glass recipe (matches --glass-* tokens / .glass-card) ─────
// Supporting widgets get a quieter recipe: thinner border, softer shadow.
const SUPPORT_GLASS = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 4px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)',
  borderRadius: 14,
}

// ── 3.2a KPI Data ──────────────────────────────────────────────────────────
// Base (today) values; the time-range control re-derives display values.
const KPI_CARDS = [
  {
    key: 'capacity',
    label: 'Total Campus Capacity',
    base: 1450,
    unit: 'kWp',
    color: 'var(--primary)',
    subtitle: 'All buildings combined',
    scales: false, // fixed nameplate capacity — never scales with range
    pulse: false,
  },
  {
    key: 'generation',
    label: 'Energy Generated',
    base: 2380,
    unit: 'kWh',
    color: 'var(--success)',
    // Single freshness source is the global "updated Ns ago" ticker above the
    // KPI strip; this stays just "Live" so there are no conflicting timestamps.
    subtitle: 'Live',
    scales: true,
    pulse: true,
  },
  {
    key: 'active',
    label: 'Active Systems',
    fixedValue: '5 of 5',
    unit: '',
    color: 'var(--positive)',
    subtitle: 'All buildings online',
    scales: false,
    pulse: false,
  },
  {
    key: 'co2',
    label: 'CO2 Saved',
    base: 1166,
    unit: 'kg',
    color: 'var(--accent)',
    subtitle: '~52 trees · offset',
    scales: true,
    pulse: false,
  },
]

// ── 3.2b Building Data ─────────────────────────────────────────────────────
const BUILDINGS = [
  // Evenly spread: four corners + a central hub (B04), so cards never bunch on one side.
  { id: 'B01', name: 'Research Complex',   cap: '500 kWp', kwh: 952,   eff: '94.2%', status: 'producing', top: '26%', left: '16%' },
  { id: 'B02', name: 'Admin Tower',        cap: '320 kWp', kwh: 608,   eff: '91.8%', status: 'peak',      top: '24%', left: '79%' },
  { id: 'B03', name: 'Lab Block',          cap: '280 kWp', kwh: 532,   eff: '89.5%', status: 'producing', top: '76%', left: '20%' },
  { id: 'B04', name: 'Parking Structure',  cap: '750 kWp', kwh: 1425,  eff: '96.1%', status: 'producing', top: '50%', left: '49%' },
  { id: 'B05', name: 'QF Auditorium',      cap: '150 kWp', kwh: 285,   eff: '88.3%', status: 'producing', top: '74%', left: '79%' },
]

// Connector network: each building links to the central hub (B04). Lines are drawn
// from the building positions, so they always connect the cards (a clean radial mesh).
const MAP_LINKS = [['B01', 'B04'], ['B02', 'B04'], ['B03', 'B04'], ['B05', 'B04']]
const NODE_POS = Object.fromEntries(BUILDINGS.map((b) => [b.id, { x: b.left, y: b.top }]))

const STATUS_COLOR = {
  producing: 'var(--positive)',
  peak: 'var(--accent)',
  offline: 'var(--text-dim)',
}
const STATUS_LABEL = {
  producing: 'Producing',
  peak: 'Peak output',
  offline: 'Offline',
}

// ── 3.2d Sparkline Data ────────────────────────────────────────────────────
const SYSTEM_ROWS = [
  { id: 'B01', name: 'Research Complex',  cap: '500 kWp', sparks: [60, 72, 68, 80, 75, 90, 82], kwh: 952,  eff: '94.2%', badge: 'Active' },
  { id: 'B02', name: 'Admin Tower',       cap: '320 kWp', sparks: [50, 55, 70, 85, 78, 95, 88], kwh: 608,  eff: '91.8%', badge: 'Peak'   },
  { id: 'B03', name: 'Lab Block',         cap: '280 kWp', sparks: [40, 48, 55, 60, 65, 58, 62], kwh: 532,  eff: '89.5%', badge: 'Active' },
  { id: 'B04', name: 'Parking Structure', cap: '750 kWp', sparks: [70, 75, 80, 88, 92, 95, 90], kwh: 1425, eff: '96.1%', badge: 'Active' },
  { id: 'B05', name: 'QF Auditorium',     cap: '150 kWp', sparks: [30, 35, 40, 42, 50, 45, 48], kwh: 285,  eff: '88.3%', badge: 'Active' },
]

// ── 3.2f Alert / Module / Weather Data ────────────────────────────────────
const ALERTS = [
  { icon: 'alert-triangle', color: 'var(--warning)', msg: 'Dust soiling detected on B01 panels', time: '14 min ago' },
  { icon: 'zap',            color: 'var(--success)', msg: 'Peak generation record set — B04',     time: '1 hr ago'   },
  { icon: 'wrench',         color: 'var(--primary)', msg: 'Scheduled maintenance B03 inverter',   time: '3 hr ago'   },
]

const MODULES = [
  { name: '3D Visualizer',    status: 'Online', color: 'var(--positive)' },
  { name: 'Analytics Engine', status: 'Online', color: 'var(--positive)' },
  { name: 'Training Center',  status: 'Online', color: 'var(--positive)' },
  { name: 'AI Insights',      status: 'Beta',   color: 'var(--accent)' },
]

const WEATHER_METRICS = [
  { label: 'GHI',       value: '985', unit: 'W/m²',     bar: 0.82 },
  { label: 'Wind',      value: '12',  unit: 'km/h NW',  bar: null },
  { label: 'UV Index',  value: '9',   unit: 'Very High', bar: 0.9 },
  { label: 'Sky',       value: 'Clear', unit: '0% cloud', bar: null },
]

// ── Time-range options: each scales today's fixtures by a factor ───────────
const RANGES = [
  { id: 'today', label: 'Today',  factor: 1 },
  { id: '7d',    label: '7-day',  factor: 6.8 }, // ~7 days, accounting for cloud
]

const fmt = (n) => Math.round(n).toLocaleString()

// ── Sparkline Component ────────────────────────────────────────────────────
function Sparkline({ values, label }) {
  const max = Math.max(...values)
  const peakIdx = values.indexOf(max)
  return (
    <div
      role="img"
      aria-label={label}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24 }}
    >
      {values.map((v, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            width: 5,
            height: `${(v / max) * 100}%`,
            borderRadius: 2,
            // Peak bar carries amber AND a taller height, so meaning isn't color-only.
            background: i === peakIdx ? 'var(--accent)' : 'rgba(14,165,233,0.45)',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  )
}

// ── Animated Dashed Connector (SVG) ───────────────────────────────────────
function DashedConnector({ color = 'var(--primary)', label }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0 4px' }}>
      <svg width="100%" height="20" style={{ overflow: 'visible' }} aria-hidden="true">
        <line
          x1="0" y1="10" x2="100%" y2="10"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="6 4"
          style={{ animation: 'dash-flow 1.4s linear infinite' }}
        />
        <polygon
          points="0,-5 10,0 0,5"
          fill={color}
          style={{ transform: 'translate(calc(100% - 12px), 10px)', overflow: 'visible' }}
        />
      </svg>
      {label && (
        <span style={{ fontSize: 9.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
    </div>
  )
}

// ── Building Detail Drawer ────────────────────────────────────────────────
// Focusable-element selector used by the Tab focus-trap.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

function BuildingDrawer({ building, onClose, onView }) {
  const panelRef = useRef(null)
  const closeBtnRef = useRef(null)
  // Element that had focus before the drawer opened — restored on close.
  const triggerRef = useRef(null)
  const open = Boolean(building)

  // Capture the triggering element the moment the drawer opens, then move
  // focus into the drawer (the close button).
  useEffect(() => {
    if (!open) return
    triggerRef.current = document.activeElement
    // Defer to next frame so the panel is mounted before we focus it.
    const id = requestAnimationFrame(() => closeBtnRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  // Restore focus to the triggering element when the drawer unmounts/closes.
  useEffect(() => {
    if (open) return
    const trigger = triggerRef.current
    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus()
    }
    triggerRef.current = null
  }, [open])

  // Keyboard contract: Escape closes; Tab is trapped within the drawer.
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      // Wrap focus at the edges; also pull focus back in if it escaped the trap.
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    },
    [onClose]
  )

  if (!building) return null
  const col = STATUS_COLOR[building.status]
  return (
    <AnimatePresence>
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', zIndex: 40 }}
      />
      <motion.div
        key="drawer-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${building.id} ${building.name} details`}
        onKeyDown={handleKeyDown}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(380px, 92vw)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
          borderLeft: 'var(--glass-border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
          zIndex: 41, padding: '24px', color: 'var(--text)', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}` }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{building.id}</span>
              <span style={{ fontSize: 11, color: col, fontFamily: 'var(--font-body)' }}>{STATUS_LABEL[building.status]}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{building.name}</div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close details"
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          >
            <Icon name="x" size={16} color="currentColor" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Output today', value: `${building.kwh.toLocaleString()} kWh`, color: 'var(--success)',  numeric: true  },
            { label: 'Capacity',     value: building.cap,                            color: 'var(--text)',     numeric: true  },
            { label: 'Efficiency',   value: building.eff,                            color: 'var(--positive)', numeric: true  },
            { label: 'Status',       value: STATUS_LABEL[building.status],           color: col,               numeric: false },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{s.label}</div>
              <div style={{ fontFamily: s.numeric ? 'var(--font-mono)' : 'var(--font-display)', fontVariantNumeric: s.numeric ? 'tabular-nums' : 'normal', fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onView}
          style={{
            width: '100%', padding: '11px 16px', borderRadius: 8,
            background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.35)',
            color: 'var(--primary)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Icon name="landmark" size={16} color="var(--primary)" />
          View in 3D Visualizer
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Overview() {
  const navigate = useNavigate()
  const { loading, error, refetch } = useSolarData('/api/overview')
  const { setDemoMode } = useDemoMode()

  const [rangeId, setRangeId] = useState('today')
  const [selected, setSelected] = useState(null) // building object for drawer

  // Refresh feedback: spinner + disabled while "fetching", plus a live
  // "updated Ns ago" timestamp that resets on click (works in demo mode too).
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(() => Date.now())
  const [secondsAgo, setSecondsAgo] = useState(0)

  // Tick the "updated Ns ago" label once a second from the last refresh.
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsAgo(Math.round((Date.now() - lastUpdated) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [lastUpdated])

  const handleRefresh = useCallback(() => {
    if (refreshing) return
    setRefreshing(true)
    // Kick off the real refetch (no-op in demo mode) and give visible feedback.
    Promise.resolve(refetch?.()).finally(() => {})
    window.setTimeout(() => {
      setRefreshing(false)
      setLastUpdated(Date.now())
      setSecondsAgo(0)
    }, 650)
  }, [refreshing, refetch])

  const updatedLabel =
    secondsAgo < 5 ? 'updated just now' : `updated ${secondsAgo}s ago`

  const range = RANGES.find((r) => r.id === rangeId) || RANGES[0]

  // Re-derive demo numbers from the fixtures by scaling with the range factor.
  const derived = useMemo(() => {
    const f = range.factor
    const gen = 2380 * f
    const load = 1766 * f
    const exported = 614 * f
    const hero = {
      generation: gen,
      // vs-yesterday delta (plausible demo): only meaningful for 'today'
      deltaPct: rangeId === 'today' ? 8.4 : 5.1,
      selfConsumed: load,
      exported,
      selfRate: Math.round((load / gen) * 100), // 74%
    }
    const kpis = KPI_CARDS.map((k) => ({
      ...k,
      display: k.fixedValue
        ? k.fixedValue
        : fmt((k.scales ? k.base * f : k.base)),
    }))
    return { hero, kpis, flow: { gen, load, exported } }
  }, [range, rangeId])

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' } }),
  }

  const openBuilding = (b) => setSelected(b)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Local keyframes + hover/focus rules */}
      <style>{`
        @keyframes dash-flow {
          from { stroke-dashoffset: 20; }
          to   { stroke-dashoffset: 0;  }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
        @keyframes spin-refresh {
          to { transform: rotate(360deg); }
        }
        .refresh-spin { animation: spin-refresh 0.7s linear infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .refresh-spin { animation: none; }
        }
        .qaction-card:hover { background: rgba(14,165,233,0.12) !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .qaction-card:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        /* Faint persistent ring so blocks read as interactive at rest (not hover-only) */
        .bblock { transition: transform 0.18s ease, box-shadow 0.18s ease; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); }
        .bblock:hover, .bblock:focus-visible { transform: translate(var(--tx, -50%), -50%) scale(1.05); box-shadow: 0 0 0 1px var(--primary), 0 6px 18px rgba(0,0,0,0.4); z-index: 10; }
        .bblock:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .srow:hover, .srow:focus-visible { background: rgba(14,165,233,0.07) !important; }
        .srow:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
        .srow:hover .srow-chevron, .srow:focus-visible .srow-chevron { stroke: var(--primary); transform: translateX(2px); }
        .range-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .bblock:hover, .bblock:focus-visible { transform: translate(var(--tx, -50%), -50%); }
        }
        @media (max-width: 900px) {
          .kpi-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .main-grid  { grid-template-columns: 1fr !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
          .hero-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Error state (Phase 4 wires this up) ── */}
      {error && (
        <div style={{ padding: '40px 24px' }}>
          <ErrorCard
            title="Couldn't load Overview data"
            message={error}
            onRetry={refetch}
            onDemoMode={() => setDemoMode(true)}
          />
        </div>
      )}

      {/* ── Loading skeleton (Phase 4 wires this up) ── */}
      {loading && !error && (
        <div style={{ padding: '0 2px 2.5rem', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <LoadingSkeleton height={150} borderRadius={16} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} height={100} borderRadius={12} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
            <LoadingSkeleton height={280} borderRadius={12} />
            <LoadingSkeleton height={280} borderRadius={12} />
          </div>
        </div>
      )}

      {/* ── Main content (always shown in demo mode) ── */}
      {!error && !loading && (
      <div style={{ padding: '0 2px 2.5rem', color: 'var(--text)' }}>

        {/* ── TIER 1: Hero headline — "is the campus winning today?" ─────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          aria-label="Campus headline"
          className="hero-grid"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
            border: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: 18,
            padding: '24px 28px',
            marginBottom: 20,
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: 28,
            alignItems: 'center',
          }}
        >
          {/* Amber energy glow — the one accent that may glow */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: -60, left: -40, width: 220, height: 220,
            background: 'radial-gradient(circle, rgba(245,158,11,0.16), transparent 70%)',
            filter: 'blur(18px)', pointerEvents: 'none',
          }} />

          {/* Headline metric */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--success)',
                boxShadow: '0 0 8px var(--success)', animation: 'pulse-dot 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Campus Solar · {range.label} Generation
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 700,
                fontSize: 'clamp(40px, 5.6vw, 58px)', lineHeight: 0.95,
                letterSpacing: '-0.02em', color: 'var(--text)',
              }}>
                {fmt(derived.hero.generation)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>kWh</span>

              {/* vs-yesterday delta — word + arrow, never color alone */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 'var(--radius-full)',
                background: 'var(--positive-glow)', border: '1px solid rgba(74,222,128,0.28)',
                color: 'var(--positive)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              }}>
                <Icon name="trending-up" size={14} color="var(--positive)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>+{derived.hero.deltaPct}%</span> vs yesterday
              </span>
            </div>

            <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
              All 5 buildings online · <strong style={{ color: 'var(--success)' }}><span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{derived.hero.selfRate}%</span> self-consumed</strong>, surplus exported to grid.
              The campus is ahead of plan {rangeId === 'today' ? 'today' : 'this week'}.
            </div>
          </div>

          {/* Hero supporting stats (self-consumption + export) */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Self-Consumed', value: fmt(derived.hero.selfConsumed), unit: 'kWh', color: 'var(--primary)' },
              { label: 'Grid Export',   value: fmt(derived.hero.exported),     unit: 'kWh', color: 'var(--success)' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, fontFamily: 'var(--font-body)' }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{s.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Controls: time-range + refresh — status isn't fake-static ──── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          {/* Live "updated Ns ago" — bumps on refresh, even in demo mode */}
          <span
            aria-live="polite"
            style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginRight: 'auto' }}
          >
            {updatedLabel}
          </span>
          <div role="group" aria-label="Time range" style={{
            display: 'inline-flex', background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: 3,
          }}>
            {RANGES.map((r) => {
              const active = r.id === rangeId
              return (
                <button
                  key={r.id}
                  type="button"
                  className="range-btn"
                  aria-pressed={active}
                  onClick={() => setRangeId(r.id)}
                  style={{
                    padding: '6px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                    background: active ? 'rgba(14,165,233,0.16)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="range-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh data"
            aria-busy={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              cursor: refreshing ? 'default' : 'pointer',
              opacity: refreshing ? 0.7 : 1,
            }}
          >
            <span className={refreshing ? 'refresh-spin' : undefined} style={{ display: 'flex' }}>
              <Icon name="refresh-cw" size={14} color="currentColor" />
            </span>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* ── TIER 2: KPI Strip ──────────────────────────────────────────── */}
        <div
          className="kpi-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}
        >
          {derived.kpis.map((k, i) => (
            <motion.div
              key={k.key}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                borderRadius: 14,
                padding: '20px 20px 16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow dot */}
              <div aria-hidden="true" style={{
                position: 'absolute', top: -20, left: -20,
                width: 80, height: 80,
                background: `radial-gradient(circle, ${k.color}40, transparent 70%)`,
                filter: 'blur(12px)',
                pointerEvents: 'none',
              }} />

              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {k.label}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 28, fontWeight: 700,
                  color: k.color, lineHeight: 1,
                }}>
                  {k.display}
                </span>
                {k.unit && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{k.unit}</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {k.pulse && (
                  <span aria-hidden="true" style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: k.color,
                    display: 'inline-block',
                    animation: 'pulse-dot 2s ease-in-out infinite',
                    boxShadow: `0 0 6px ${k.color}`,
                  }} />
                )}
                <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{k.subtitle}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── TIER 3: Supporting widgets ─────────────────────────────────── */}
        <div
          className="main-grid"
          style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 20, marginBottom: 20 }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 3.2b Campus Energy Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              style={{ ...SUPPORT_GLASS, padding: '20px 20px 16px' }}
            >
              {/* Panel header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" aria-hidden="true">
                      <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>Campus Energy Map</span>
                  </div>
                  {/* Time-base is explicit: map values are always today's, even in 7-day view */}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>(today)</span>
                </div>
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 20,
                  background: 'var(--positive-glow)', color: 'var(--positive)',
                  border: '1px solid rgba(74,222,128,0.25)', fontFamily: 'var(--font-body)',
                }}>5/5 Live</span>
              </div>
              {/* Discoverability helper — interaction isn't hover-only */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                Select a building for details
              </div>

              {/* Map canvas */}
              <div style={{
                position: 'relative', height: 310, borderRadius: 10,
                background: 'rgba(4,17,31,0.9)',
                backgroundImage: 'linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                overflow: 'hidden',
              }}>
                {/* SVG road lines (decorative) */}
                <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {MAP_LINKS.map(([a, c]) => (
                    <line key={`${a}-${c}`}
                      x1={NODE_POS[a].x} y1={NODE_POS[a].y}
                      x2={NODE_POS[c].x} y2={NODE_POS[c].y}
                      stroke="var(--text-dim-decorative)" strokeWidth="1.5" strokeDasharray="3 5" strokeLinecap="round" opacity="0.5" />
                  ))}
                  {/* faint hub node so the radial mesh reads even where lines pass under cards */}
                  <circle cx={NODE_POS.B04.x} cy={NODE_POS.B04.y} r="3.5" fill="var(--text-dim-decorative)" opacity="0.55" />
                </svg>

                {/* Building blocks — now clickable, keyboard-operable */}
                {BUILDINGS.map((b) => {
                  const col = STATUS_COLOR[b.status]
                  // Anchor edge cards inward (left-edge cards grow right, right-edge grow left)
                  // so a centred card never clips the map's left/right boundary.
                  const lx = parseFloat(b.left)
                  const tx = lx <= 22 ? '0px' : lx >= 70 ? '-100%' : '-50%'
                  return (
                    <div
                      key={b.id}
                      className="bblock"
                      role="button"
                      tabIndex={0}
                      aria-label={`${b.id} ${b.name}, ${STATUS_LABEL[b.status]}, ${b.kwh.toLocaleString()} kilowatt hours. Open details.`}
                      onClick={() => openBuilding(b)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBuilding(b) } }}
                      style={{
                        position: 'absolute', top: b.top, left: b.left,
                        '--tx': tx,
                        transform: 'translate(var(--tx), -50%)',
                        background: b.status === 'peak' ? 'rgba(245,158,11,0.07)' : 'rgba(74,222,128,0.07)',
                        border: `1.5px solid ${col}`,
                        borderRadius: 8, padding: '8px 12px',
                        cursor: 'pointer',
                        minWidth: 108,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: col, display: 'block', boxShadow: `0 0 5px ${col}` }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: col }}>{b.id}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{b.status}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>{b.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
                        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--text)' }}>{b.kwh.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>kWh</span></div>
                        {/* Persistent "View" affordance — visible without hover */}
                        <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.02em', color: 'var(--primary)', fontFamily: 'var(--font-body)' }}>
                          View ›
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
                {[['var(--positive)', 'Producing'], ['var(--accent)', 'Peak Output'], ['var(--text-dim)', 'Offline/Standby']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'block' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 3.2c Live Energy Flow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.45 }}
              style={{ ...SUPPORT_GLASS, padding: '20px 24px' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Live Energy Flow</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-body)', marginBottom: 18 }}>
                Solar generated = self-consumed + exported to grid
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                {/* Node: Solar */}
                <div style={{
                  background: 'rgba(245,158,11,0.12)', border: '1.5px solid rgba(245,158,11,0.4)',
                  borderRadius: 10, padding: '14px 18px', textAlign: 'center', minWidth: 120,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Solar Generated</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>{fmt(derived.flow.gen)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>kWh</div>
                </div>

                <DashedConnector color="var(--primary)" label="self-consumed" />

                {/* Node: Building Load */}
                <div style={{
                  background: 'rgba(14,165,233,0.12)', border: '1.5px solid rgba(14,165,233,0.4)',
                  borderRadius: 10, padding: '14px 18px', textAlign: 'center', minWidth: 120,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Building Load</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 22, color: 'var(--primary)' }}>{fmt(derived.flow.load)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>kWh</div>
                </div>

                <DashedConnector color="var(--success)" label="exported to grid" />

                {/* Node: Grid Export */}
                <div style={{
                  background: 'rgba(34,211,238,0.12)', border: '1.5px solid rgba(34,211,238,0.4)',
                  borderRadius: 10, padding: '14px 18px', textAlign: 'center', minWidth: 120,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Grid Export</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 22, color: 'var(--success)' }}>{fmt(derived.flow.exported)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>kWh</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 3.2d System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              style={{ ...SUPPORT_GLASS, padding: '20px 20px 12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>System Status</span>
                  {/* Time-base is explicit: these kWh are always today's */}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>(today)</span>
                </div>
              </div>
              {/* Discoverability helper — rows open a detail drawer */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                Select a row to open its detail panel
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {SYSTEM_ROWS.map((r) => (
                  <div
                    key={r.id}
                    className="srow"
                    role="button"
                    tabIndex={0}
                    aria-label={`${r.id} ${r.name}, ${r.eff} efficiency, ${r.kwh.toLocaleString()} kilowatt hours, ${r.badge}. Open details.`}
                    onClick={() => openBuilding(BUILDINGS.find((b) => b.id === r.id))}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBuilding(BUILDINGS.find((b) => b.id === r.id)) } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 8px', borderRadius: 8,
                      cursor: 'pointer', transition: 'background 0.18s',
                    }}
                  >
                    <div style={{ minWidth: 34 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{r.id}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{r.cap}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                    </div>
                    <Sparkline values={r.sparks} label={`${r.name} 7-day output trend, peak highlighted`} />
                    <div style={{ textAlign: 'right', minWidth: 52 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{r.kwh.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{r.eff}</div>
                    </div>
                    <span style={{
                      fontSize: 9, padding: '2px 8px', borderRadius: 12, fontFamily: 'var(--font-body)',
                      background: r.badge === 'Peak' ? 'rgba(245,158,11,0.15)' : 'var(--positive-glow)',
                      color: r.badge === 'Peak' ? 'var(--accent)' : 'var(--positive)',
                      border: `1px solid ${r.badge === 'Peak' ? 'rgba(245,158,11,0.3)' : 'rgba(74,222,128,0.25)'}`,
                    }}>{r.badge}</span>
                    {/* Persistent affordance — row opens details, visible without hover */}
                    <svg
                      className="srow-chevron"
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      aria-hidden="true" style={{ flexShrink: 0, transition: 'stroke 0.18s, transform 0.18s' }}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 3.2e Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.45 }}
              style={{ ...SUPPORT_GLASS, padding: '20px' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: 'landmark', label: 'View 3D Campus',  hint: 'Interactive building models', color: 'var(--primary)', to: '/visualizer' },
                  { icon: 'bar-chart', label: 'Open Analytics',  hint: 'Energy & savings reports',     color: 'var(--accent)', to: '/analytics' },
                  { icon: 'settings',  label: 'Run Simulation',  hint: 'Adjust system parameters',     color: 'var(--success)', to: '/visualizer' },
                  { icon: 'graduation-cap', label: 'Training Center', hint: 'Learn solar fundamentals',      color: 'var(--positive)', to: '/training'  },
                ].map((a) => (
                  <div
                    key={a.label}
                    className="qaction-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(a.to)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(a.to)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: 10, padding: '14px 14px',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 8 }}><Icon name={a.icon} color={a.color} size={20} /></div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: a.color, marginBottom: 4 }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{a.hint}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── 3.2f Bottom Strip ──────────────────────────────────────────── */}
        <motion.div
          className="bottom-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}
        >
          {/* Recent Alerts */}
          <div style={{ ...SUPPORT_GLASS, padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Recent Alerts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ALERTS.map((a) => (
                <div key={a.msg} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}><Icon name={a.icon} color={a.color} size={16} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{a.msg}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2, fontFamily: 'var(--font-body)' }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Modules */}
          <div style={{ ...SUPPORT_GLASS, padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Platform Modules</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MODULES.map((m) => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{m.name}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 10px', borderRadius: 12, fontFamily: 'var(--font-body)',
                    background: m.status === 'Online' ? 'var(--positive-glow)' : 'rgba(245,158,11,0.12)',
                    color: m.color,
                    border: `1px solid ${m.status === 'Online' ? 'rgba(74,222,128,0.25)' : 'rgba(245,158,11,0.3)'}`,
                  }}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weather & Irradiance */}
          <div style={{ ...SUPPORT_GLASS, padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Weather & Irradiance</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="5" fill="var(--accent)" />
                {[0,45,90,135,180,225,270,315].map((deg) => (
                  <line key={deg}
                    x1={12 + 7 * Math.cos(deg * Math.PI / 180)}
                    y1={12 + 7 * Math.sin(deg * Math.PI / 180)}
                    x2={12 + 9.5 * Math.cos(deg * Math.PI / 180)}
                    y2={12 + 9.5 * Math.sin(deg * Math.PI / 180)}
                    stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"
                  />
                ))}
              </svg>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 26, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>38°C</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Clear · Sunny</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>Doha, Qatar · QF Campus</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {WEATHER_METRICS.map((m) => (
                <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)', marginBottom: 3 }}>{m.label}</div>
                  <div className="mono-num" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: m.bar ? 5 : 0 }}>{m.unit}</div>
                  {m.bar && (
                    <div aria-hidden="true" style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: '100%', width: `${m.bar * 100}%`, borderRadius: 2, background: 'var(--accent)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      )} {/* end !error && !loading */}

      {/* ── Building detail drawer ── */}
      <BuildingDrawer
        building={selected}
        onClose={() => setSelected(null)}
        onView={() => { setSelected(null); navigate('/visualizer') }}
      />
    </motion.div>
  )
}
