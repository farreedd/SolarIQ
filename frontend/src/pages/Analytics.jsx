import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie, Label,
} from 'recharts'
import {
  BUILDINGS, PERIODS, CURRENT_MONTH_IDX, getMonthlyCaption,
  getKpiCards, getProdConsSeries, getHourlyData, getHourlyPeak, getHourlyMeta,
  getMonthlyData, getMonthlyMeta, getEconomics, buildingByValue, buildKpiCsv,
  buildEconomicsCsv, DONUT_DATA, BUILDING_RANKING, AI_INSIGHTS,
} from '../utils/analyticsData'

const TIME_TABS = Object.keys(PERIODS) // ['Day','Month','Year']

const DELTA_COLOR = { up: 'var(--positive)', muted: 'var(--text-dim)' }
const DELTA_ARROW = { up: '↑', muted: '·' }

// Single panel radius across hero cards and chart panels (was 16 vs 14).
const PANEL_RADIUS = 16

// Shared glass-panel recipe (mirrors .liquid-glass token; inline so it can be reused per panel)
const GLASS = {
  background: 'var(--glass-bg, linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5))',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
  borderRadius: PANEL_RADIUS,
}

// Screen-reader-only style
const SR_ONLY = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
}

const PANEL_TITLE = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }

// Chart tooltip: an elevated, opaque surface so it never blends into the dark
// panel behind it. Lighter than the card, bright hairline border, lifted shadow.
const TOOLTIP_CONTENT = {
  background: '#16315a',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 10,
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: 'var(--text)',
  boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
  padding: '8px 12px',
}
const TOOLTIP_ITEM = { color: 'var(--text)', padding: 0 }
const TOOLTIP_LABEL = { color: 'var(--text)', marginBottom: 4, fontWeight: 600 }
const TOOLTIP_WRAPPER = { outline: 'none', zIndex: 50 }

// Production-vs-Consumption tooltip with a fixed row order — Production above
// Consumption — so the list matches the chart's visual stacking (amber line sits
// above the blue). Order is hardcoded, not taken from Recharts' payload order.
function ProdConsTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const valOf = (k) => payload.find((p) => p.dataKey === k)?.value
  const rows = [
    { name: 'Production', value: valOf('production') },
    { name: 'Consumption', value: valOf('consumption') },
  ].filter((r) => r.value != null)
  return (
    <div style={TOOLTIP_CONTENT}>
      <div style={TOOLTIP_LABEL}>{label}</div>
      {rows.map((r) => (
        <div key={r.name} style={{ color: 'var(--text)', lineHeight: 1.7 }}>
          {r.name} : <span className="mono-num" style={{ fontWeight: 600 }}>{r.value.toLocaleString()}</span> kWh
        </div>
      ))}
    </div>
  )
}

// Donut fixed pixel size — guarantees the chart never measures 0 on first paint.
const DONUT_SIZE = 180

// Map a building-ranking id (B01…) to its select value
const idToValue = (id) => (BUILDINGS.find((b) => b.id === id) || BUILDINGS[0]).value

// ── Monthly bar shape: actual = solid blue, current = amber w/ marker, future = dashed outline ──
const MonthBar = (props) => {
  const { x, y, width, height, index } = props
  if (!width || !height) return null
  const isCurrent = index === CURRENT_MONTH_IDX
  const isFuture = index > CURRENT_MONTH_IDX
  const r = 4
  if (isFuture) {
    return (
      <rect
        x={x} y={y} width={width} height={height}
        fill="rgba(14,165,233,0.06)"
        stroke="rgba(14,165,233,0.35)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        rx={r}
      />
    )
  }
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        fill={isCurrent ? '#f59e0b' : 'rgba(14,165,233,0.7)'}
        rx={r}
        style={isCurrent ? { filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' } : {}}
      />
      {/* Non-color cue for the amber peak month: a small star marker above the bar */}
      {isCurrent && (
        <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={11} fill="#f59e0b">★</text>
      )}
    </g>
  )
}

// ── CSV download helper ──────────────────────────────────────────────────────
function downloadCsv(filename, csv) {
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    /* no-op in non-DOM environments */
  }
}

export default function Analytics() {
  const [building, setBuilding] = useState('All Buildings')
  const [timeTab, setTimeTab] = useState('Month')
  const [copied, setCopied] = useState(false)

  // ── Derived, building/period-aware data (client-side, demo mode) ──
  const buildingMeta = buildingByValue(building)
  const period = PERIODS[timeTab]
  const kpis = useMemo(() => getKpiCards(building, timeTab), [building, timeTab])
  const heroKpis = kpis.filter((k) => k.hero)
  const secondaryKpis = kpis.filter((k) => !k.hero)

  // Production vs Consumption is period-aware: Day → intraday, Month → daily, Year → monthly.
  const prodConsView = useMemo(() => getProdConsSeries(building, timeTab), [building, timeTab])
  const prodCons = prodConsView.data
  const hourly = useMemo(() => getHourlyData(building), [building])
  const hourlyPeak = useMemo(() => getHourlyPeak(building), [building])
  const hourlyMeta = useMemo(() => getHourlyMeta(timeTab), [timeTab])
  const monthly = useMemo(() => getMonthlyData(building), [building])
  const monthlyMeta = useMemo(() => getMonthlyMeta(timeTab), [timeTab])
  const monthlyCaption = useMemo(() => getMonthlyCaption(), [])
  const economics = useMemo(() => getEconomics(building), [building])

  const donutTotal = DONUT_DATA.reduce((s, d) => s + d.value, 0)
  const donutValid = donutTotal > 0 && DONUT_DATA.every((d) => d.color)
  // Center label reads the Self-Consumed entry by name (not a magic index), so
  // reordering DONUT_DATA can never make the center number lie. Fallback to the
  // first slice only if that named entry is ever absent.
  const selfConsumed = DONUT_DATA.find((d) => d.name === 'Self-Consumed') || DONUT_DATA[0]

  // Y-domains adapt to the scaled series so bars/areas stay legible per building
  const prodMax = Math.max(...prodCons.map((d) => Math.max(d.production, d.consumption)))
  const hourlyMax = Math.max(...hourly.map((d) => d.kwh))
  const monthlyMax = Math.max(...monthly.map((d) => d.kwh))
  const monthlyMin = Math.min(...monthly.map((d) => d.kwh))

  const periodLabel = period.label
  const buildingLabel = buildingMeta.value

  // Payback milestone ticks derived from the data (not hardcoded). Evenly-spaced
  // whole years up to (but not equal to) the payback value, then the exact
  // payback value as the final tick. Deduped + sorted so ticks never collide.
  const paybackTicks = useMemo(() => {
    const total = economics.paybackYears
    const intermediate = []
    const step = total > 6 ? 2 : 1
    for (let y = step; y < total - 0.25; y += step) intermediate.push(y)
    const all = [...new Set([...intermediate, total])].sort((a, b) => a - b)
    return all
  }, [economics.paybackYears])

  const handleCopyCsv = () => {
    const csv = buildKpiCsv(building, timeTab)
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(csv).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }).catch(() => downloadCsv(`solariq-analytics-${buildingMeta.id}-${timeTab}.csv`, csv))
    } else {
      downloadCsv(`solariq-analytics-${buildingMeta.id}-${timeTab}.csv`, csv)
    }
  }

  // Economics panel exports ONLY its own rows (distinct from the topbar's full
  // KPI+economics export), so each button matches its placement. Always a file
  // download to keep the two actions visibly different.
  const handleEconomicsCsv = () => {
    downloadCsv(`solariq-economics-${buildingMeta.id}.csv`, buildEconomicsCsv(building))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <style>{`
        .kpi-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .kpi-hero:hover { transform: translateY(-2px); box-shadow: 0 16px 44px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.18); }
        .rank-row { transition: background 0.15s ease, border-color 0.15s ease; }
        .rank-row:hover { background: rgba(255,255,255,0.04); }
        .rank-row:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .pb-fill {
          transform: scaleX(0);
          transform-origin: left center;
          animation: pb-grow 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
        }
        @keyframes pb-grow { to { transform: scaleX(var(--pb-target, 1)); } }
        @media (prefers-reduced-motion: reduce) {
          .pb-fill { animation: none; transform: scaleX(var(--pb-target, 1)); }
        }
        @media (max-width: 1000px) {
          .hero-row { grid-template-columns: 1fr !important; }
          .secondary-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 720px) {
          .secondary-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={{ padding: '0 2px 2.5rem', color: 'var(--text)' }}>

        {/* ── Topbar Controls ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          {/* Building selector */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={SR_ONLY}>Filter analytics by building</span>
            <select
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              aria-label="Filter analytics by building"
              style={{
                background: 'rgba(13,31,56,0.85)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                padding: '8px 36px 8px 14px',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237ea8c9' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              {BUILDINGS.map((b) => (
                <option key={b.value} value={b.value}>{b.value}</option>
              ))}
            </select>
          </label>

          {/* Time range tabs */}
          <div
            role="tablist"
            aria-label="Time range"
            style={{
              display: 'flex',
              background: 'rgba(13,31,56,0.72)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 3,
              gap: 2,
            }}
          >
            {TIME_TABS.map((t) => {
              const active = timeTab === t
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTimeTab(t)}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'var(--text-muted)',
                    background: active ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'transparent',
                    boxShadow: active ? '0 0 12px rgba(14,165,233,0.35)' : 'none',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Active scope chip + export */}
          <span
            aria-live="polite"
            style={{
              fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.22)',
            }}
          >
            {buildingMeta.short} · {periodLabel}
          </span>
          <button
            onClick={handleCopyCsv}
            aria-label="Copy KPI and economics figures as CSV"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              color: copied ? 'var(--positive)' : 'var(--primary)',
              background: 'rgba(14,165,233,0.12)',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.4)' : 'rgba(14,165,233,0.35)'}`,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {copied
                ? <path d="M20 6 9 17l-5-5" />
                : <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>}
            </svg>
            {copied ? 'Copied' : 'Export CSV'}
          </button>
        </div>

        {/* ── Hero KPI tier (executive) ───────────────────────────────────── */}
        <motion.div
          className="hero-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 14 }}
        >
          {heroKpis.map((k, i) => (
            <motion.div
              key={k.key}
              className="kpi-card kpi-hero"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35, ease: 'easeOut' }}
              style={{
                ...GLASS,
                padding: '22px 22px 20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14,
              }}>
                {k.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
                  fontSize: 41, fontWeight: 700,
                  color: k.color, lineHeight: 0.95, letterSpacing: '-0.02em',
                }}>
                  {k.value}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  {k.unit}
                </span>
              </div>
              <div style={{
                fontSize: 12, color: DELTA_COLOR[k.deltaType], fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span aria-hidden="true" style={{ fontSize: 11 }}>{DELTA_ARROW[k.deltaType]}</span>
                <span className="mono-num">{k.delta}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Secondary KPI strip (compact) ───────────────────────────────── */}
        <motion.div
          className="secondary-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}
        >
          {secondaryKpis.map((k, i) => (
            <motion.div
              key={k.key}
              className="kpi-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.3, ease: 'easeOut' }}
              style={{
                background: 'rgba(13,31,56,0.5)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '13px 14px',
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
                  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {k.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
                    fontSize: 19, fontWeight: 700,
                    color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.01em',
                  }}>
                    {k.value}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{k.unit}</span>
                </div>
              </div>
              <div style={{
                fontSize: 10, color: DELTA_COLOR[k.deltaType], fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                <span aria-hidden="true">{DELTA_ARROW[k.deltaType]}</span> <span className="mono-num">{k.delta}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Chart Row 1: Production vs Consumption + Ranking ─────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}
        >
          {/* Production vs Consumption — period-aware (Day=intraday, Month=daily, Year=monthly) */}
          <section
            style={{ ...GLASS, padding: '20px 20px 16px' }}
            role="img"
            aria-label={`${prodConsView.title} for ${buildingLabel}. Production peaks near ${prodMax.toLocaleString()} kilowatt-hours against consumption.`}
          >
            <div style={{ ...PANEL_TITLE, marginBottom: 4 }}>
              {prodConsView.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 14 }}>
              {prodConsView.caption}
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={prodCons} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.36} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.5)" vertical={false} />
                <XAxis
                  dataKey={prodConsView.xKey}
                  tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                  tickLine={false}
                  axisLine={false}
                  interval={prodCons.length > 14 ? Math.floor(prodCons.length / 7) : 0}
                />
                <YAxis
                  tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
                  domain={[0, Math.ceil(prodMax * 1.05)]}
                />
                <Tooltip
                  content={<ProdConsTooltip />}
                  wrapperStyle={TOOLTIP_WRAPPER}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Area type="monotone" dataKey="production" stroke="#f59e0b" strokeWidth={2}
                  fill="url(#prodGrad)" dot={false} activeDot={{ r: 4, fill: '#f59e0b' }} />
                <Area type="monotone" dataKey="consumption" stroke="#0ea5e9" strokeWidth={2}
                  strokeDasharray="5 3" fill="none" dot={false} activeDot={{ r: 4, fill: '#0ea5e9' }} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Mini legend — non-color cues: solid fill vs dashed line */}
            <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 24, height: 3, background: '#f59e0b', borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Production (solid)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 24, height: 3, borderRadius: 2,
                  background: 'repeating-linear-gradient(90deg, #0ea5e9 0px, #0ea5e9 5px, transparent 5px, transparent 8px)',
                }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Consumption (dashed)</span>
              </div>
            </div>

            {/* Visually-hidden table alternative */}
            <div style={SR_ONLY}><table>
              <caption>{prodConsView.srCaption} for {buildingLabel}</caption>
              <thead><tr><th scope="col">Interval</th><th scope="col">Production kWh</th><th scope="col">Consumption kWh</th></tr></thead>
              <tbody>
                {prodCons.map((d) => (
                  <tr key={d.x}><th scope="row">{d.x}</th><td>{d.production}</td><td>{d.consumption}</td></tr>
                ))}
              </tbody>
            </table></div>
          </section>

          {/* Building Output Ranking — rows clickable to set building filter */}
          <section style={{ ...GLASS, padding: '20px' }} aria-label="Building output ranking; select a building to filter">
            <div style={{ ...PANEL_TITLE, marginBottom: 18 }}>
              Building Output Ranking
            </div>
            <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {BUILDING_RANKING.map((b, i) => {
                const isSelected = buildingMeta.id === b.id
                return (
                  <button
                    key={b.id}
                    role="listitem"
                    className="rank-row"
                    onClick={() => setBuilding(isSelected ? 'All Buildings' : idToValue(b.id))}
                    aria-pressed={isSelected}
                    aria-label={`${b.name}, ${b.cap}, ${b.kwh.toLocaleString()} kilowatt-hours, rank ${i + 1}${isSelected ? ', selected' : ''}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', textAlign: 'left', cursor: 'pointer',
                      background: isSelected ? 'rgba(14,165,233,0.1)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(14,165,233,0.35)' : 'transparent'}`,
                      borderRadius: 8, padding: '8px 10px',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
                      fontSize: 11, fontWeight: 700,
                      color: 'var(--text-dim)', minWidth: 20, textAlign: 'right',
                    }}>
                      {i + 1}
                    </span>
                    <span aria-hidden="true" style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--positive)', boxShadow: '0 0 6px var(--positive)',
                      flexShrink: 0,
                    }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        display: 'block', fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-body)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {b.name}{isSelected && <span style={{ color: 'var(--primary)', marginLeft: 6 }}>· filtered</span>}
                      </span>
                      <span style={{ display: 'block', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{b.cap}</span>
                    </span>
                    <span style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 700, color: 'var(--success)', letterSpacing: '-0.01em' }}>
                        {b.kwh.toLocaleString()}
                      </span>
                      <span style={{ display: 'block', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>kWh</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </motion.div>

        {/* ── Chart Row 2: Hourly + Donut + AI Insights ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}
        >
          {/* Hourly Generation */}
          <section
            style={{ ...GLASS, padding: '20px 20px 16px' }}
            role="img"
            aria-label={`${hourlyMeta.title} for ${buildingLabel}. Peaks at ${hourlyPeak.hour} with ${hourlyPeak.kwh.toLocaleString()} kilowatt-hours.`}
          >
            <div style={{ ...PANEL_TITLE, marginBottom: 18 }}>
              {hourlyMeta.title}
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourly} margin={{ top: 10, right: 4, left: -18, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.5)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'var(--font-body)' }}
                  tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                  tickLine={false} axisLine={false} domain={[0, Math.ceil(hourlyMax * 1.12)]} />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT}
                  itemStyle={TOOLTIP_ITEM}
                  wrapperStyle={TOOLTIP_WRAPPER}
                  formatter={(v, _n, p) => [
                    <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{`${v} kWh`}</span>,
                    p?.payload?.peak ? 'Peak generation' : 'Generation',
                  ]}
                  labelStyle={TOOLTIP_LABEL}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="kwh" radius={[4, 4, 0, 0]}>
                  {hourly.map((entry) => (
                    <Cell
                      key={entry.hour}
                      fill={entry.peak ? '#f59e0b' : 'rgba(14,165,233,0.7)'}
                      style={entry.peak ? { filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' } : {}}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div style={{
              marginTop: 10, fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-body)',
              textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span aria-hidden="true" style={{ color: 'var(--accent)' }}>★</span>
              Peak at {hourlyPeak.hour} — {hourlyPeak.kwh.toLocaleString()} kWh
            </div>

            {/* Visually-hidden table alternative */}
            <div style={SR_ONLY}><table>
              <caption>{hourlyMeta.title} (kWh) for {buildingLabel}</caption>
              <thead><tr><th scope="col">Hour</th><th scope="col">Generation kWh</th></tr></thead>
              <tbody>
                {hourly.map((d) => (
                  <tr key={d.hour}>
                    <th scope="row">{d.hour}</th>
                    <td>{d.kwh.toLocaleString()}{d.peak ? ' (peak)' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </section>

          {/* Energy Distribution Donut — fixed-size PieChart guarantees arcs render */}
          <section
            style={{ ...GLASS, padding: '20px 20px 16px' }}
            role="img"
            aria-label={`Energy distribution, campus totals: ${DONUT_DATA.map((d) => `${d.name} ${d.value} percent`).join(', ')}.`}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
              <div style={PANEL_TITLE}>Energy Distribution</div>
              <span style={{
                fontSize: 9, padding: '2px 8px', borderRadius: 10,
                background: 'rgba(14,165,233,0.1)', color: 'var(--text-muted)',
                border: '1px solid rgba(14,165,233,0.22)',
                fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.05em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>
                Campus totals
              </span>
            </div>

            {/* Fixed-dimension wrapper + non-responsive PieChart = no 0-size first paint */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', height: DONUT_SIZE }}>
              {donutValid ? (
                <PieChart width={DONUT_SIZE} height={DONUT_SIZE}>
                  <Pie
                    data={DONUT_DATA}
                    cx={DONUT_SIZE / 2}
                    cy={DONUT_SIZE / 2}
                    innerRadius={52}
                    outerRadius={80}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="#0a1929"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {DONUT_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        const { cx, cy } = viewBox
                        return (
                          <g>
                            <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
                              style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 19, fontWeight: 700, fill: '#22d3ee' }}>
                              {selfConsumed.value}%
                            </text>
                            <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
                              style={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--text-muted)' }}>
                              Self-used
                            </text>
                          </g>
                        )
                      }}
                    />
                  </Pie>
                </PieChart>
              ) : (
                // Fallback: segmented bar if the pie can't render (empty/invalid data)
                <div style={{ width: '100%', alignSelf: 'center' }}>
                  <div style={{ display: 'flex', height: 18, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {DONUT_DATA.map((d) => (
                      <div key={d.name} title={`${d.name} ${d.value}%`} style={{ width: `${d.value}%`, background: d.color }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
              {DONUT_DATA.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text)' }}>
                    {d.value}%
                  </span>
                </div>
              ))}
            </div>

            {/* Visually-hidden table alternative */}
            <div style={SR_ONLY}><table>
              <caption>Energy distribution share</caption>
              <thead><tr><th scope="col">Category</th><th scope="col">Share %</th></tr></thead>
              <tbody>
                {DONUT_DATA.map((d) => (
                  <tr key={d.name}><th scope="row">{d.name}</th><td>{d.value}</td></tr>
                ))}
              </tbody>
            </table></div>
          </section>

          {/* AI Insights — owned by another agent for data; presentation cleaned of banned side-stripe */}
          <section style={{ ...GLASS, padding: '20px', display: 'flex', flexDirection: 'column' }} aria-label="AI insights">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(99,102,241,0.4)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="white" />
                  </svg>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>AI Insights</span>
                <span style={{
                  fontSize: 9, padding: '2px 8px', borderRadius: 10,
                  background: 'rgba(99,102,241,0.2)', color: '#818cf8',
                  border: '1px solid rgba(99,102,241,0.35)',
                  fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.06em',
                }}>BETA</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)', paddingLeft: 36 }}>
                Powered by SolarIQ Intelligence
              </div>
            </div>

            {/* Insight cards — full hairline border + faint tint (no banned side-stripe) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>
              {AI_INSIGHTS.map((insight) => (
                <div
                  key={insight.tag}
                  style={{
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.025)',
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5,
                  }}>
                    <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: insight.color, flexShrink: 0 }} />
                    <span style={{
                      fontSize: 9, fontFamily: 'var(--font-body)', fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
                    }}>
                      {insight.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                    {insight.body}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </motion.div>

        {/* ── Chart Row 3: Monthly + Economics ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
        >
          {/* Monthly Production */}
          <section
            style={{ ...GLASS, padding: '20px 20px 16px' }}
            role="img"
            aria-label={`${monthlyMeta.title} for ${buildingLabel}. ${monthlyCaption.current} is the latest actual month; ${monthlyCaption.forecastRange === 'All months actual' ? 'all months are actual' : `${monthlyCaption.forecastRange.replace(' forecast', '')} are forecast`}.`}
          >
            <div style={{ ...PANEL_TITLE, marginBottom: 18 }}>
              {monthlyMeta.title}
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly} margin={{ top: 12, right: 4, left: -14, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.5)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                  tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                  tickLine={false} axisLine={false}
                  domain={[Math.floor(monthlyMin * 0.9), Math.ceil(monthlyMax * 1.05)]}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT}
                  itemStyle={TOOLTIP_ITEM}
                  wrapperStyle={TOOLTIP_WRAPPER}
                  formatter={(v, _name, props) => [
                    <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{`${v.toLocaleString()} kWh`}</span>,
                    props?.payload?.status || (props.index > CURRENT_MONTH_IDX ? 'Forecast' : 'Actual'),
                  ]}
                  labelStyle={TOOLTIP_LABEL}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="kwh" shape={<MonthBar />} />
              </BarChart>
            </ResponsiveContainer>

            <div style={{
              marginTop: 10, fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-body)',
              textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span aria-hidden="true" style={{ color: 'var(--accent)' }}>★</span>
              {monthlyCaption.current} — Peak month YTD &nbsp;·&nbsp;
              <span style={{ color: 'var(--text-dim)' }}>{monthlyCaption.forecastRange}{monthlyCaption.forecastRange !== 'All months actual' && ' (dashed)'}</span>
            </div>

            {/* Visually-hidden table alternative — includes Actual/Forecast status */}
            <div style={SR_ONLY}><table>
              <caption>{monthlyMeta.title} (kWh) for {buildingLabel}, with actual versus forecast status</caption>
              <thead><tr><th scope="col">Month</th><th scope="col">Production kWh</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {monthly.map((d) => (
                  <tr key={d.month}>
                    <th scope="row">{d.month}</th>
                    <td>{d.kwh.toLocaleString()}</td>
                    <td>{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </section>

          {/* Economics Summary — system cost + annual savings scale by building share */}
          <section style={{ ...GLASS, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }} aria-label={`Economics summary, ${economics.scope}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={PANEL_TITLE}>Economics Summary</div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', letterSpacing: '0.03em' }}>
                  {economics.scope}
                </span>
              </div>
              <button
                onClick={handleEconomicsCsv}
                aria-label="Export economics figures as CSV"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 11px', borderRadius: 7, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 500,
                  color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                CSV
              </button>
            </div>

            {/* 2×2 stats grid — neutral value color (no per-tile color overload) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'System Cost',    value: economics.systemCost },
                { label: 'Annual Savings', value: economics.annualSavings, accent: 'var(--positive)' },
                { label: 'Grid Tariff',    value: economics.tariff },
                { label: 'CO₂ Factor',     value: economics.co2Factor },
              ].map((s) => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 15, fontWeight: 700, color: s.accent || 'var(--text)', lineHeight: 1, letterSpacing: '-0.01em' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Payback progress bar — transform-based fill (scaleX), not width animation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
                  Payback Progress
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                  Year <span className="mono-num">{economics.currentYear}</span> of <span className="mono-num">{economics.paybackYears}</span>
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={economics.currentYear}
                aria-valuemin={0}
                aria-valuemax={economics.paybackYears}
                aria-label="Payback progress in years"
                style={{
                  position: 'relative', height: 10, borderRadius: 6,
                  background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
                }}
              >
                {/* Fill grows via a pure-CSS keyframe (no JS timer / re-render), so the
                    other charts' mount animation is never interrupted mid-flight. */}
                <div className="pb-fill" style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                  boxShadow: '0 0 8px rgba(245,158,11,0.5)',
                  '--pb-target': economics.currentYear / economics.paybackYears,
                }} />
              </div>

              {/* Milestone ticks — derived from paybackYears so they never detach
                  from the data: a few evenly-spaced integer years plus a final
                  tick at the exact payback value. */}
              <div style={{ position: 'relative', height: 20, marginTop: 6 }}>
                {paybackTicks.map((yr) => {
                  const pct = (yr / economics.paybackYears) * 100
                  return (
                    <div key={yr} style={{
                      position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}>
                      <div style={{ width: 1, height: 5, background: 'var(--border)' }} />
                      <span style={{ fontSize: 9, color: yr === economics.paybackYears ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        Yr {yr}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </motion.div>

      </div>
    </motion.div>
  )
}
