import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// ── 3.2a KPI Data ──────────────────────────────────────────────────────────
const KPI_CARDS = [
  {
    label: 'Total Campus Capacity',
    value: '1,450',
    unit: 'kWp',
    color: '#0ea5e9',
    subtitle: 'All buildings combined',
    pulse: false,
  },
  {
    label: "Today's Generation",
    value: '2,380',
    unit: 'kWh',
    color: '#22d3ee',
    subtitle: 'Live · updated 30s ago',
    pulse: true,
  },
  {
    label: 'Active Systems',
    value: '5 of 5',
    unit: '',
    color: '#4ade80',
    subtitle: 'All buildings online',
    pulse: false,
  },
  {
    label: 'Campus CO2 Saved Today',
    value: '1,166',
    unit: 'kg',
    color: '#f59e0b',
    subtitle: '~52 trees · today\'s offset',
    pulse: false,
  },
]

// ── 3.2b Building Data ─────────────────────────────────────────────────────
const BUILDINGS = [
  { id: 'B01', name: 'Research Complex',   kwh: 952,   status: 'producing', top: '18%', left: '8%'  },
  { id: 'B02', name: 'Admin Tower',        kwh: 608,   status: 'peak',      top: '12%', left: '62%' },
  { id: 'B03', name: 'Lab Block',          kwh: 532,   status: 'producing', top: '52%', left: '14%' },
  { id: 'B04', name: 'Parking Structure',  kwh: 1425,  status: 'producing', top: '48%', left: '44%' },
  { id: 'B05', name: 'QF Auditorium',      kwh: 285,   status: 'producing', top: '62%', left: '74%' },
]

const STATUS_COLOR = {
  producing: '#4ade80',
  peak: '#f59e0b',
  offline: '#3d6488',
}

// ── 3.2d Sparkline Data ────────────────────────────────────────────────────
const SYSTEM_ROWS = [
  { id: 'B01', name: 'Research Complex',  cap: '500 kWp', sparks: [60, 72, 68, 80, 75, 90, 82], kwh: '952',  eff: '94.2%', badge: 'Active' },
  { id: 'B02', name: 'Admin Tower',       cap: '320 kWp', sparks: [50, 55, 70, 85, 78, 95, 88], kwh: '608',  eff: '91.8%', badge: 'Peak'   },
  { id: 'B03', name: 'Lab Block',         cap: '280 kWp', sparks: [40, 48, 55, 60, 65, 58, 62], kwh: '532',  eff: '89.5%', badge: 'Active' },
  { id: 'B04', name: 'Parking Structure', cap: '750 kWp', sparks: [70, 75, 80, 88, 92, 95, 90], kwh: '1,425',eff: '96.1%', badge: 'Active' },
  { id: 'B05', name: 'QF Auditorium',     cap: '150 kWp', sparks: [30, 35, 40, 42, 50, 45, 48], kwh: '285',  eff: '88.3%', badge: 'Active' },
]

// ── 3.2f Alert / Module / Weather Data ────────────────────────────────────
const ALERTS = [
  { icon: '⚠', color: '#f59e0b', msg: 'Dust soiling detected on B01 panels',   time: '14 min ago' },
  { icon: '⚡', color: '#22d3ee', msg: 'Peak generation record set — B04',       time: '1 hr ago'   },
  { icon: '🔧', color: '#0ea5e9', msg: 'Scheduled maintenance B03 inverter',     time: '3 hr ago'   },
]

const MODULES = [
  { name: '3D Visualizer',    status: 'Online', color: '#4ade80' },
  { name: 'Analytics Engine', status: 'Online', color: '#4ade80' },
  { name: 'Training Center',  status: 'Online', color: '#4ade80' },
  { name: 'AI Insights',      status: 'Beta',   color: '#f59e0b' },
]

const WEATHER_METRICS = [
  { label: 'GHI',       value: '985', unit: 'W/m²',  bar: 0.82 },
  { label: 'Wind',      value: '12',  unit: 'km/h NW', bar: null },
  { label: 'UV Index',  value: '9',   unit: 'Very High', bar: 0.9 },
  { label: 'Sky',       value: 'Clear', unit: '0% cloud', bar: null },
]

// ── Sparkline Component ────────────────────────────────────────────────────
function Sparkline({ values }) {
  const max = Math.max(...values)
  const peakIdx = values.indexOf(max)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: `${(v / max) * 100}%`,
            borderRadius: 2,
            background: i === peakIdx ? '#f59e0b' : 'rgba(14,165,233,0.45)',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  )
}

// ── Animated Dashed Connector (SVG) ───────────────────────────────────────
function DashedConnector({ color = '#0ea5e9' }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
      <svg width="100%" height="24" style={{ overflow: 'visible' }}>
        <line
          x1="0" y1="12" x2="100%" y2="12"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="6 4"
          style={{ animation: 'dash-flow 1.4s linear infinite' }}
        />
        <polygon
          points="0,-5 10,0 0,5"
          fill={color}
          style={{ transform: 'translate(calc(100% - 12px), 12px)', overflow: 'visible' }}
        />
      </svg>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Overview() {
  const navigate = useNavigate()

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
  }

  return (
    <>
      {/* Dash-flow keyframe */}
      <style>{`
        @keyframes dash-flow {
          from { stroke-dashoffset: 20; }
          to   { stroke-dashoffset: 0;  }
        }
        .qaction-card:hover { background: rgba(14,165,233,0.12) !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .qaction-card:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .srow:hover { background: rgba(14,165,233,0.06) !important; }
        .bblock:hover { transform: scale(1.04); z-index: 10; }
        @media (max-width: 900px) {
          .kpi-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .main-grid  { grid-template-columns: 1fr !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ padding: '0 2px 2.5rem', color: 'var(--text)' }}>

        {/* ── 3.2a KPI Strip ─────────────────────────────────────────────── */}
        <div
          className="kpi-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}
        >
          {KPI_CARDS.map((k, i) => (
            <motion.div
              key={k.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              style={{
                background: 'rgba(13,31,56,0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 20px 16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow dot */}
              <div style={{
                position: 'absolute', top: -20, left: -20,
                width: 80, height: 80,
                background: `radial-gradient(circle, ${k.color}55, transparent 70%)`,
                filter: 'blur(12px)',
                pointerEvents: 'none',
              }} />

              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {k.label}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700,
                  color: k.color, lineHeight: 1,
                }}>
                  {k.value}
                </span>
                {k.unit && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{k.unit}</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {k.pulse && (
                  <span style={{
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

        {/* ── 3.2b + 3.2c Left / 3.2d + 3.2e Right ─────────────────────── */}
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
              style={{
                background: 'rgba(13,31,56,0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 20px 16px',
              }}
            >
              {/* Panel header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
                  </svg>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>Campus Energy Map</span>
                </div>
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 20,
                  background: 'rgba(74,222,128,0.12)', color: '#4ade80',
                  border: '1px solid rgba(74,222,128,0.25)', fontFamily: 'var(--font-body)',
                }}>5/5 Live</span>
              </div>

              {/* Map canvas */}
              <div style={{
                position: 'relative', height: 310, borderRadius: 10,
                background: 'rgba(4,17,31,0.9)',
                backgroundImage: 'linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                overflow: 'hidden',
              }}>
                {/* SVG road lines */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  <line x1="15%" y1="28%" x2="68%" y2="20%" stroke="rgba(30,58,95,0.8)" strokeWidth="2" strokeDasharray="4 3" />
                  <line x1="15%" y1="28%" x2="17%" y2="62%" stroke="rgba(30,58,95,0.8)" strokeWidth="2" strokeDasharray="4 3" />
                  <line x1="17%" y1="62%" x2="50%" y2="58%" stroke="rgba(30,58,95,0.8)" strokeWidth="2" strokeDasharray="4 3" />
                  <line x1="50%" y1="58%" x2="68%" y2="20%" stroke="rgba(30,58,95,0.8)" strokeWidth="2" strokeDasharray="4 3" />
                  <line x1="50%" y1="58%" x2="80%" y2="70%" stroke="rgba(30,58,95,0.8)" strokeWidth="2" strokeDasharray="4 3" />
                </svg>

                {/* Building blocks */}
                {BUILDINGS.map((b) => {
                  const col = STATUS_COLOR[b.status]
                  return (
                    <div
                      key={b.id}
                      className="bblock"
                      style={{
                        position: 'absolute', top: b.top, left: b.left,
                        transform: 'translate(-50%, -50%)',
                        background: `rgba(${b.status === 'peak' ? '245,158,11' : '74,222,128'},0.07)`,
                        border: `1.5px solid ${col}`,
                        borderRadius: 8, padding: '8px 12px',
                        cursor: 'default',
                        transition: 'transform 0.18s ease, z-index 0s',
                        minWidth: 108,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: col, display: 'block', boxShadow: `0 0 5px ${col}` }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: col }}>{b.id}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>{b.name}</div>
                      <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)' }}>{b.kwh.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>kWh</span></div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
                {[['#4ade80', 'Producing'], ['#f59e0b', 'Peak Output'], ['#3d6488', 'Offline/Standby']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'block' }} />
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
              style={{
                background: 'rgba(13,31,56,0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 24px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Live Energy Flow</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Node: Solar */}
                <div style={{
                  background: 'rgba(245,158,11,0.12)', border: '1.5px solid rgba(245,158,11,0.4)',
                  borderRadius: 10, padding: '14px 18px', textAlign: 'center', minWidth: 120,
                }}>
                  <div style={{ fontSize: 10, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Solar Generation</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#f59e0b' }}>2,380</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>kWh</div>
                </div>

                <DashedConnector color="#f59e0b" />

                {/* Node: Building Load */}
                <div style={{
                  background: 'rgba(14,165,233,0.12)', border: '1.5px solid rgba(14,165,233,0.4)',
                  borderRadius: 10, padding: '14px 18px', textAlign: 'center', minWidth: 120,
                }}>
                  <div style={{ fontSize: 10, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Building Load</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#0ea5e9' }}>1,766</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>kWh</div>
                </div>

                <DashedConnector color="#22d3ee" />

                {/* Node: Grid Export */}
                <div style={{
                  background: 'rgba(34,211,238,0.12)', border: '1.5px solid rgba(34,211,238,0.4)',
                  borderRadius: 10, padding: '14px 18px', textAlign: 'center', minWidth: 120,
                }}>
                  <div style={{ fontSize: 10, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Grid Export</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#22d3ee' }}>614</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>kWh</div>
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
              style={{
                background: 'rgba(13,31,56,0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 20px 12px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>System Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {SYSTEM_ROWS.map((r) => (
                  <div
                    key={r.id}
                    className="srow"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 8px', borderRadius: 8,
                      cursor: 'default', transition: 'background 0.18s',
                    }}
                  >
                    <div style={{ minWidth: 34 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{r.id}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{r.cap}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                    </div>
                    <Sparkline values={r.sparks} />
                    <div style={{ textAlign: 'right', minWidth: 52 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{r.kwh}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{r.eff}</div>
                    </div>
                    <span style={{
                      fontSize: 9, padding: '2px 8px', borderRadius: 12, fontFamily: 'var(--font-body)',
                      background: r.badge === 'Peak' ? 'rgba(245,158,11,0.15)' : 'rgba(74,222,128,0.12)',
                      color: r.badge === 'Peak' ? '#f59e0b' : '#4ade80',
                      border: `1px solid ${r.badge === 'Peak' ? 'rgba(245,158,11,0.3)' : 'rgba(74,222,128,0.25)'}`,
                    }}>{r.badge}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 3.2e Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.45 }}
              style={{
                background: 'rgba(13,31,56,0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: '🏛', label: 'View 3D Campus',  hint: 'Interactive building models', color: '#0ea5e9', to: '/visualizer' },
                  { icon: '📊', label: 'Open Analytics',  hint: 'Energy & savings reports',     color: '#f59e0b', to: '/analytics' },
                  { icon: '⚙',  label: 'Run Simulation',  hint: 'Adjust system parameters',     color: '#22d3ee', to: '/visualizer' },
                  { icon: '🎓', label: 'Training Center', hint: 'Learn solar fundamentals',      color: '#4ade80', to: '/training'  },
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
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{a.icon}</div>
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
          <div style={{
            background: 'rgba(13,31,56,0.72)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)', borderRadius: 14, padding: '20px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Recent Alerts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ALERTS.map((a) => (
                <div key={a.msg} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{a.msg}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2, fontFamily: 'var(--font-body)' }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Modules */}
          <div style={{
            background: 'rgba(13,31,56,0.72)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)', borderRadius: 14, padding: '20px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Platform Modules</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MODULES.map((m) => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{m.name}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 10px', borderRadius: 12, fontFamily: 'var(--font-body)',
                    background: m.status === 'Online' ? 'rgba(74,222,128,0.12)' : 'rgba(245,158,11,0.12)',
                    color: m.color,
                    border: `1px solid ${m.status === 'Online' ? 'rgba(74,222,128,0.25)' : 'rgba(245,158,11,0.3)'}`,
                  }}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weather & Irradiance */}
          <div style={{
            background: 'rgba(13,31,56,0.72)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)', borderRadius: 14, padding: '20px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Weather & Irradiance</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill="#f59e0b" />
                {[0,45,90,135,180,225,270,315].map((deg) => (
                  <line key={deg}
                    x1={12 + 7 * Math.cos(deg * Math.PI / 180)}
                    y1={12 + 7 * Math.sin(deg * Math.PI / 180)}
                    x2={12 + 9.5 * Math.cos(deg * Math.PI / 180)}
                    y2={12 + 9.5 * Math.sin(deg * Math.PI / 180)}
                    stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"
                  />
                ))}
              </svg>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>38°C</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Clear · Sunny</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>Doha, Qatar · QF Campus</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {WEATHER_METRICS.map((m) => (
                <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-body)', marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: m.bar ? 5 : 0 }}>{m.unit}</div>
                  {m.bar && (
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: '100%', width: `${m.bar * 100}%`, borderRadius: 2, background: '#f59e0b' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
