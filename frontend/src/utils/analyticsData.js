// ── KPI Cards ──────────────────────────────────────────────────────────────
export const KPI_CARDS = [
  { label: 'Energy Produced',   value: '2,380', unit: 'kWh/day', delta: '+12.4%', deltaType: 'up',    color: '#22d3ee' },
  { label: 'Self-Consumption',  value: '74.2',  unit: '%',       delta: '+3.1%',  deltaType: 'up',    color: '#f59e0b' },
  { label: 'Grid Export',       value: '614',   unit: 'kWh/day', delta: 'Stable', deltaType: 'muted', color: '#0ea5e9' },
  { label: 'Monthly Savings',   value: '12,400',unit: 'QAR',     delta: '+8.7%',  deltaType: 'up',    color: '#4ade80' },
  { label: 'CO2 Reduction',     value: '427',   unit: 't/year',  delta: '+11.2%', deltaType: 'up',    color: '#22d3ee' },
  { label: 'Payback Period',    value: '6.8',   unit: 'years',   delta: 'On track',deltaType: 'muted',color: '#f59e0b' },
  { label: 'System Efficiency', value: '18.6',  unit: '%',       delta: 'Baseline',deltaType: 'muted',color: '#0ea5e9' },
]

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

// ── Building Output Ranking ────────────────────────────────────────────────
export const BUILDING_RANKING = [
  { id: 'B04', name: 'Parking Structure',  kwh: 1425, cap: '750 kWp' },
  { id: 'B01', name: 'Research Complex',   kwh: 952,  cap: '500 kWp' },
  { id: 'B02', name: 'Admin Tower',        kwh: 608,  cap: '320 kWp' },
  { id: 'B03', name: 'Lab Block',          kwh: 532,  cap: '280 kWp' },
  { id: 'B05', name: 'QF Auditorium',      kwh: 285,  cap: '150 kWp' },
]

// ── Hourly Generation (6AM–6PM) ───────────────────────────────────────────
export const HOURLY_DATA = [
  { hour: '6AM',  kwh: 42  },
  { hour: '7AM',  kwh: 88  },
  { hour: '8AM',  kwh: 134 },
  { hour: '9AM',  kwh: 168 },
  { hour: '10AM', kwh: 196 },
  { hour: '11AM', kwh: 224 },
  { hour: '12PM', kwh: 238 },
  { hour: '1PM',  kwh: 244 },
  { hour: '2PM',  kwh: 248 },
  { hour: '3PM',  kwh: 236 },
  { hour: '4PM',  kwh: 204 },
  { hour: '5PM',  kwh: 148 },
  { hour: '6PM',  kwh: 76  },
]

// ── Energy Distribution ───────────────────────────────────────────────────
export const DONUT_DATA = [
  { name: 'Self-Consumed', value: 74.2, color: '#22d3ee' },
  { name: 'Grid Export',   value: 20.8, color: '#f59e0b' },
  { name: 'System Loss',   value: 5.0,  color: '#64748b' },
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

// ── AI Insights ───────────────────────────────────────────────────────────
export const AI_INSIGHTS = [
  {
    color: '#f59e0b',
    tag: 'Load Shift Opportunity',
    body: 'Pre-cool HVAC between 9–11AM to shift 18% of peak load into solar surplus window. Est. savings: 420 QAR/month.',
  },
  {
    color: '#22d3ee',
    tag: 'Maintenance Alert — B02',
    body: 'Admin Tower inverter shows 4.2% efficiency degradation over 14 days. Recommend inspection within 7 days.',
  },
  {
    color: '#0ea5e9',
    tag: '5-Day Forecast Outlook',
    body: 'Clear skies forecast through Apr 24. Expected generation: 2,340–2,460 kWh/day. Optimal export window: 10AM–3PM.',
  },
]

// ── Economics ─────────────────────────────────────────────────────────────
export const ECONOMICS = {
  systemCost:    '2.1M QAR',
  annualSavings: '308K QAR/year',
  tariff:        '0.18 QAR/kWh',
  co2Factor:     '0.49 kg CO₂/kWh',
  paybackYears:  6.8,
  currentYear:   1,
}
