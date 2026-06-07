import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, ReferenceLine,
} from 'recharts'
import Icon from '../components/UI/Icon'

// ── Semantic colors (CSS vars — no raw hex for meaning) ──────
const C = {
  primary:  'var(--primary)',   // production / action
  accent:   'var(--accent)',    // energy / consumption / amber
  success:  'var(--success)',   // cyan — positive data series
  positive: 'var(--positive)',  // green — "up / good"
  danger:   'var(--danger)',    // red — high severity / negative only
  warning:  'var(--warning)',   // amber — medium severity
}

// ── Hardcoded forecast data (Apr 18–24) ──────────────────────
const forecastData = [
  { date: 'Apr 18', day: 'Fri', weather: 'Clear',        high: 39, low: 26, ghi: 1020, production: 2280, consumption: 1890, confidence: [2160, 2400] },
  { date: 'Apr 19', day: 'Sat', weather: 'Clear',        high: 40, low: 27, ghi: 1040, production: 2340, consumption: 1720, confidence: [2220, 2460] },
  { date: 'Apr 20', day: 'Sun', weather: 'Clear',        high: 38, low: 25, ghi: 990,  production: 2200, consumption: 1680, confidence: [2080, 2320] },
  { date: 'Apr 21', day: 'Mon', weather: 'Partly Cloudy',high: 36, low: 24, ghi: 820,  production: 1850, consumption: 1920, confidence: [1680, 2020] },
  { date: 'Apr 22', day: 'Tue', weather: 'Partly Cloudy',high: 35, low: 23, ghi: 780,  production: 1780, consumption: 1900, confidence: [1600, 1960] },
  { date: 'Apr 23', day: 'Wed', weather: 'Clear',        high: 37, low: 25, ghi: 960,  production: 2150, consumption: 1860, confidence: [2030, 2270] },
  { date: 'Apr 24', day: 'Thu', weather: 'Clear',        high: 39, low: 26, ghi: 1010, production: 2260, consumption: 1880, confidence: [2140, 2380] },
]

const chartData = forecastData.map(d => ({
  label:       `${d.day} ${d.date}`,
  production:  d.production,
  consumption: d.consumption,
  netExport:   d.production - d.consumption,
  ghi:         d.ghi,
  confLow:     d.confidence[0],
  // stacked-area trick: a transparent base at confLow + a visible band of height (confHigh − confLow)
  confBand:    d.confidence[1] - d.confidence[0],
  confHigh:    d.confidence[1],
  isDust:      d.weather === 'Partly Cloudy',
}))

const horizonData = [
  { month: 'May',  yield: 92000 },
  { month: 'Jun',  yield: 98000 },
  { month: 'Jul',  yield: 95000 },
  { month: 'Aug',  yield: 94000 },
  { month: 'Sep',  yield: 88000 },
  { month: 'Oct',  yield: 76000 },
  { month: 'Nov',  yield: 64000 },
  { month: 'Dec',  yield: 56000 },
]

const BUILDINGS = [
  { id: 'B01', name: 'Research Complex',  todayActual: 1140, tomorrowForecast: 1170, sevenDayTotal: 7854, confidence: 'High' },
  { id: 'B02', name: 'Admin Tower',       todayActual: 730,  tomorrowForecast: 748,  sevenDayTotal: 5027, confidence: 'High' },
  { id: 'B03', name: 'Lab Block',         todayActual: 638,  tomorrowForecast: 655,  sevenDayTotal: 4401, confidence: 'Medium' },
  { id: 'B04', name: 'Parking Structure', todayActual: 1711, tomorrowForecast: 1755, sevenDayTotal: 11774, confidence: 'High' },
  { id: 'B05', name: 'QF Auditorium',     todayActual: 341,  tomorrowForecast: 350,  sevenDayTotal: 2350, confidence: 'Medium' },
]

// Confidence: color + icon + label, so meaning never rides on color alone.
const CONF_META = {
  High:   { color: C.success,  icon: 'check-circle',   short: 'Hi' },
  Medium: { color: C.warning,  icon: 'alert-triangle', short: 'Med' },
  Low:    { color: C.danger,   icon: 'x-circle',       short: 'Lo' },
}
const TOTAL_7DAY = forecastData.reduce((s, d) => s + d.production, 0)

// Hero delta: tomorrow's forecast (Apr 19) vs today's (Apr 18).
const TODAY = forecastData[0]
const TOMORROW = forecastData[1]
const DELTA_KWH = TOMORROW.production - TODAY.production
const DELTA_PCT = (DELTA_KWH / TODAY.production) * 100

// ── Weather icon helper ──────────────────────────────────────
function weatherIcon(w) {
  if (w === 'Clear')         return 'sun'
  if (w === 'Partly Cloudy') return 'cloud-sun'
  return 'wind'
}

// ── Custom tooltip for main chart ────────────────────────────
function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const get = key => payload.find(p => p.dataKey === key)?.value ?? '-'
  const prod = get('production'), cons = get('consumption'), net = get('netExport')
  const row = forecastData.find(d => `${d.day} ${d.date}` === label)
  const isImport = net < 0
  return (
    <div style={{
      background: '#0a1929', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{label}</div>
      <div style={{ color: C.primary, marginBottom: 2 }}>Production: <strong className="mono-num">{prod.toLocaleString()}</strong> kWh</div>
      {row && (
        <div style={{ color: 'var(--text-muted)', marginBottom: 2, fontSize: 11 }}>
          Forecast range: <strong className="mono-num">{row.confidence[0].toLocaleString()}–{row.confidence[1].toLocaleString()}</strong>
          {' '}<span className="mono-num" style={{ color: 'var(--text-dim)' }}>(±{Math.round((row.confidence[1] - row.confidence[0]) / 2)})</span>
        </div>
      )}
      <div style={{ color: C.accent, marginBottom: 2 }}>Consumption: <strong className="mono-num">{cons.toLocaleString()}</strong> kWh</div>
      <div style={{ color: isImport ? C.danger : C.positive }}>
        {/* non-color cue: explicit word, not just hue; green matches the net-export line */}
        {isImport ? 'Grid import' : 'Net export'}: <strong className="mono-num">{net > 0 ? '+' : ''}{net.toLocaleString()}</strong> kWh
      </div>
    </div>
  )
}

// ── GHI tooltip ───────────────────────────────────────────────
function GHITooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0a1929', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: C.accent }}>GHI: <strong className="mono-num">{payload[0]?.value}</strong> W/m²</div>
    </div>
  )
}

// ── Info tooltip ─────────────────────────────────────────────
// A small "i" affordance that defines a jargon term in plain language for a
// non-technical exec. Keyboard-focusable and hover-reveal; the tooltip text is
// also the accessible name (aria-label + title), so it's never color-only and
// readable to assistive tech even if the visual popover doesn't render.
function InfoTip({ label }) {
  return (
    <span className="fc-infotip" style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <button
        type="button"
        aria-label={label}
        title={label}
        style={{
          width: 16, height: 16, borderRadius: '50%', padding: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(126,168,201,0.12)', border: '1px solid rgba(126,168,201,0.4)',
          color: 'var(--text-muted)', cursor: 'help', flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <line x1="12" y1="11" x2="12" y2="16" />
          <circle cx="12" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <span role="tooltip" className="fc-infotip-pop" style={{
        position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 30,
        width: 240, padding: '9px 11px', borderRadius: 8,
        background: '#0a1929', border: '1px solid var(--border)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        fontSize: 11.5, lineHeight: 1.5, fontWeight: 400,
        color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 'normal',
        opacity: 0, visibility: 'hidden', transition: 'opacity 0.15s ease',
        pointerEvents: 'none',
      }}>{label}</span>
    </span>
  )
}

// ── Panel wrapper ─────────────────────────────────────────────
function Panel({ title, desc, info, children, style }) {
  return (
    <div className="fc-panel" style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
      borderRadius: 12, padding: 20, ...style }}>
      {(title || desc) && (
        <div style={{ marginBottom: 16 }}>
          {title && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
              {info && <InfoTip label={info} />}
            </div>
          )}
          {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// ── KPI card (secondary tier) ────────────────────────────────
// These sit beside the "Tomorrow vs Today" hero, so they are intentionally
// demoted: a thinner accent edge (a left hairline, not a heavy top stripe) and
// a smaller value face. The hero and the 7-Day chart own the fold; these read
// as supporting context, not four more headlines.
// `badgeColor` lets the badge carry severity (amber=medium) independently of
// the accent edge, so a "Medium" risk never gets a red border.
function KPICard({ label, value, sub, accent, badge, badgeColor = C.warning, badgeIcon }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)), rgba(13,31,56,0.45)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
      borderLeft: `2px solid ${accent}`, borderRadius: 8, padding: '13px 15px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 17, fontWeight: 700, color: 'var(--text)', lineHeight: 1.05, letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {badge ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
            background: `color-mix(in srgb, ${badgeColor} 16%, transparent)`,
            border: `1px solid color-mix(in srgb, ${badgeColor} 36%, transparent)`,
            color: badgeColor,
          }}>
            {badgeIcon && <Icon name={badgeIcon} size={11} color={badgeColor} />}
            {badge}
          </span>
        ) : null}
        {sub}
      </div>
    </div>
  )
}

// ── Hero stat: the one number a glancing executive should read first ──
function HeroDelta() {
  const up = DELTA_KWH >= 0
  const color = up ? C.positive : C.danger
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
      borderTop: `3px solid ${C.accent}`, borderRadius: 10, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
    }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
        Tomorrow vs Today
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 33, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em' }}>
          <Icon name="trending-up" size={26} color={color} style={{ transform: up ? 'none' : 'scaleY(-1)' }} />
          {up ? '+' : ''}{DELTA_PCT.toFixed(1)}%
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <span className="mono-num">{up ? '+' : ''}{DELTA_KWH.toLocaleString()}</span> kWh · {TOMORROW.day} {TOMORROW.date}
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Forecast <strong className="mono-num" style={{ color: 'var(--text)' }}>{TOMORROW.production.toLocaleString()}</strong> <strong style={{ color: 'var(--text)' }}>kWh</strong> tomorrow,
        up from <span className="mono-num">{TODAY.production.toLocaleString()}</span> kWh today.
      </div>
    </div>
  )
}

// ── Loading skeleton ─────────────────────────────────────────
function SkeletonBlock({ height = 16, width = '100%', radius = 6 }) {
  return (
    <div style={{
      height, width, borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(126,168,201,0.08) 25%, rgba(126,168,201,0.18) 50%, rgba(126,168,201,0.08) 75%)',
      backgroundSize: '200% 100%',
      animation: 'fc-shimmer 1.4s ease-in-out infinite',
    }} />
  )
}

function LoadingState() {
  return (
    <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Loading forecast…</span>
      <div className="fc-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ background: 'var(--glass-bg)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SkeletonBlock height={11} width="60%" />
            <SkeletonBlock height={24} width="80%" />
            <SkeletonBlock height={12} width="50%" />
          </div>
        ))}
      </div>
      <Panel>
        <SkeletonBlock height={18} width="30%" />
        <div style={{ height: 12 }} />
        <SkeletonBlock height={280} radius={10} />
      </Panel>
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────
function EmptyState() {
  return (
    <Panel style={{ textAlign: 'center', padding: '56px 24px' }}>
      <Icon name="calendar" size={40} color="var(--text-dim)" />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text)', marginTop: 14, marginBottom: 6 }}>
        No forecast available
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto' }}>
        There is no forecast for the selected horizon yet. New forecasts are generated as fresh weather and production data arrive.
      </div>
    </Panel>
  )
}

// ── Error state ──────────────────────────────────────────────
function ErrorState({ onRetry }) {
  return (
    <Panel style={{ textAlign: 'center', padding: '56px 24px' }}>
      <Icon name="alert-triangle" size={40} color={C.danger} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text)', marginTop: 14, marginBottom: 6 }}>
        Couldn't load the forecast
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto 18px' }}>
        The forecast service didn't respond. Check the connection and try again.
      </div>
      <button
        onClick={onRetry}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 20px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.35)',
          color: 'var(--primary)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
        }}
      >
        <Icon name="refresh-cw" size={15} color="var(--primary)" />
        Retry
      </button>
    </Panel>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function Forecasting() {
  // Demo: simulate the /api/forecast lifecycle so loading/empty/error/freshness
  // all render real states even without a backend.
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'empty' | 'error'
  const [generatedAt, setGeneratedAt] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    const t = setTimeout(() => {
      if (cancelled) return
      // Demo data always resolves to a populated forecast.
      setStatus('ready')
      setGeneratedAt(new Date())
    }, 650)
    return () => { cancelled = true; clearTimeout(t) }
  }, [])

  const retry = () => {
    setStatus('loading')
    setTimeout(() => { setStatus('ready'); setGeneratedAt(new Date()) }, 650)
  }

  const freshness = generatedAt
    ? generatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '—'

  const sharedStyle = (
    <style>{`
      @media (max-width: 900px) {
        .fc-kpi   { grid-template-columns: repeat(2,1fr) !important; }
        .fc-hero  { grid-template-columns: 1fr !important; }
        .fc-mid   { grid-template-columns: 1fr !important; }
        .fc-bot   { grid-template-columns: 1fr !important; }
      }
      @keyframes fc-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      /* Info tooltip: reveal popover on hover or keyboard focus (not color-only) */
      .fc-infotip:hover .fc-infotip-pop,
      .fc-infotip:focus-within .fc-infotip-pop {
        opacity: 1 !important;
        visibility: visible !important;
      }
      .fc-infotip button:hover,
      .fc-infotip button:focus-visible {
        background: rgba(126,168,201,0.22) !important;
        color: var(--text) !important;
      }
      /* Lift the hovered panel above its grid neighbours so an open info tooltip
         is never clipped behind the next card's stacking context. */
      .fc-panel { position: relative; }
      .fc-panel:hover, .fc-panel:focus-within { z-index: 6; }
    `}</style>
  )

  if (status === 'loading') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative' }}>
        {sharedStyle}
        <LoadingState />
      </motion.div>
    )
  }
  if (status === 'error') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {sharedStyle}
        <ErrorState onRetry={retry} />
      </motion.div>
    )
  }
  if (status === 'empty') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {sharedStyle}
        <EmptyState />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {sharedStyle}

      {/* ── Hero + KPI Strip ── */}
      <div className="fc-hero" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <HeroDelta />
        <div className="fc-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <KPICard
            label="7-Day Projected Yield"
            value={<>{TOTAL_7DAY.toLocaleString()} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>kWh</span></>}
            sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.positive }}><Icon name="trending-up" size={13} color={C.positive} />vs last week</span>}
            accent="var(--primary)"
          />
          <KPICard
            label="Dust Event Risk"
            value={<span style={{ fontFamily: 'var(--font-display)', letterSpacing: 'normal', color: C.warning }}>Tue, Apr 22</span>}
            sub={<>Soiling <span className="mono-num">−12–15%</span></>}
            badge="Medium"
            badgeColor={C.warning}
            badgeIcon="alert-triangle"
            accent="var(--warning)"
          />
          <KPICard
            label="Forecast Confidence"
            value="82%"
            sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="check-circle" size={13} color={C.success} />7-day average</span>}
            accent="var(--success)"
          />
          <KPICard
            label="Peak Day"
            value={<span style={{ fontFamily: 'var(--font-display)', letterSpacing: 'normal' }}>Sat, Apr 19</span>}
            sub={<><span className="mono-num">2,340</span> kWh</>}
            accent="var(--accent)"
          />
        </div>
      </div>

      {/* ── Main 7-Day Forecast Panel ── */}
      <Panel style={{ padding: 24 }}>
        {/* Header with legend + freshness */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                7-Day Forecast
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
                padding: '3px 9px', borderRadius: 'var(--radius-full)',
                background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.22)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                Generated {freshness}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Predicted Production vs Consumption · Net Export to Grid</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 18, height: 11, borderRadius: 2, flexShrink: 0,
                background: 'rgba(126,168,201,0.22)',
                border: '1px dashed rgba(126,168,201,0.9)',
              }} aria-hidden="true" />
              shaded band = forecast range (P10–P90)
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
            <LegendBand label="Forecast range" />
            <LegendLineMarker color="var(--accent)" label="Production" />
            <LegendLineMarker color="var(--primary)" label="Consumption" />
            <LegendLineMarker color="var(--positive)" label="Net Export" dashed />
          </div>
        </div>

        {/* Weather strip — folded into the chart header as a quiet, flat sub-row
            (no glass shadow / per-cell blur) so it reads as axis context for the
            chart below, not seven more focal cards competing with the hero. */}
        <div style={{
          display: 'flex', gap: 1, marginBottom: 12, borderRadius: 6, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {forecastData.map(d => {
            const cloudy = d.weather === 'Partly Cloudy'
            return (
              <div key={d.date} style={{
                flex: 1, textAlign: 'center', padding: '6px 4px',
                background: cloudy ? 'rgba(245,158,11,0.08)' : 'rgba(30,58,95,0.3)',
                fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontWeight: 600, color: cloudy ? 'var(--warning)' : 'var(--text-muted)', fontSize: 11 }}>{d.day} {d.date.split(' ')[1]}</span>
                <span style={{ lineHeight: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={weatherIcon(d.weather)} size={16} color={cloudy ? 'var(--warning)' : 'var(--accent)'} />
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}><span className="mono-num">{d.high}°</span> · <span className="mono-num">{d.ghi}</span><span style={{ fontSize: 10 }}> W/m²</span></span>
              </div>
            )
          })}
        </div>

        {/* ComposedChart — slate confidence band drawn behind the consumption bar and
            the production line, so the uncertainty range reads as the headline feature */}
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} stackOffset="none">
            <CartesianGrid stroke="var(--border)" vertical={false} />
            {/* Day-of-week only — the weather strip directly above owns the date,
                so the axis doesn't double-render "Apr 18" under "Fri 18". */}
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={l => l.split(' ')[0]} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={48}
              tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<ForecastTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />

            {/* Confidence band: invisible base to confLow, then a translucent slate band of
                height confHigh−confLow (tied to the production series). Both share a stackId
                so the band floats at the right level. The fill is a cool grey-blue —
                deliberately a different hue from the sky-blue production series — so the
                uncertainty range never disappears into the production bars. */}
            <Area dataKey="confLow" stackId="conf" stroke="none" fill="none"
              isAnimationActive={false} legendType="none" activeDot={false} tooltipType="none" />
            <Area dataKey="confBand" stackId="conf" name="Forecast range"
              stroke="rgba(126,168,201,0.9)" strokeWidth={1.5} strokeDasharray="5 3"
              fill="rgba(126,168,201,0.22)" isAnimationActive={false} activeDot={false} tooltipType="none" />

            {/* All three series are lines so the slate band stays visible behind them.
                Production is the bold amber series (amber = energy) and reads as the hero,
                sitting inside its own forecast band; consumption recedes as a thin cool
                line; net-export is a dashed GREEN line (green = the positive
                outcome of exporting to grid; frees cyan for status only). No amber-flood bars. */}
            <Line dataKey="consumption" name="Consumption" stroke="var(--primary)" strokeWidth={1.75}
              dot={false} activeDot={{ r: 4 }} type="monotone" opacity={0.85} />
            <Line dataKey="production" name="Production" stroke="var(--accent)" strokeWidth={2.75}
              dot={{ fill: '#0a1929', stroke: 'var(--accent)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 5 }} type="monotone" />
            <Line dataKey="netExport" name="Net Export" stroke="var(--positive)" strokeWidth={2} strokeDasharray="5 4"
              dot={{ fill: '#0a1929', stroke: 'var(--positive)', strokeWidth: 2, r: 3 }} activeDot={{ r: 4 }} type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      {/* ── Middle row: Irradiance + Alerts ── */}
      <div className="fc-mid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

        <Panel title="Irradiance Forecast" desc="Predicted GHI (W/m²) — optimal threshold at 850 W/m²"
          info="GHI = Global Horizontal Irradiance: the total sunlight energy hitting a flat surface, in watts per square metre. More GHI means more solar power.">

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ghiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={l => l.split(' ')[0]} />
              <YAxis domain={[0, 1100]} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={40}
                tickFormatter={v => `${v}`} />
              <Tooltip content={<GHITooltip />} cursor={{ stroke: 'var(--border)' }} />
              {/* Optimal threshold: long-dash, heavier weight — visually distinct from the
                  short-dash Net-Export reference on the main chart. */}
              <ReferenceLine y={850} stroke="var(--text-muted)" strokeDasharray="10 5" strokeWidth={1.5}
                label={{ value: 'Optimal 850', position: 'insideTopRight', fill: 'var(--text-muted)', fontSize: 11 }} />
              <Area dataKey="ghi" stroke="var(--accent)" strokeWidth={2} fill="url(#ghiGrad)"
                dot={{ fill: '#0a1929', stroke: 'var(--accent)', strokeWidth: 1.5, r: 3 }} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Risk & Alerts" desc="Forecast risk flags for the week">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AlertCard severity="Medium" color={C.warning} icon="wind" title="Dust Event — Tue Apr 22"
              desc="Moderate soiling forecast. Predicted output reduction: 12–15%. Pre-cleaning Mon Apr 21 recommended." />
            <AlertCard severity="High" color={C.danger} icon="zap" title="Grid Import Risk — Mon & Tue"
              desc="Net consumption will exceed production (~70–120 kWh). Grid draw expected 13:00–17:00." />
            <AlertCard severity="Medium" color={C.warning} icon="thermometer" title="Temperature Peak — Sat Apr 19"
              desc="Ambient temp 40°C. Panel temp correction reduces output ~2.1% vs standard. Monitor inverters." />
            <AlertCard severity="Positive" color={C.success} icon="check-circle" title="Weekend Surplus — Sat & Sun"
              desc="Low campus occupancy. Expect 500–620 kWh daily export surplus. Consider DSM or storage." />
          </div>
        </Panel>
      </div>

      {/* ── Bottom row: Horizon + Accuracy + Buildings ── */}
      <div className="fc-bot" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 20 }}>

        <Panel title="Monthly Forecast Horizon" desc="Projected yield May–Dec 2026">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={horizonData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={36}
                tickFormatter={v => `${v/1000}k`} />
              <Tooltip
                contentStyle={{ background: '#0a1929', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
                formatter={v => [
                  <span key="v" className="mono-num">{v.toLocaleString()} kWh</span>,
                  'Projected Yield',
                ]}
              />
              <Line dataKey="yield" stroke="var(--primary)" strokeWidth={2}
                dot={{ fill: 'var(--primary)', r: 3 }} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Forecast Accuracy" desc="Model error metrics (MAPE)"
          info="MAPE = Mean Absolute Percentage Error: the average % gap between forecast and actual output. Lower is better — 4% means forecasts are off by about 4% on average.">

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {[
              { label: 'Last 7-day MAPE',  val: '4.2%',  note: '',        good: true },
              { label: 'Last 30-day MAPE', val: '6.8%',  note: '',        good: true },
              { label: 'Best day error',   val: '1.1%',  note: '(clear)', good: true },
              { label: 'Worst day error',  val: '11.4%', note: '(dust)',  good: false },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(30,58,95,0.4)', borderRadius: 6,
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: 14, color: row.good ? C.positive : C.danger }}>
                  {/* non-color cue: icon marks good vs. flagged, not hue alone */}
                  <Icon name={row.good ? 'check-circle' : 'alert-triangle'} size={13} color={row.good ? C.positive : C.danger} />
                  <span className="mono-num">{row.val}</span> {row.note && <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-muted)' }}>{row.note}</span>}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Per-Building Forecast" desc="7-day production outlook per system">
          <div role="table" aria-label="Per-building forecast" style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4 }}>
            {/* Header */}
            <div role="row" style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 64px 52px', gap: 4, padding: '4px 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              <span>Building</span><span style={{ textAlign: 'right' }}>Today</span><span style={{ textAlign: 'right' }}>+1d</span><span style={{ textAlign: 'right' }}>7-Day</span><span style={{ textAlign: 'center' }}>Conf</span>
            </div>
            {BUILDINGS.map(b => {
              const cm = CONF_META[b.confidence]
              return (
                <div role="row" key={b.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 52px 52px 64px 52px', gap: 4,
                  padding: '8px 8px', background: 'rgba(30,58,95,0.3)', borderRadius: 6, alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.id}</div>
                  </div>
                  <div className="mono-num" style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{b.todayActual}</div>
                  <div className="mono-num" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, textAlign: 'right' }}>{b.tomorrowForecast}</div>
                  <div className="mono-num" style={{ fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{b.sevenDayTotal.toLocaleString()}</div>
                  <div style={{ textAlign: 'center' }}>
                    <span title={`${b.confidence} confidence`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: `color-mix(in srgb, ${cm.color} 15%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${cm.color} 40%, transparent)`,
                      color: cm.color,
                    }}>
                      <Icon name={cm.icon} size={10} color={cm.color} />{cm.short}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

      </div>

    </motion.div>
  )
}

// ── Local sub-components ──────────────────────────────────────
// Legend swatch for the translucent confidence band — a cool slate grey-blue,
// matched to the chart Area fill, deliberately distinct from the sky-blue series.
function LegendBand({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 16, height: 12, borderRadius: 2,
        background: 'rgba(126,168,201,0.22)',
        border: '1px dashed rgba(126,168,201,0.9)',
      }} />
      <span>{label}</span>
    </div>
  )
}

// Legend swatch for a line series with a dot marker. All three series share this
// marker style (line + centered dot) so the legend reads uniformly; `dashed`
// adds the non-color cue for Net Export, matching its dashed stroke in the chart.
function LegendLineMarker({ color, label, dashed = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width="18" height="10" aria-hidden="true">
        <line x1="0" y1="5" x2="18" y2="5" stroke={color} strokeWidth="2.5"
          strokeDasharray={dashed ? '4 3' : undefined} />
        <circle cx="9" cy="5" r="3" fill="#0a1929" stroke={color} strokeWidth="2" />
      </svg>
      <span>{label}</span>
    </div>
  )
}

// Flat (non-glass) inner card — avoids nesting glass inside the Risk panel,
// and uses a leading severity chip instead of the banned left side-stripe.
function AlertCard({ severity, color, icon, title, desc }) {
  return (
    <div style={{
      padding: '11px 14px', borderRadius: 8,
      background: 'rgba(30,58,95,0.4)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <Icon name={icon} color={color} size={17} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
          background: `color-mix(in srgb, ${color} 15%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 38%, transparent)`,
          color,
        }}>{severity}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}
