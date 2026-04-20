import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie, Label,
} from 'recharts'
import { KPI_CARDS, PROD_CONS_DATA, BUILDING_RANKING, HOURLY_DATA, DONUT_DATA, AI_INSIGHTS, MONTHLY_DATA, ECONOMICS } from '../utils/analyticsData'

const BUILDINGS = [
  'All Buildings',
  'Research Complex B01',
  'Admin Tower B02',
  'Lab Block B03',
  'Parking Structure B04',
  'QF Auditorium B05',
]
const TIME_TABS = ['Day', 'Month', 'Year']

const DELTA_COLOR = { up: '#4ade80', muted: 'var(--text-dim)' }
const DELTA_ARROW = { up: '↑', muted: '' }

const CURRENT_MONTH_IDX = 3 // April (0-based)

const MonthBar = (props) => {
  const { x, y, width, height, index } = props
  if (!width || !height) return null
  const isCurrent = index === CURRENT_MONTH_IDX
  const isFuture  = index > CURRENT_MONTH_IDX
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
    <rect
      x={x} y={y} width={width} height={height}
      fill={isCurrent ? '#f59e0b' : 'rgba(14,165,233,0.7)'}
      rx={r}
      style={isCurrent ? { filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' } : {}}
    />
  )
}

export default function Analytics() {
  const [building, setBuilding] = useState('All Buildings')
  const [timeTab, setTimeTab] = useState('Month')
  const [barFilled, setBarFilled] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setBarFilled(true), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <style>{`
        .kpi-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.4); }
        @media (max-width: 1100px) {
          .kpi-row { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 720px) {
          .kpi-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={{ padding: '0 2px 2.5rem', color: 'var(--text)' }}>

        {/* ── 3.3i Topbar Controls ──────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          {/* Building selector */}
          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
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
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Time range tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(13,31,56,0.72)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 3,
            gap: 2,
          }}>
            {TIME_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTimeTab(t)}
                style={{
                  padding: '6px 18px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: timeTab === t ? 600 : 400,
                  color: timeTab === t ? '#fff' : 'var(--text-muted)',
                  background: timeTab === t
                    ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                    : 'transparent',
                  boxShadow: timeTab === t ? '0 0 12px rgba(14,165,233,0.35)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3.3a KPI Row ──────────────────────────────────────────────── */}
        <motion.div
          className="kpi-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {KPI_CARDS.map((k, i) => (
            <motion.div
              key={k.label}
              className="kpi-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
              style={{
                background: 'rgba(13,31,56,0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${k.color}`,
                borderRadius: 12,
                padding: '16px 14px 14px',
              }}
            >
              <div style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 8,
                lineHeight: 1.3,
              }}>
                {k.label}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: k.color,
                  lineHeight: 1,
                }}>
                  {k.value}
                </span>
                <span style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                }}>
                  {k.unit}
                </span>
              </div>

              <div style={{
                fontSize: 11,
                color: DELTA_COLOR[k.deltaType],
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}>
                {DELTA_ARROW[k.deltaType] && (
                  <span style={{ fontSize: 10 }}>{DELTA_ARROW[k.deltaType]}</span>
                )}
                {k.delta}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── 3.3b + 3.3c Chart Row 1 ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}
        >
          {/* 3.3b Production vs Consumption */}
          <div style={{
            background: 'rgba(13,31,56,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 20px 16px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 18 }}>
              Production vs Consumption — Apr 2026
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={PROD_CONS_DATA} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.36} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.5)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(PROD_CONS_DATA.length / 7)}
                />
                <YAxis
                  tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                  domain={[1400, 2500]}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(9,22,43,0.95)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'var(--text)',
                  }}
                  formatter={(value, name) => [`${value.toLocaleString()} kWh`, name === 'production' ? 'Production' : 'Consumption']}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: 4 }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                {/* Production — amber area */}
                <Area
                  type="monotone"
                  dataKey="production"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#prodGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#f59e0b' }}
                />
                {/* Consumption — blue dashed line, no fill */}
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  fill="none"
                  dot={false}
                  activeDot={{ r: 4, fill: '#0ea5e9' }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Mini legend */}
            <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 24, height: 3, background: '#f59e0b', borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Production</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 24, height: 3, borderRadius: 2,
                  background: 'repeating-linear-gradient(90deg, #0ea5e9 0px, #0ea5e9 5px, transparent 5px, transparent 8px)',
                }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Consumption</span>
              </div>
            </div>
          </div>

          {/* 3.3c Building Output Ranking */}
          <div style={{
            background: 'rgba(13,31,56,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 18 }}>
              Building Output Ranking
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {BUILDING_RANKING.map((b, i) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                    color: 'var(--text-dim)', minWidth: 20, textAlign: 'right',
                  }}>
                    {i + 1}
                  </span>
                  {/* Pulsing green dot */}
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#4ade80',
                    boxShadow: '0 0 6px #4ade80',
                    flexShrink: 0,
                    animation: 'pulse-dot 2s ease-in-out infinite',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{b.cap}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#22d3ee' }}>
                      {b.kwh.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>kWh</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── 3.3d + 3.3e + 3.3f Chart Row 2 ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}
        >
          {/* 3.3d Hourly Generation */}
          <div style={{
            background: 'rgba(13,31,56,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 20px 16px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 18 }}>
              Hourly Generation
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={HOURLY_DATA} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.5)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'var(--font-body)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'var(--font-body)' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 280]}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(9,22,43,0.95)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'var(--text)',
                  }}
                  formatter={(v) => [`${v} kWh`, 'Generation']}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: 4 }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="kwh" radius={[4, 4, 0, 0]}>
                  {HOURLY_DATA.map((entry) => (
                    <Cell
                      key={entry.hour}
                      fill={entry.kwh === 248 ? '#f59e0b' : 'rgba(14,165,233,0.7)'}
                      style={entry.kwh === 248 ? { filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' } : {}}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div style={{
              marginTop: 10,
              fontSize: 11,
              color: '#f59e0b',
              fontFamily: 'var(--font-body)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b', display: 'inline-block' }} />
              Peak at 14:00 — 248 kWh
            </div>
          </div>

          {/* 3.3e Energy Distribution Donut */}
          <div style={{
            background: 'rgba(13,31,56,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 20px 16px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 10 }}>
              Energy Distribution
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={DONUT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {DONUT_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox
                      return (
                        <g>
                          <text
                            x={cx} y={cy - 8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, fill: '#22d3ee' }}
                          >
                            74.2%
                          </text>
                          <text
                            x={cx} y={cy + 14}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--text-muted)' }}
                          >
                            Self-used
                          </text>
                        </g>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
              {DONUT_DATA.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: d.color }}>
                    {d.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3.3f AI Insights */}
          <div style={{
            background: 'rgba(13,31,56,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(99,102,241,0.4)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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

            {/* Insight cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>
              {AI_INSIGHTS.map((insight) => (
                <div
                  key={insight.tag}
                  style={{
                    borderLeft: `3px solid ${insight.color}`,
                    background: `rgba(${insight.color === '#f59e0b' ? '245,158,11' : insight.color === '#22d3ee' ? '34,211,238' : '14,165,233'},0.06)`,
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 12px',
                    transition: 'background 0.18s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `rgba(${insight.color === '#f59e0b' ? '245,158,11' : insight.color === '#22d3ee' ? '34,211,238' : '14,165,233'},0.12)`}
                  onMouseLeave={(e) => e.currentTarget.style.background = `rgba(${insight.color === '#f59e0b' ? '245,158,11' : insight.color === '#22d3ee' ? '34,211,238' : '14,165,233'},0.06)`}
                >
                  <div style={{
                    fontSize: 9, fontFamily: 'var(--font-body)', fontWeight: 700,
                    color: insight.color, textTransform: 'uppercase', letterSpacing: '0.07em',
                    marginBottom: 5,
                  }}>
                    {insight.tag}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                    {insight.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── 3.3g + 3.3h Chart Row 3 ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
        >
          {/* 3.3g Monthly Production */}
          <div style={{
            background: 'rgba(13,31,56,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 20px 16px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 18 }}>
              Monthly Production 2026
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -14, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.5)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[1400, 2800]}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(9,22,43,0.95)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'var(--text)',
                  }}
                  formatter={(v, _name, props) => {
                    const isFuture = props.index > CURRENT_MONTH_IDX
                    return [`${v.toLocaleString()} kWh`, isFuture ? 'Forecast' : 'Actual']
                  }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: 4 }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="kwh" shape={<MonthBar />} />
              </BarChart>
            </ResponsiveContainer>

            <div style={{
              marginTop: 10,
              fontSize: 11,
              color: '#f59e0b',
              fontFamily: 'var(--font-body)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b', display: 'inline-block' }} />
              April — Peak month YTD &nbsp;·&nbsp;
              <span style={{ color: 'var(--text-dim)' }}>May–Dec forecast</span>
            </div>
          </div>

          {/* 3.3h Economics Summary */}
          <div style={{
            background: 'rgba(13,31,56,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>
              Economics Summary
            </div>

            {/* 2×2 stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'System Cost',    value: ECONOMICS.systemCost,    color: '#0ea5e9' },
                { label: 'Annual Savings', value: ECONOMICS.annualSavings, color: '#4ade80' },
                { label: 'Grid Tariff',    value: ECONOMICS.tariff,        color: '#f59e0b' },
                { label: 'CO₂ Factor',     value: ECONOMICS.co2Factor,     color: '#22d3ee' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Payback progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
                  Payback Progress
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
                  Year {ECONOMICS.currentYear} of {ECONOMICS.paybackYears}
                </span>
              </div>

              {/* Track */}
              <div style={{
                position: 'relative',
                height: 10,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.07)',
                overflow: 'hidden',
              }}>
                {/* Fill */}
                <div style={{
                  height: '100%',
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                  boxShadow: '0 0 8px rgba(245,158,11,0.5)',
                  width: barFilled ? `${(ECONOMICS.currentYear / ECONOMICS.paybackYears) * 100}%` : '0%',
                  transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }} />
              </div>

              {/* Milestone ticks */}
              <div style={{ position: 'relative', height: 20, marginTop: 6 }}>
                {[1, 2, 4, 6.8].map((yr) => {
                  const pct = (yr / ECONOMICS.paybackYears) * 100
                  return (
                    <div key={yr} style={{
                      position: 'absolute',
                      left: `${pct}%`,
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                      <div style={{ width: 1, height: 5, background: 'var(--border)' }} />
                      <span style={{ fontSize: 9, color: yr === ECONOMICS.paybackYears ? '#f59e0b' : 'var(--text-dim)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                        Yr {yr}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}
