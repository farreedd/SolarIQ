// ── KPI Cards ──────────────────────────────────────────────────────────────
// ── Building registry ───────────────────────────────────────────────────────
// Each building carries a `scale` (share of campus production, sums to 1.0) used
// to slice the campus fixtures down to a single building, client-side (demo mode).
export const BUILDINGS = [
  { value: 'All Buildings',          id: 'ALL', short: 'All Buildings', scale: 1.0,  cap: '2,000 kWp' },
  { value: 'Research Complex B01',   id: 'B01', short: 'Research Complex', scale: 0.252, cap: '500 kWp' },
  { value: 'Admin Tower B02',        id: 'B02', short: 'Admin Tower',    scale: 0.161, cap: '320 kWp' },
  { value: 'Lab Block B03',          id: 'B03', short: 'Lab Block',      scale: 0.141, cap: '280 kWp' },
  { value: 'Parking Structure B04',  id: 'B04', short: 'Parking Structure', scale: 0.377, cap: '750 kWp' },
  { value: 'QF Auditorium B05',      id: 'B05', short: 'QF Auditorium',  scale: 0.075, cap: '150 kWp' },
]

export const buildingByValue = (value) =>
  BUILDINGS.find((b) => b.value === value) || BUILDINGS[0]

// ── Time periods ────────────────────────────────────────────────────────────
export const PERIODS = {
  Day:   { label: 'Day',   days: 1,   savingsLabel: 'QAR/day',   savingsFactor: 1 },
  Month: { label: 'Month', days: 30,  savingsLabel: 'QAR/mo',    savingsFactor: 30 },
  Year:  { label: 'Year',  days: 365, savingsLabel: 'QAR/year',  savingsFactor: 365 },
}

const fmtNum = (n) => Math.round(n).toLocaleString()

// ── KPI Cards (campus baseline, "Month" period) ─────────────────────────────
// `hero: true` promotes a card into the dominant executive tier.
export const KPI_CARDS = [
  { key: 'savings',    label: 'Monthly Savings',   value: '12,400', unit: 'QAR',     delta: '+8.7%',  deltaType: 'up',    color: 'var(--positive)', hero: true },
  { key: 'co2',        label: 'CO2 Reduction',     value: '427',    unit: 't/year',  delta: '+11.2%', deltaType: 'up',    color: 'var(--success)',  hero: true },
  { key: 'payback',    label: 'Payback Period',    value: '6.8',    unit: 'years',   delta: 'On track',deltaType: 'muted', color: 'var(--accent)',   hero: true },
  { key: 'produced',   label: 'Energy Produced',   value: '2,380',  unit: 'kWh/day', delta: '+12.4%', deltaType: 'up',    color: 'var(--success)' },
  { key: 'selfcons',   label: 'Self-Consumption',  value: '74.2',   unit: '%',       delta: '+3.1%',  deltaType: 'up',    color: 'var(--accent)' },
  { key: 'export',     label: 'Grid Export',       value: '614',    unit: 'kWh/day', delta: 'Stable', deltaType: 'muted', color: 'var(--primary)' },
  { key: 'efficiency', label: 'System Efficiency', value: '18.6',   unit: '%',       delta: 'Baseline',deltaType: 'muted', color: 'var(--primary)' },
]

// Base daily figures the KPIs derive from, so they can rescale per building/period.
const KPI_BASE = {
  producedPerDay:  2380,         // kWh/day campus level
  exportPerDay:    614,          // kWh/day
  selfConsPct:     74.2,         // % (intensive — does not scale with size)
  efficiencyPct:   18.6,         // % (intensive)
  savingsPerDay:   12400 / 30,   // QAR/day (Monthly Savings was 12,400 QAR/mo)
  co2PerYear:      427,          // t/year
  paybackYears:    6.8,          // intensive
}

// Derive the KPI card array for a given building + period.
export function getKpiCards(buildingValue, periodKey) {
  const b = buildingByValue(buildingValue)
  const p = PERIODS[periodKey] || PERIODS.Month
  const s = b.scale

  const prodUnit = p.days === 1 ? 'kWh/day' : p.days === 30 ? 'kWh/mo' : 'kWh/year'
  const produced = KPI_BASE.producedPerDay * s * p.days
  const exported = KPI_BASE.exportPerDay * s * p.days
  const savings  = KPI_BASE.savingsPerDay * s * p.savingsFactor
  const co2      = KPI_BASE.co2PerYear * s

  const byKey = {
    savings:    { value: fmtNum(savings),  unit: p.savingsLabel },
    co2:        { value: co2 >= 100 ? fmtNum(co2) : co2.toFixed(1), unit: 't/year' },
    payback:    { value: KPI_BASE.paybackYears.toFixed(1), unit: 'years' },
    produced:   { value: fmtNum(produced), unit: prodUnit },
    selfcons:   { value: KPI_BASE.selfConsPct.toFixed(1), unit: '%' },
    export:     { value: fmtNum(exported), unit: prodUnit },
    efficiency: { value: KPI_BASE.efficiencyPct.toFixed(1), unit: '%' },
  }

  return KPI_CARDS.map((k) => ({ ...k, ...byKey[k.key] }))
}

// ── Production vs Consumption (30 days, Apr 1-30) ─────────────────────────
export const PROD_CONS_DATA = [
  { day: 'Apr 1',  production: 2100, consumption: 1600 },
  { day: 'Apr 2',  production: 2240, consumption: 1720 },
  { day: 'Apr 3',  production: 1980, consumption: 1580 },
  { day: 'Apr 4',  production: 2150, consumption: 1650 },
  { day: 'Apr 5',  production: 2300, consumption: 1780 },
  { day: 'Apr 6',  production: 2180, consumption: 1700 },
  { day: 'Apr 7',  production: 2050, consumption: 1620 },
  { day: 'Apr 8',  production: 2220, consumption: 1690 },
  { day: 'Apr 9',  production: 2310, consumption: 1760 },
  { day: 'Apr 10', production: 2400, consumption: 1800 },
  { day: 'Apr 11', production: 2280, consumption: 1740 },
  { day: 'Apr 12', production: 2190, consumption: 1670 },
  { day: 'Apr 13', production: 2060, consumption: 1600 },
  { day: 'Apr 14', production: 2140, consumption: 1630 },
  { day: 'Apr 15', production: 2350, consumption: 1790 },
  { day: 'Apr 16', production: 2420, consumption: 1820 },
  { day: 'Apr 17', production: 2380, consumption: 1766 },
  { day: 'Apr 18', production: 2200, consumption: 1680 },
  { day: 'Apr 19', production: 2100, consumption: 1610 },
  { day: 'Apr 20', production: 2260, consumption: 1730 },
  { day: 'Apr 21', production: 2310, consumption: 1760 },
  { day: 'Apr 22', production: 2390, consumption: 1800 },
  { day: 'Apr 23', production: 2440, consumption: 1840 },
  { day: 'Apr 24', production: 2360, consumption: 1780 },
  { day: 'Apr 25', production: 2290, consumption: 1750 },
  { day: 'Apr 26', production: 2170, consumption: 1660 },
  { day: 'Apr 27', production: 2080, consumption: 1590 },
  { day: 'Apr 28', production: 2230, consumption: 1710 },
  { day: 'Apr 29', production: 2340, consumption: 1770 },
  { day: 'Apr 30', production: 2380, consumption: 1766 },
]

// ── Intraday (hour-of-day) production vs consumption, campus baseline ──────
// Used as the primary trend for the "Day" period. Production follows the solar
// arc (zero overnight); consumption is the building load curve (a morning and
// evening bump, never zero). Values are kWh for that hour, campus level.
const PROD_CONS_INTRADAY = [
  { x: '12AM', production: 0,    consumption: 720 },
  { x: '2AM',  production: 0,    consumption: 660 },
  { x: '4AM',  production: 0,    consumption: 680 },
  { x: '6AM',  production: 42,   consumption: 820 },
  { x: '8AM',  production: 134,  consumption: 1180 },
  { x: '10AM', production: 196,  consumption: 1320 },
  { x: '12PM', production: 238,  consumption: 1280 },
  { x: '2PM',  production: 248,  consumption: 1240 },
  { x: '4PM',  production: 204,  consumption: 1300 },
  { x: '6PM',  production: 76,   consumption: 1420 },
  { x: '8PM',  production: 0,    consumption: 1180 },
  { x: '10PM', production: 0,    consumption: 880 },
]

// Daily curve (Apr 1–30) reshaped with a generic `x` key so the chart can stay
// period-agnostic about the axis field name.
const PROD_CONS_DAILY = PROD_CONS_DATA.map((d) => ({
  x: d.day, production: d.production, consumption: d.consumption,
}))

// Monthly aggregation for the "Year" view: production tracks MONTHLY_DATA;
// consumption ≈ 76% of production at campus level (mirrors the ~74% self-
// consumption story). MONTHLY_DATA is hoisted (const below) but read lazily
// inside the function so declaration order does not matter.
function prodConsMonthly() {
  return MONTHLY_DATA.map((m) => ({
    x: m.month,
    production: m.kwh,
    consumption: Math.round(m.kwh * 0.76),
  }))
}

// Period-aware production vs consumption series + display metadata.
// Returns { data, xKey, title, caption, srCaption, scope } so the panel reads
// consistently with the active Day/Month/Year tab. Always client-side.
export function getProdConsSeries(buildingValue, periodKey) {
  const s = buildingByValue(buildingValue).scale
  const scale = (rows) => (s === 1.0 ? rows : rows.map((d) => ({
    x: d.x,
    production: Math.round(d.production * s),
    consumption: Math.round(d.consumption * s),
  })))

  if (periodKey === 'Day') {
    return {
      data: scale(PROD_CONS_INTRADAY),
      xKey: 'x',
      title: 'Production vs Consumption — Today (hourly)',
      caption: 'Intraday curve · production solid, consumption dashed',
      srCaption: 'Hourly production and consumption (kWh) across a representative day',
    }
  }
  if (periodKey === 'Year') {
    return {
      data: scale(prodConsMonthly()),
      xKey: 'x',
      title: 'Production vs Consumption — 2026 (monthly)',
      caption: 'Monthly totals · production solid, consumption dashed',
      srCaption: 'Monthly production and consumption (kWh) across 2026',
    }
  }
  // Month (default)
  return {
    data: scale(PROD_CONS_DAILY),
    xKey: 'x',
    title: 'Production vs Consumption — Apr 2026',
    caption: 'Daily curve · production solid, consumption dashed',
    srCaption: 'Daily production and consumption (kWh) for April 2026',
  }
}

// ── Building Output Ranking ────────────────────────────────────────────────
export const BUILDING_RANKING = [
  { id: 'B04', name: 'Parking Structure',  kwh: 1425, cap: '750 kWp' },
  { id: 'B01', name: 'Research Complex',   kwh: 952,  cap: '500 kWp' },
  { id: 'B02', name: 'Admin Tower',        kwh: 608,  cap: '320 kWp' },
  { id: 'B03', name: 'Lab Block',          kwh: 532,  cap: '280 kWp' },
  { id: 'B05', name: 'QF Auditorium',      kwh: 285,  cap: '150 kWp' },
]

// ── Hourly Generation (6AM–6PM) ───────────────────────────────────────────
// `peak: true` flags the daily peak hour so the chart never relies on a magic
// kWh comparison (which would break once values are scaled per building).
export const HOURLY_DATA = [
  { hour: '6AM',  kwh: 42  },
  { hour: '7AM',  kwh: 88  },
  { hour: '8AM',  kwh: 134 },
  { hour: '9AM',  kwh: 168 },
  { hour: '10AM', kwh: 196 },
  { hour: '11AM', kwh: 224 },
  { hour: '12PM', kwh: 238 },
  { hour: '1PM',  kwh: 244 },
  { hour: '2PM',  kwh: 248, peak: true },
  { hour: '3PM',  kwh: 236 },
  { hour: '4PM',  kwh: 204 },
  { hour: '5PM',  kwh: 148 },
  { hour: '6PM',  kwh: 76  },
]

// Scale hourly generation for a building (period does not reshape an hour-of-day curve).
export function getHourlyData(buildingValue) {
  const s = buildingByValue(buildingValue).scale
  if (s === 1.0) return HOURLY_DATA
  return HOURLY_DATA.map((d) => ({ ...d, kwh: Math.round(d.kwh * s) }))
}

// Peak hour summary for the hourly chart caption (scaled to building).
export function getHourlyPeak(buildingValue) {
  const data = getHourlyData(buildingValue)
  return data.reduce((best, d) => (d.kwh > best.kwh ? d : best), data[0])
}

// Period-aware title/caption for the Hourly Generation panel. The data is always
// an hour-of-day curve; the framing changes so it never contradicts the tab.
export function getHourlyMeta(periodKey) {
  if (periodKey === 'Day')
    return { title: 'Hourly Generation — Today', scope: 'Today, by hour' }
  if (periodKey === 'Year')
    return { title: 'Hourly Generation — Avg Day 2026', scope: 'Average day, 2026' }
  return { title: 'Hourly Generation — Avg Day', scope: 'Average day this month' }
}

// ── Energy Distribution ───────────────────────────────────────────────────
// Shares are intensive (do not change with building size), so the donut is
// constant across buildings; it always sums to 100.
// Concrete hex (not CSS vars): Recharts sets `fill` as an SVG presentation
// attribute, where `var(--x)` does NOT resolve. These map to the tokens
// --success / --accent / a neutral grey for loss.
export const DONUT_DATA = [
  { name: 'Self-Consumed', value: 74.2, color: '#22d3ee' }, // --success
  { name: 'Grid Export',   value: 20.8, color: '#f59e0b' }, // --accent
  { name: 'System Loss',   value: 5.0,  color: '#64748b' }, // neutral grey
]

// ── Monthly Production 2026 ───────────────────────────────────────────────
export const MONTHLY_DATA = [
  { month: 'Jan', kwh: 1820 },
  { month: 'Feb', kwh: 1940 },
  { month: 'Mar', kwh: 2080 },
  { month: 'Apr', kwh: 2380 },
  { month: 'May', kwh: 2520 },
  { month: 'Jun', kwh: 2680 },
  { month: 'Jul', kwh: 2640 },
  { month: 'Aug', kwh: 2580 },
  { month: 'Sep', kwh: 2420 },
  { month: 'Oct', kwh: 2160 },
  { month: 'Nov', kwh: 1960 },
  { month: 'Dec', kwh: 1780 },
]

// Month short-names, the single source of truth for the 12-month 2026 series labels.
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// As-of "current month" index (0-based), derived from the real clock so the
// actual/forecast split never goes stale. The fixtures model calendar 2026;
// outside that year we clamp to a full year (Dec) so the view stays sensible.
// One source of truth: every actual/forecast cutoff reads CURRENT_MONTH_IDX.
function deriveCurrentMonthIdx() {
  const now = new Date()
  const seriesYear = 2026
  if (now.getFullYear() < seriesYear) return 0           // before the series → only Jan actual
  if (now.getFullYear() > seriesYear) return 11          // after the series → all actual
  return now.getMonth()                                   // within 2026 → real month (June → 5)
}
export const CURRENT_MONTH_IDX = deriveCurrentMonthIdx()

// Caption helper: names the real current month plus the forecast tail, e.g.
// "Jun — Peak month YTD · Jul–Dec forecast". Never hardcodes April.
export function getMonthlyCaption() {
  const current = MONTH_NAMES[CURRENT_MONTH_IDX]
  const hasForecast = CURRENT_MONTH_IDX < 11
  const next = hasForecast ? MONTH_NAMES[CURRENT_MONTH_IDX + 1] : null
  return {
    current,
    forecastRange: hasForecast ? `${next}–Dec forecast` : 'All months actual',
  }
}

// Scale the monthly series for a building. Each row carries a `status` of
// 'Actual' or 'Forecast' (≥ May) so charts and tables agree without re-deriving
// the cutoff from the index everywhere.
export function getMonthlyData(buildingValue) {
  const s = buildingByValue(buildingValue).scale
  return MONTHLY_DATA.map((d, i) => ({
    month: d.month,
    kwh: s === 1.0 ? d.kwh : Math.round(d.kwh * s),
    status: i > CURRENT_MONTH_IDX ? 'Forecast' : 'Actual',
  }))
}

// Period-aware title/scope for the Monthly Production panel. The series is always
// the 12-month 2026 view; framing changes so it reads consistently with the tab.
export function getMonthlyMeta(periodKey) {
  if (periodKey === 'Day')
    return { title: 'Monthly Production — 2026 (context)', scope: 'Full year for context' }
  if (periodKey === 'Year')
    return { title: 'Monthly Production — 2026', scope: 'Selected year' }
  return { title: 'Monthly Production — 2026', scope: 'Full year, current month highlighted' }
}

// ── AI Insights ───────────────────────────────────────────────────────────
// Numeric fields drive robust triage on the AI Insights Hub:
//   priorityRank  3=High · 2=Medium · 1=Low  (sort desc for High→Low)
//   confidence    model confidence as a number (also rendered as %)
//   impactQar     QAR/year at stake, used for "QAR impact" sort + total-at-stake hero
// `color` is retained only as a legacy category tint; severity color is derived
// from `priority` on the page, never from this field.
export const AI_INSIGHTS = [
  {
    color: '#f59e0b',
    tag: 'Load Shift Opportunity',
    priority: 'High',
    priorityRank: 3,
    confidence: 91,
    impactQar: 26400,
    body: 'Pre-cool HVAC between 9–11AM to shift 18% of peak load into solar surplus window. Est. savings: 420 QAR/month.',
  },
  {
    color: '#22d3ee',
    tag: 'Maintenance Alert — B02',
    priority: 'High',
    priorityRank: 3,
    confidence: 89,
    impactQar: 18600,
    body: 'Admin Tower inverter shows 4.2% efficiency degradation over 14 days. Recommend inspection within 7 days.',
  },
  {
    color: '#0ea5e9',
    tag: '5-Day Forecast Outlook',
    priority: 'Medium',
    priorityRank: 2,
    confidence: 85,
    impactQar: 0,
    body: 'Clear skies forecast through Apr 24. Expected generation: 2,340–2,460 kWh/day. Optimal export window: 10AM–3PM.',
  },
]

// ── Economics ─────────────────────────────────────────────────────────────
// Campus baseline. `systemCost` and `annualSavings` are extensive (scale with
// building share); tariff, CO₂ factor and payback are intensive (constant).
export const ECONOMICS = {
  systemCost:    '2.1M QAR',
  annualSavings: '308K QAR/year',
  tariff:        '0.18 QAR/kWh',
  co2Factor:     '0.49 kg CO₂/kWh',
  paybackYears:  6.8,
  currentYear:   1,
}

// Raw numeric baselines (QAR) for scaling the two extensive economics figures.
const ECON_BASE = { systemCostQar: 2_100_000, annualSavingsQar: 308_000 }

// Format a QAR figure compactly (M / K) to match the campus presentation.
function fmtQar(n, suffix = '') {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M QAR${suffix}`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K QAR${suffix}`
  return `${Math.round(n).toLocaleString()} QAR${suffix}`
}

// Building-aware economics: scales system cost + annual savings by the building's
// share of campus production. Intensive figures (tariff, CO₂, payback) are held
// constant. Returns a `scope` string for an honest panel label.
export function getEconomics(buildingValue) {
  const b = buildingByValue(buildingValue)
  const isCampus = b.scale === 1.0
  return {
    systemCost:    isCampus ? ECONOMICS.systemCost : fmtQar(ECON_BASE.systemCostQar * b.scale),
    annualSavings: isCampus ? ECONOMICS.annualSavings : fmtQar(ECON_BASE.annualSavingsQar * b.scale, '/year'),
    tariff:        ECONOMICS.tariff,
    co2Factor:     ECONOMICS.co2Factor,
    paybackYears:  ECONOMICS.paybackYears,
    currentYear:   ECONOMICS.currentYear,
    scope:         isCampus ? 'Campus totals' : `${b.short} (${b.cap})`,
  }
}

// ── CSV export helpers (KPI + economics figures) ───────────────────────────
// Produces a small CSV string a leader can paste into a slide/sheet.
export function buildKpiCsv(buildingValue, periodKey) {
  const b = buildingByValue(buildingValue)
  const p = PERIODS[periodKey] || PERIODS.Month
  const cards = getKpiCards(buildingValue, periodKey)
  const econ = getEconomics(buildingValue)
  const rows = [
    ['SolarIQ — Analytics export'],
    ['Building', b.value],
    ['Period', p.label],
    [],
    ['Metric', 'Value', 'Unit', 'Change'],
    ...cards.map((k) => [k.label, k.value, k.unit, k.delta]),
    [],
    [`Economics (${econ.scope})`],
    ['System Cost', econ.systemCost],
    ['Annual Savings', econ.annualSavings],
    ['Grid Tariff', econ.tariff],
    ['CO2 Factor', econ.co2Factor],
    ['Payback (years)', String(econ.paybackYears)],
  ]
  return rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

// Economics-only CSV — matches the economics panel's own "CSV" button so it
// exports just what sits next to it (no duplicate of the full KPI payload).
export function buildEconomicsCsv(buildingValue) {
  const b = buildingByValue(buildingValue)
  const econ = getEconomics(buildingValue)
  const rows = [
    ['SolarIQ — Economics export'],
    ['Building', b.value],
    [`Scope`, econ.scope],
    [],
    ['Metric', 'Value'],
    ['System Cost', econ.systemCost],
    ['Annual Savings', econ.annualSavings],
    ['Grid Tariff', econ.tariff],
    ['CO2 Factor', econ.co2Factor],
    ['Payback (years)', String(econ.paybackYears)],
    ['Year of Payback', String(econ.currentYear)],
  ]
  return rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}
