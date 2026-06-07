import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'

// AI-exclusive indigo accent — the page's identity color (action links, BETA, tabs).
// Severity is NEVER carried by this color — it is derived from priority below.
const AI        = '#6366f1'
const AI_DIM    = 'rgba(99,102,241,0.15)'
const AI_BORDER = 'rgba(99,102,241,0.30)'

const TABS = [
  { key: 'all',         label: 'All Insights' },
  { key: 'load',        label: 'Load Optimization' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'forecasting', label: 'Forecasting' },
  { key: 'economics',   label: 'Economics' },
]

const SORTS = [
  { key: 'priority',   label: 'Priority' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'impact',     label: 'QAR impact' },
]

// Label for the featured hero so its "why am I on top" reason is explicit,
// keyed to whichever metric is currently driving the sort.
const HERO_LABEL = {
  priority:   'Top priority this week',
  confidence: 'Top by confidence',
  impact:     'Top by QAR impact',
}

// ── Insight dataset ──────────────────────────────────────────
// Numeric triage fields drive sorting and the executive summary:
//   priorityRank  3=High · 2=Medium · 1=Low
//   confidence    model confidence (number)
//   impactQar     QAR/year at stake (0 = informational, no direct QAR)
const INSIGHTS = [
  {
    id: 1, tab: 'load',
    title: 'Load Shift Opportunity', category: 'Optimization',
    priority: 'High', priorityRank: 3, confidence: 91, impactQar: 26400,
    body: 'Pre-cool HVAC in B01 Research Complex and B03 Lab Block between 11:00–13:00 to absorb peak solar generation and shift AC load away from grid-import hours.',
    impact: 'Reduce grid exports by 18% — save ~2,200 QAR/month',
    impactIcon: 'wave', action: 'Apply Recommendation',
  },
  {
    id: 2, tab: 'maintenance',
    title: 'Predictive Maintenance Alert', category: 'Maintenance',
    priority: 'High', priorityRank: 3, confidence: 89, impactQar: 18600,
    body: 'String inverter #4 on Admin Tower B02 showing 6.2% degradation vs baseline. Efficiency dropped to 91.6% over the past 14 days — trending toward failure threshold.',
    impact: 'Schedule inspection within 14 days — prevent ~51 kWh/day loss',
    impactIcon: 'alert', action: 'View Details',
  },
  {
    id: 3, tab: 'forecasting',
    title: 'Weather-Adjusted Forecast', category: 'Forecasting',
    priority: 'Medium', priorityRank: 2, confidence: 78, impactQar: 0,
    body: 'Partly cloudy conditions expected Apr 14–16. Predicted generation: 1,850–2,100 kWh/day. Self-consumption rate may improve to 78% during this low-irradiance window.',
    impact: 'Generation 8–12% below clear-sky baseline for 3 days',
    impactIcon: 'chart', action: 'View Forecast',
  },
  {
    id: 4, tab: 'maintenance',
    title: 'Panel Cleaning Schedule', category: 'Maintenance',
    priority: 'Medium', priorityRank: 2, confidence: 82, impactQar: 12800,
    body: 'Dust soiling detected on B01 Research Complex arrays. Efficiency drop: 4.2% over 12 days. Qatar dust model recommends cleaning every 8 days vs current 14-day schedule.',
    impact: 'Schedule within 3 days — recover +4.8% annual production',
    impactIcon: 'star', action: 'Apply Recommendation',
  },
  {
    id: 5, tab: 'load',
    title: 'Peak Shaving Opportunity', category: 'Optimization',
    priority: 'Low', priorityRank: 1, confidence: 76, impactQar: 6200,
    body: 'B04 Parking Structure consistently over-generates 12:00–14:00. Routing excess to on-site EV charging stations instead of grid export could increase self-consumption by 11%.',
    impact: 'Reduce grid export by ~340 kWh on peak days',
    impactIcon: 'chart', action: 'View Details',
  },
  {
    id: 6, tab: 'economics',
    title: 'Annual Performance Review', category: 'Economics',
    priority: 'Low', priorityRank: 1, confidence: 84, impactQar: 0,
    body: 'Campus-wide system performing at 94.3% of expected annual output. Top performer: B04 Parking Structure at 101.2% of target. B02 Admin Tower below target at 88.1% — investigate.',
    impact: 'Estimated savings: 576,000 QAR/year at current performance',
    impactIcon: 'dollar', action: 'View Full Report',
  },
  {
    id: 7, tab: 'forecasting',
    title: '7-Day Demand Forecast', category: 'Forecasting',
    priority: 'Medium', priorityRank: 2, confidence: 85, impactQar: 16800,
    body: 'Campus consumption predicted at 14,200–15,800 kWh/day over the next 7 days. Tue and Wed show highest load from lab equipment cycles — ideal windows for shifting HVAC pre-cooling into solar peak hours.',
    impact: '2 high-demand days identified — load shift could save ~1,400 QAR',
    impactIcon: 'chart', action: 'View Demand Curve',
  },
  {
    id: 8, tab: 'forecasting',
    title: 'Dust Storm Advisory', category: 'Forecasting',
    priority: 'High', priorityRank: 3, confidence: 81, impactQar: 14200,
    body: 'Regional sandstorm forecast for Apr 22 (24–36 hour window). Expected generation drop: 35–45% during event, with residual soiling cutting 8–10% for 3 days post-event until cleaning.',
    impact: 'Stage cleaning crew Apr 23 — recover ~220 kWh/day faster',
    impactIcon: 'alert', action: 'View Mitigation Plan',
  },
  {
    id: 9, tab: 'forecasting',
    title: 'Seasonal Production Shift', category: 'Forecasting',
    priority: 'Low', priorityRank: 1, confidence: 93, impactQar: 0,
    body: 'Qatar GHI model projects summer peak (Jun–Aug) at ~2,650 kWh/day average, with winter dip (Dec–Jan) to ~1,720 kWh/day. Annual production trajectory: 782 MWh campus-wide.',
    impact: 'On track for 103% of first-year target',
    impactIcon: 'chart', action: 'View Seasonal Model',
  },
  {
    id: 10, tab: 'economics',
    title: 'Tariff Optimization Opportunity', category: 'Economics',
    priority: 'Medium', priorityRank: 2, confidence: 87, impactQar: 54000,
    body: 'Current flat tariff: 0.18 QAR/kWh. Simulated time-of-use (ToU) tariff with 0.26 QAR/kWh peak rate would raise grid-export value during 11:00–15:00 solar peak, where 64% of export currently occurs.',
    impact: 'Potential +9.4% annual savings — ~54,000 QAR/year',
    impactIcon: 'dollar', action: 'Run Tariff Simulation',
  },
]

const PERF_STATS = [
  { label: 'Insights Today',          val: '12',           color: AI },
  { label: 'Recommendations Applied', val: '3',            color: 'var(--positive)' },
  { label: 'AI-Driven Savings',       val: '4,800 QAR/mo', color: 'var(--accent)' },
  { label: 'Anomalies This Week',     val: '2',            color: 'var(--danger)' },
]

// ── Semantic severity system ─────────────────────────────────
// ONE color per priority, plus a non-color glyph so severity is never
// color-only. High=danger, Medium=warning/amber, Low=muted.
const SEVERITY = {
  High:   { color: 'var(--danger)',     glyph: 'triangle', rank: 3 },
  Medium: { color: 'var(--warning)',    glyph: 'circle',   rank: 2 },
  Low:    { color: 'var(--text-muted)', glyph: 'dot',      rank: 1 },
}

// ── SVG impact icons (impact box only — neutral text-muted) ──
function ImpactIcon({ type, color }) {
  const p = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (type === 'wave')  return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  if (type === 'alert') return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  if (type === 'chart') return <svg {...p}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
  if (type === 'star')  return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  if (type === 'dollar') return <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  return null
}

// ── Severity glyph — non-color cue beside the priority label ─
function SeverityGlyph({ glyph, color }) {
  const p = { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '2.4', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (glyph === 'triangle') return <svg {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  if (glyph === 'circle')   return <svg {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  // low → filled dot
  return <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill={color}/></svg>
}

// ── Priority pill (carries severity: color + glyph + word) ───
function PriorityPill({ priority, size = 'md' }) {
  const sev = SEVERITY[priority] || SEVERITY.Low
  const pad = size === 'lg' ? '4px 11px' : '3px 8px'
  const fs  = size === 'lg' ? 12 : 11
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: fs, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: pad, borderRadius: 99,
      background: `color-mix(in srgb, ${sev.color} 16%, transparent)`,
      border: `1px solid color-mix(in srgb, ${sev.color} 42%, transparent)`,
      color: sev.color, whiteSpace: 'nowrap',
    }}>
      <SeverityGlyph glyph={sev.glyph} color={sev.color} />
      {priority} priority
    </span>
  )
}

// ── Confidence bar (single AI-indigo fill — never severity, never sky-blue) ──
// Deliberately aligned to the page's AI accent so confidence reads as an
// engine metric, not a clickable action. Avoids the two-blues clash of
// --primary (sky) sitting inside the indigo AI surface. A muted indigo fill
// keeps it as a measurement, not an affordance; severity is carried elsewhere.
function ConfidenceBar({ confidence }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
        <span>Confidence</span>
        <strong className="mono-num" style={{ color: 'var(--text)' }}>{confidence}%</strong>
      </div>
      <div
        role="progressbar" aria-label="Model confidence"
        aria-valuenow={confidence} aria-valuemin={0} aria-valuemax={100}
        style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}
      >
        <div style={{ width: `${confidence}%`, height: '100%', background: `color-mix(in srgb, ${AI} 72%, transparent)`, borderRadius: 2 }} />
      </div>
    </div>
  )
}

// ── Action button — wired to a demo-safe, REVERSIBLE acknowledgement ─────
// Once actioned, the button becomes a status chip carrying a small "Undo"
// control so the acknowledgement is never a one-way trap.
function ActionButton({ label, actioned, onAction, onUndo }) {
  if (actioned) {
    return (
      <span role="status" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 13, fontWeight: 600, color: 'var(--positive)',
        background: 'color-mix(in srgb, var(--positive) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--positive) 32%, transparent)',
        padding: '6px 8px 6px 12px', borderRadius: 'var(--radius-sm)',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {actioned}
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            aria-label={`Undo: ${actioned}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'transparent', cursor: 'pointer',
              border: '1px solid color-mix(in srgb, var(--positive) 36%, transparent)',
              borderRadius: 'var(--radius-sm)', padding: '2px 8px',
              color: 'var(--text-muted)', fontSize: 11.5, fontWeight: 600,
              fontFamily: 'inherit', transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--positive) 60%, transparent)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--positive) 36%, transparent)' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
            </svg>
            Undo
          </button>
        )}
      </span>
    )
  }
  return (
    <button
      onClick={onAction}
      style={{
        background: 'transparent', border: `1px solid ${AI_BORDER}`,
        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
        color: AI, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = AI_DIM; e.currentTarget.style.borderColor = AI }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = AI_BORDER }}
    >
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    </button>
  )
}

// ── Standard insight card ────────────────────────────────────
function InsightCard({ insight, actioned, onAction, onUndo }) {
  const { title, category, priority, confidence, body, impact, impactIcon, action } = insight
  const sev = SEVERITY[priority] || SEVERITY.Low
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)',
        // Edge signals severity ONLY via a 1px full-border color shift on hover — no stripe.
        border: `1px solid ${hovered ? `color-mix(in srgb, ${sev.color} 40%, var(--border))` : 'var(--border)'}`,
        borderRadius: 20, padding: 24, position: 'relative',
        display: 'flex', flexDirection: 'column', gap: 16,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
      }}
    >
      {/* Header: title + priority pill | category tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 8 }}>
            {title}
          </div>
          <PriorityPill priority={priority} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
          padding: '4px 10px', borderRadius: 12, flexShrink: 0,
          background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
        }}>{category}</span>
      </div>

      <ConfidenceBar confidence={confidence} />

      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
        {body}
      </p>

      {/* Impact box */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ImpactIcon type={impactIcon} color="var(--text-muted)" />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{impact}</span>
      </div>

      <ActionButton label={action} actioned={actioned} onAction={onAction} onUndo={onUndo} />
    </div>
  )
}

// ── Featured hero card (breaks the uniform grid; spans both cols) ──
function HeroInsightCard({ insight, actioned, onAction, onUndo, heroLabel }) {
  const { title, category, priority, confidence, body, impact, impactIcon, action, impactQar } = insight
  const sev = SEVERITY[priority] || SEVERITY.Low
  return (
    <div style={{
      gridColumn: '1 / -1',
      background: 'var(--surface)',
      border: `1px solid color-mix(in srgb, ${sev.color} 32%, var(--border))`,
      borderRadius: 20, padding: 24, position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Top badge (allowed edge cue — not a stripe) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: sev.color,
          background: `color-mix(in srgb, ${sev.color} 14%, transparent)`,
          border: `1px solid color-mix(in srgb, ${sev.color} 38%, transparent)`,
          padding: '4px 10px', borderRadius: 99,
        }}>
          <SeverityGlyph glyph={sev.glyph} color={sev.color} />
          {heroLabel}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
          padding: '4px 10px', borderRadius: 12,
          background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
        }}>{category}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* Left: headline + body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, margin: 0, letterSpacing: '-0.01em' }}>
              {title}
            </h2>
            <PriorityPill priority={priority} size="lg" />
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, maxWidth: '60ch' }}>
            {body}
          </p>
          <div style={{ marginTop: 4 }}>
            <ActionButton label={action} actioned={actioned} onAction={onAction} onUndo={onUndo} />
          </div>
        </div>

        {/* Right: impact + confidence panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
          {impactQar > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>QAR at stake / year</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                <span className="mono-num" style={{ fontVariantNumeric: 'tabular-nums' }}>{impactQar.toLocaleString()}</span> <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>QAR</span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <ImpactIcon type={impactIcon} color="var(--text-muted)" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.45 }}>{impact}</span>
          </div>
          <ConfidenceBar confidence={confidence} />
        </div>
      </div>
    </div>
  )
}

// ── Sort segmented control ───────────────────────────────────
function SortControl({ value, onChange }) {
  return (
    <div role="group" aria-label="Sort insights" style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: 3,
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort</span>
      {SORTS.map(s => {
        const active = value === s.key
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            aria-pressed={active}
            style={{
              fontSize: 12.5, fontWeight: active ? 600 : 500,
              color: active ? AI : 'var(--text-muted)',
              background: active ? AI_DIM : 'transparent',
              border: active ? `1px solid ${AI_BORDER}` : '1px solid transparent',
              padding: '5px 11px', borderRadius: 4, cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function AIInsights() {
  const [activeTab, setActiveTab] = useState('all')
  const [sortKey, setSortKey] = useState('priority')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState(false)
  // demo-safe action acknowledgements: { [id]: 'Applied' | 'Acknowledged' | ... }
  const [actioned, setActioned] = useState({})
  // Tracks whether the demo error has already been served once, so the path
  // recovers on retry instead of failing forever.
  const failedOnceRef = useRef(false)

  const filtered = useMemo(
    () => (activeTab === 'all' ? INSIGHTS : INSIGHTS.filter(i => i.tab === activeTab)),
    [activeTab],
  )

  // Default High→Low across whichever metric is selected.
  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sortKey === 'confidence') arr.sort((a, b) => b.confidence - a.confidence)
    else if (sortKey === 'impact') arr.sort((a, b) => b.impactQar - a.impactQar || b.priorityRank - a.priorityRank)
    else arr.sort((a, b) => b.priorityRank - a.priorityRank || b.confidence - a.confidence)
    return arr
  }, [filtered, sortKey])

  // Executive summary figures (always computed from the High-priority slice of all insights).
  const exec = useMemo(() => {
    const highs = INSIGHTS.filter(i => i.priority === 'High')
    const totalAtStake = INSIGHTS.reduce((sum, i) => sum + (i.impactQar || 0), 0)
    const topAction = [...highs].sort((a, b) => b.impactQar - a.impactQar)[0] || INSIGHTS[0]
    return { highCount: highs.length, totalAtStake, topAction }
  }, [])

  // Hero = the top item of whatever sort is active, so a featured card normally
  // shows (and its featured-ness is labelled by metric, e.g. "Top by confidence").
  // P2 fix: on Priority sort the exec-summary band already owns the "top action"
  // role with that insight's title/pill/impact. If the hero would be that SAME
  // insight, suppress it so the two don't restate each other in stacked prime
  // real estate — the grid then leads with the next-most-important item. The
  // hero still shows for confidence/impact sorts (different metric, no overlap).
  const heroSuppressed = sortKey === 'priority' && sorted[0] && sorted[0].id === exec.topAction.id
  const hero = heroSuppressed ? null : sorted[0] || null
  const rest = hero ? sorted.slice(1) : sorted

  function handleRefresh() {
    if (refreshing) return
    setRefreshError(false)
    setRefreshing(true)
    // Demo-safe but actually exercisable: simulate an engine round-trip that can
    // fail (engine-unreachable). Two ways to reach the failure path:
    //   1. ?simulateError=1 in the URL forces the engine to stay unreachable until
    //      the param is removed — useful for screenshots / QA of the error state.
    //   2. Otherwise the FIRST refresh of the session fails (transient), then any
    //      subsequent refresh / Retry succeeds — so the banner + Retry recover.
    const params = new URLSearchParams(window.location.search)
    const forceError = params.get('simulateError') === '1'
    const transientFail = forceError || !failedOnceRef.current
    setTimeout(() => {
      setRefreshing(false)
      if (transientFail) {
        if (!forceError) failedOnceRef.current = true // next attempt recovers
        setRefreshError(true)
      } else {
        setRefreshError(false)
      }
    }, 1200)
  }

  function actionLabelFor(insight) {
    const a = insight.action.toLowerCase()
    if (a.startsWith('apply')) return 'Recommendation applied'
    if (a.startsWith('run')) return 'Simulation queued'
    return 'Acknowledged'
  }

  function handleAction(insight) {
    setActioned(prev => ({ ...prev, [insight.id]: actionLabelFor(insight) }))
  }

  // Revert an acknowledgement — the action chip is a reversible toggle, never a trap.
  function handleUndo(insight) {
    setActioned(prev => {
      const next = { ...prev }
      delete next[insight.id]
      return next
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20, background: `radial-gradient(circle at top right, rgba(99,102,241,0.03), transparent 40%)` }}
    >

      {/* ── Engine status row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: AI, background: AI_DIM, border: `1px solid ${AI_BORDER}`, padding: '4px 10px', borderRadius: 12 }}>
            BETA
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: refreshError ? 'var(--danger)' : AI, boxShadow: `0 0 8px ${refreshError ? 'var(--danger)' : AI}`, animation: 'aiPulse 2s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {refreshError
                ? 'Engine unreachable — showing last cached insights'
                : 'Engine Active · Analyzing 5 buildings — 2,000 kWp total capacity'}
            </span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          aria-label="Refresh insights"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: `1px solid ${AI}`,
            color: AI, fontSize: 13, fontWeight: 500,
            padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
            opacity: refreshing ? 0.6 : 1, transition: 'background 0.15s, opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = AI_DIM}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {refreshing ? 'Refreshing…' : 'Refresh Insights'}
        </button>
      </div>

      {/* ── Refresh error banner (engine-unreachable) ── */}
      {refreshError && (
        <div role="alert" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          background: 'color-mix(in srgb, var(--danger) 9%, transparent)',
          border: '1px solid color-mix(in srgb, var(--danger) 36%, transparent)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
              Couldn't reach the intelligence engine. Insights below are the last successful run.
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            aria-busy={refreshing}
            style={{
              background: 'transparent', border: '1px solid color-mix(in srgb, var(--danger) 50%, transparent)',
              color: 'var(--danger)', fontSize: 12.5, fontWeight: 600,
              padding: '6px 12px', borderRadius: 'var(--radius-sm)',
              cursor: refreshing ? 'default' : 'pointer',
              opacity: refreshing ? 0.6 : 1, transition: 'opacity 0.15s',
            }}
          >
            {refreshing ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      )}

      {/* ── Executive summary hero ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) repeat(2, minmax(0, 1fr))', gap: 16,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderRight: '1px solid var(--border)', paddingRight: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Top action this week</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>
              {exec.topAction.title}
            </span>
            <PriorityPill priority={exec.topAction.priority} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{exec.topAction.impact}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Total QAR at stake</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span className="mono-num" style={{ fontVariantNumeric: 'tabular-nums' }}>{exec.totalAtStake.toLocaleString()}</span> <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>QAR/yr</span>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>High-priority items</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 26, fontWeight: 800, color: 'var(--danger)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <SeverityGlyph glyph="triangle" color="var(--danger)" />
            <span className="mono-num" style={{ fontVariantNumeric: 'tabular-nums' }}>{exec.highCount}</span>
          </span>
        </div>
      </div>

      {/* ── Filter tabs + sort ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} aria-pressed={activeTab === tab.key} style={{
              fontSize: 14, fontWeight: activeTab === tab.key ? 600 : 500,
              color: activeTab === tab.key ? AI : 'var(--text-muted)',
              background: 'none', border: 'none', padding: '0 0 12px',
              cursor: 'pointer', position: 'relative', whiteSpace: 'nowrap', transition: 'color 0.15s',
            }}>
              {tab.label}
              {activeTab === tab.key && (
                <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: AI, borderRadius: '2px 2px 0 0', boxShadow: `0 -2px 8px ${AI}66` }} />
              )}
            </button>
          ))}
        </div>
        <div style={{ paddingBottom: 8 }}>
          <SortControl value={sortKey} onChange={setSortKey} />
        </div>
      </div>

      {/* ── Insight cards ── */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          No insights in this category yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, alignItems: 'start' }}>
          {hero && (
            <HeroInsightCard
              insight={hero}
              actioned={actioned[hero.id]}
              onAction={() => handleAction(hero)}
              onUndo={() => handleUndo(hero)}
              heroLabel={HERO_LABEL[sortKey] || HERO_LABEL.priority}
            />
          )}
          {rest.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              actioned={actioned[insight.id]}
              onAction={() => handleAction(insight)}
              onUndo={() => handleUndo(insight)}
            />
          ))}
        </div>
      )}

      {/* ── Performance metrics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {PERF_STATS.map(stat => (
          <div key={stat.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
              {stat.label}
            </span>
            <span className="mono-num" style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {stat.val}
            </span>
          </div>
        ))}
      </div>

      {/* ── Model info strip ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
        backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
        borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AI} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
            <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
            <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
            <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
            <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            SolarIQ Intelligence Engine Metrics
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: AI, background: AI_DIM, border: `1px solid ${AI_BORDER}`, padding: '2px 8px', borderRadius: 10, marginLeft: 4 }}>
            BETA
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { label: 'Model Version',   val: 'SolarIQ-v1.0 (Stub)', mono: true },
            { label: 'Data Inputs',     val: 'GHI profile, consumption, dust model, tariff' },
            { label: 'Last Trained',    val: 'Synthetic data — April 2026' },
            { label: 'Next Extension',  val: 'pvlib + ML forecasting (v2)' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</span>
              <span className={stat.mono ? 'mono-num' : undefined} style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500, lineHeight: 1.4, ...(stat.mono ? { fontVariantNumeric: 'tabular-nums' } : null) }}>{stat.val}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', borderTop: '1px dashed var(--border)', paddingTop: 16, fontStyle: 'italic', margin: 0 }}>
          AI insights in v1 are rule-based and calibrated to Qatar conditions. ML-based forecasting will be introduced in v2. Recommendations are generated from synthetic data patterns in demo mode.
        </p>
      </div>

      <style>{`
        @keyframes aiPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.7); }
        }
      `}</style>
    </motion.div>
  )
}
