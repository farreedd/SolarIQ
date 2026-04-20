import { useState } from 'react'

// AI-exclusive indigo accent — do NOT use outside this page
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

const INSIGHTS = [
  {
    id: 1, tab: 'load',
    title: 'Load Shift Opportunity', category: 'Optimization', priority: 'High',
    accent: '#f59e0b', confidence: 91,
    body: 'Pre-cool HVAC in B01 Research Complex and B03 Lab Block between 11:00–13:00 to absorb peak solar generation and shift AC load away from grid-import hours.',
    impact: 'Reduce grid exports by 18% — save ~2,200 QAR/month',
    impactIcon: 'wave', action: 'Apply Recommendation',
  },
  {
    id: 2, tab: 'maintenance',
    title: 'Predictive Maintenance Alert', category: 'Maintenance', priority: 'High',
    accent: '#ef4444', confidence: 89,
    body: 'String inverter #4 on Admin Tower B02 showing 6.2% degradation vs baseline. Efficiency dropped to 91.6% over the past 14 days — trending toward failure threshold.',
    impact: 'Schedule inspection within 14 days — prevent ~51 kWh/day loss',
    impactIcon: 'alert', action: 'View Details',
  },
  {
    id: 3, tab: 'forecasting',
    title: 'Weather-Adjusted Forecast', category: 'Forecasting', priority: 'Medium',
    accent: '#0ea5e9', confidence: 78,
    body: 'Partly cloudy conditions expected Apr 14–16. Predicted generation: 1,850–2,100 kWh/day. Self-consumption rate may improve to 78% during this low-irradiance window.',
    impact: 'Generation 8–12% below clear-sky baseline for 3 days',
    impactIcon: 'chart', action: 'View Forecast',
  },
  {
    id: 4, tab: 'maintenance',
    title: 'Panel Cleaning Schedule', category: 'Maintenance', priority: 'Medium',
    accent: '#22d3ee', confidence: 82,
    body: 'Dust soiling detected on B01 Research Complex arrays. Efficiency drop: 4.2% over 12 days. Qatar dust model recommends cleaning every 8 days vs current 14-day schedule.',
    impact: 'Schedule within 3 days — recover +4.8% annual production',
    impactIcon: 'star', action: 'Apply Recommendation',
  },
  {
    id: 5, tab: 'load',
    title: 'Peak Shaving Opportunity', category: 'Optimization', priority: 'Low',
    accent: '#4ade80', confidence: 76,
    body: 'B04 Parking Structure consistently over-generates 12:00–14:00. Routing excess to on-site EV charging stations instead of grid export could increase self-consumption by 11%.',
    impact: 'Reduce grid export by ~340 kWh on peak days',
    impactIcon: 'chart', action: 'View Details',
  },
  {
    id: 6, tab: 'economics',
    title: 'Annual Performance Review', category: 'Economics', priority: 'Low',
    accent: AI, confidence: 84,
    body: 'Campus-wide system performing at 94.3% of expected annual output. Top performer: B04 Parking Structure at 101.2% of target. B02 Admin Tower below target at 88.1% — investigate.',
    impact: 'Estimated savings: 576,000 QAR/year at current performance',
    impactIcon: 'dollar', action: 'View Full Report',
  },
  {
    id: 7, tab: 'forecasting',
    title: '7-Day Demand Forecast', category: 'Forecasting', priority: 'Medium',
    accent: '#6366f1', confidence: 85,
    body: 'Campus consumption predicted at 14,200–15,800 kWh/day over the next 7 days. Tue and Wed show highest load from lab equipment cycles — ideal windows for shifting HVAC pre-cooling into solar peak hours.',
    impact: '2 high-demand days identified — load shift could save ~1,400 QAR',
    impactIcon: 'chart', action: 'View Demand Curve',
  },
  {
    id: 8, tab: 'forecasting',
    title: 'Dust Storm Advisory', category: 'Forecasting', priority: 'High',
    accent: '#f59e0b', confidence: 81,
    body: 'Regional sandstorm forecast for Apr 22 (24–36 hour window). Expected generation drop: 35–45% during event, with residual soiling cutting 8–10% for 3 days post-event until cleaning.',
    impact: 'Stage cleaning crew Apr 23 — recover ~220 kWh/day faster',
    impactIcon: 'alert', action: 'View Mitigation Plan',
  },
  {
    id: 9, tab: 'forecasting',
    title: 'Seasonal Production Shift', category: 'Forecasting', priority: 'Low',
    accent: '#22d3ee', confidence: 93,
    body: 'Qatar GHI model projects summer peak (Jun–Aug) at ~2,650 kWh/day average, with winter dip (Dec–Jan) to ~1,720 kWh/day. Annual production trajectory: 782 MWh campus-wide.',
    impact: 'On track for 103% of first-year target',
    impactIcon: 'chart', action: 'View Seasonal Model',
  },
  {
    id: 10, tab: 'economics',
    title: 'Tariff Optimization Opportunity', category: 'Economics', priority: 'Medium',
    accent: '#4ade80', confidence: 87,
    body: 'Current flat tariff: 0.18 QAR/kWh. Simulated time-of-use (ToU) tariff with 0.26 QAR/kWh peak rate would raise grid-export value during 11:00–15:00 solar peak, where 64% of export currently occurs.',
    impact: 'Potential +9.4% annual savings — ~54,000 QAR/year',
    impactIcon: 'dollar', action: 'Run Tariff Simulation',
  },
]

const PERF_STATS = [
  { label: 'Insights Today',     val: '12',          color: AI },
  { label: 'Recommendations Applied', val: '3',      color: '#4ade80' },
  { label: 'AI-Driven Savings',  val: '4,800 QAR/mo', color: '#f59e0b' },
  { label: 'Anomalies This Week', val: '2',          color: '#ef4444' },
]

const PRIORITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#6366f1' }

// ── SVG impact icons ─────────────────────────────────────────
function ImpactIcon({ type, color }) {
  const p = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'wave')  return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  if (type === 'alert') return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  if (type === 'chart') return <svg {...p}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
  if (type === 'star')  return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  if (type === 'dollar') return <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  return null
}

// ── Insight card ─────────────────────────────────────────────
function InsightCard({ insight }) {
  const { accent, title, category, priority, confidence, body, impact, impactIcon, action } = insight
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)', border: `1px solid ${hovered ? accent + '44' : 'var(--border)'}`,
        borderRadius: 20, padding: 24, position: 'relative',
        display: 'flex', flexDirection: 'column', gap: 16,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 24, bottom: 24, width: 3, borderRadius: '0 3px 3px 0', background: accent }} />

      {/* Header: title + priority | category tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ paddingLeft: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 6 }}>
            {title}
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 99,
            background: `${PRIORITY_COLOR[priority]}18`, border: `1px solid ${PRIORITY_COLOR[priority]}44`,
            color: PRIORITY_COLOR[priority],
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: PRIORITY_COLOR[priority], display: 'inline-block' }} />
            {priority}
          </span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
          padding: '4px 10px', borderRadius: 12, flexShrink: 0,
          background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
        }}>{category}</span>
      </div>

      {/* Confidence bar */}
      <div style={{ paddingLeft: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>
          <span>Confidence</span>
          <strong style={{ color: 'var(--text-muted)' }}>{confidence}%</strong>
        </div>
        <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${confidence}%`, height: '100%', background: accent, borderRadius: 2, boxShadow: `0 0 6px ${accent}` }} />
        </div>
      </div>

      {/* Body */}
      <p style={{ paddingLeft: 14, fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
        {body}
      </p>

      {/* Impact box */}
      <div style={{ paddingLeft: 14 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ImpactIcon type={impactIcon} color={accent} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{impact}</span>
        </div>
      </div>

      {/* Action link */}
      <div style={{ paddingLeft: 14 }}>
        <button style={{
          background: 'transparent', border: 'none', padding: 0,
          color: accent, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {action} →
        </button>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function AIInsights() {
  const [activeTab, setActiveTab] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const filtered = activeTab === 'all' ? INSIGHTS : INSIGHTS.filter(i => i.tab === activeTab)

  function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
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
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: AI, boxShadow: `0 0 8px ${AI}`, animation: 'aiPulse 2s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Engine Active · Analyzing 5 buildings — 2,000 kWp total capacity
            </span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {refreshing ? 'Refreshing…' : 'Refresh Insights'}
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
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

      {/* ── Insight cards ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 14 }}>
          No insights in this category yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, alignItems: 'start' }}>
          {filtered.map(insight => <InsightCard key={insight.id} insight={insight} />)}
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
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)' }}>
              {stat.label}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {stat.val}
            </span>
          </div>
        ))}
      </div>

      {/* ── Model info strip ── */}
      <div style={{
        background: 'rgba(13,31,56,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border)', borderLeft: `3px solid ${AI}`,
        borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AI} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            { label: 'Model Version',   val: 'SolarIQ-v1.0 (Stub)' },
            { label: 'Data Inputs',     val: 'GHI profile, consumption, dust model, tariff' },
            { label: 'Last Trained',    val: 'Synthetic data — April 2026' },
            { label: 'Next Extension',  val: 'pvlib + ML forecasting (v2)' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 600 }}>{stat.label}</span>
              <span style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500, lineHeight: 1.4 }}>{stat.val}</span>
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
