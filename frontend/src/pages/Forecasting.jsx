import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, ReferenceLine,
} from 'recharts'

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

const CONF_COLOR = { High: '#22d3ee', Medium: '#f59e0b', Low: '#ef4444' }
const TOTAL_7DAY = forecastData.reduce((s, d) => s + d.production, 0)

// ── Weather emoji helper ──────────────────────────────────────
function weatherEmoji(w) {
  if (w === 'Clear')         return '☀️'
  if (w === 'Partly Cloudy') return '⛅'
  return '🌫️'
}

// ── Custom tooltip for main chart ────────────────────────────
function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const get = key => payload.find(p => p.dataKey === key)?.value ?? '-'
  const prod = get('production'), cons = get('consumption'), net = get('netExport')
  const row = forecastData.find(d => `${d.day} ${d.date}` === label)
  return (
    <div style={{
      background: '#0a1929', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{label}</div>
      <div style={{ color: '#0ea5e9', marginBottom: 2 }}>Production: <strong>{prod.toLocaleString()} kWh</strong>
        {row && <span style={{ color: 'var(--text-dim)' }}> (±{Math.round((row.confidence[1] - row.confidence[0]) / 2)})</span>}
      </div>
      <div style={{ color: '#f59e0b', marginBottom: 2 }}>Consumption: <strong>{cons.toLocaleString()} kWh</strong></div>
      <div style={{ color: net < 0 ? '#ef4444' : '#22d3ee' }}>
        Net Export: <strong>{net > 0 ? '+' : ''}{net.toLocaleString()} kWh</strong>
        {net < 0 && <span style={{ color: '#ef4444' }}> (grid import)</span>}
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
      <div style={{ color: '#f59e0b' }}>GHI: <strong>{payload[0]?.value} W/m²</strong></div>
    </div>
  )
}

// ── Panel wrapper ─────────────────────────────────────────────
function Panel({ title, desc, children, style }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, ...style }}>
      {(title || desc) && (
        <div style={{ marginBottom: 16 }}>
          {title && <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{title}</div>}
          {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// ── KPI card ─────────────────────────────────────────────────
function KPICard({ label, value, sub, accent, badge }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderTop: `3px solid ${accent}`, borderRadius: 8, padding: 16,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {badge ? (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24',
          }}>{badge}</span>
        ) : null}
        {sub}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function Forecasting() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard
          label="7-Day Projected Yield"
          value={<>{TOTAL_7DAY.toLocaleString()} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>kWh</span></>}
          sub="↑ vs last week"
          accent="var(--primary)"
        />
        <KPICard
          label="Peak Day"
          value="Sat, Apr 19"
          sub="2,340 kWh predicted"
          accent="var(--accent)"
        />
        <KPICard
          label="Dust Event Risk"
          value={<span style={{ color: '#fbbf24' }}>Tue, Apr 22</span>}
          sub=""
          badge="Medium"
          accent="#ef4444"
        />
        <KPICard
          label="Forecast Confidence"
          value="82%"
          sub="7-day average"
          accent="var(--success)"
        />
      </div>

      {/* ── Main 7-Day Forecast Panel ── */}
      <Panel>
        {/* Header with legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
              7-Day Forecast
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Predicted Production vs Consumption · Net Export to Grid</div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', alignItems: 'center', flexShrink: 0 }}>
            <LegendDot color="#0ea5e9" label="Production" />
            <LegendDot color="#f59e0b" label="Consumption" />
            <LegendLine color="#22d3ee" label="Net Export" />
          </div>
        </div>

        {/* Weather strip */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {forecastData.map(d => (
            <div key={d.date} style={{
              flex: 1, textAlign: 'center', padding: '7px 4px',
              background: d.weather === 'Partly Cloudy' ? 'rgba(245,158,11,0.09)' : 'rgba(30,58,95,0.4)',
              border: `1px solid ${d.weather === 'Partly Cloudy' ? 'rgba(245,158,11,0.35)' : 'transparent'}`,
              borderRadius: 6, fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <span style={{ fontWeight: 600, color: d.weather === 'Partly Cloudy' ? '#fbbf24' : 'var(--text)', fontSize: 10 }}>{d.day}</span>
              <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{d.date}</span>
              <span style={{ fontSize: 16, lineHeight: 1.4 }}>{weatherEmoji(d.weather)}</span>
              <span style={{ color: 'var(--text-muted)' }}>{d.high}°C</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>{d.ghi} W/m²</span>
            </div>
          ))}
        </div>

        {/* ComposedChart */}
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={48}
              tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<ForecastTooltip />} />
            <ReferenceLine x="Mon Apr 21" stroke="rgba(245,158,11,0.2)" strokeWidth={40} />
            <ReferenceLine x="Tue Apr 22" stroke="rgba(245,158,11,0.2)" strokeWidth={40} />
            <Bar dataKey="production"  fill="rgba(14,165,233,0.55)"  stroke="#0ea5e9" strokeWidth={1} radius={[3,3,0,0]} maxBarSize={36} />
            <Bar dataKey="consumption" fill="rgba(245,158,11,0.55)" stroke="#f59e0b" strokeWidth={1} radius={[3,3,0,0]} maxBarSize={36} />
            <Line dataKey="netExport" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 4"
              dot={{ fill: '#0a1929', stroke: '#22d3ee', strokeWidth: 2, r: 3 }} type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      {/* ── Middle row: Irradiance + Alerts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

        <Panel title="Irradiance Forecast" desc="Predicted GHI (W/m²) — optimal threshold at 850 W/m²">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ghiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={l => l.split(' ')[0]} />
              <YAxis domain={[0, 1100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={40}
                tickFormatter={v => `${v}`} />
              <Tooltip content={<GHITooltip />} />
              <ReferenceLine y={850} stroke="var(--text-dim)" strokeDasharray="4 3" strokeWidth={1} label={{ value: 'Optimal', position: 'right', fill: 'var(--text-dim)', fontSize: 10 }} />
              <Area dataKey="ghi" stroke="#f59e0b" strokeWidth={2} fill="url(#ghiGrad)"
                dot={{ fill: '#0a1929', stroke: '#f59e0b', strokeWidth: 1.5, r: 3 }} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Risk & Alerts" desc="Forecast risk flags for the week">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AlertCard color="#f59e0b" icon="🌫️" title="Dust Event — Tue Apr 22"
              desc="Moderate soiling forecast. Predicted output reduction: 12–15%. Pre-cleaning Mon Apr 21 recommended." />
            <AlertCard color="#ef4444" icon="⚡" title="Grid Import Risk — Mon & Tue"
              desc="Net consumption will exceed production (~70–120 kWh). Grid draw expected 13:00–17:00." />
            <AlertCard color="#f97316" icon="🌡️" title="Temperature Peak — Sat Apr 19"
              desc="Ambient temp 40°C. Panel temp correction reduces output ~2.1% vs standard. Monitor inverters." />
            <AlertCard color="#22d3ee" icon="✅" title="Weekend Surplus — Sat & Sun"
              desc="Low campus occupancy. Expect 500–620 kWh daily export surplus. Consider DSM or storage." />
          </div>
        </Panel>
      </div>

      {/* ── Bottom row: Horizon + Accuracy + Buildings ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 20 }}>

        <Panel title="Monthly Forecast Horizon" desc="Projected yield May–Dec 2026">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={horizonData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={36}
                tickFormatter={v => `${v/1000}k`} />
              <Tooltip
                contentStyle={{ background: '#0a1929', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
                formatter={v => [`${v.toLocaleString()} kWh`, 'Projected Yield']}
              />
              <Line dataKey="yield" stroke="var(--primary)" strokeWidth={2}
                dot={{ fill: 'var(--primary)', r: 3 }} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Forecast Accuracy" desc="Model error metrics (MAPE)">
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
                borderLeft: row.good ? 'none' : '2px solid #ef4444',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: row.good ? '#22c55e' : '#ef4444' }}>
                  {row.val} {row.note && <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-dim)' }}>{row.note}</span>}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Per-Building Forecast" desc="7-day production outlook per system">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 64px 44px', gap: 4, padding: '4px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)' }}>
              <span>Building</span><span style={{ textAlign: 'right' }}>Today</span><span style={{ textAlign: 'right' }}>+1d</span><span style={{ textAlign: 'right' }}>7-Day</span><span style={{ textAlign: 'center' }}>Conf</span>
            </div>
            {BUILDINGS.map(b => (
              <div key={b.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 52px 52px 64px 44px', gap: 4,
                padding: '8px 8px', background: 'rgba(30,58,95,0.3)', borderRadius: 6, alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{b.id}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{b.todayActual}</div>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, textAlign: 'right' }}>{b.tomorrowForecast}</div>
                <div style={{ fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{b.sevenDayTotal.toLocaleString()}</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                    background: `${CONF_COLOR[b.confidence]}18`,
                    border: `1px solid ${CONF_COLOR[b.confidence]}44`,
                    color: CONF_COLOR[b.confidence],
                  }}>{b.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

      </div>

    </div>
  )
}

// ── Local sub-components ──────────────────────────────────────
function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 12, height: 12, background: `${color}55`, border: `1px solid ${color}`, borderRadius: 2 }} />
      <span>{label}</span>
    </div>
  )
}

function LegendLine({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width="18" height="10"><line x1="0" y1="5" x2="18" y2="5" stroke={color} strokeWidth="2" strokeDasharray="4 3" /></svg>
      <span>{label}</span>
    </div>
  )
}

function AlertCard({ color, icon, title, desc }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8,
      borderLeft: `4px solid ${color}`,
      background: 'rgba(30,58,95,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
        <span style={{ fontSize: 15 }}>{icon}</span>{title}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}
