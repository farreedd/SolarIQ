import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import Icon from '../components/UI/Icon'

// ── localStorage persistence (demo-safe, no backend) ────────
const STORAGE_KEY = 'solariq.training.progress.v1'

function loadProgress() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function saveProgress(data) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable (private mode / quota) — stay in-memory, no crash */
  }
}

function clearProgress() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable — nothing to clear, no crash */
  }
}

// Reactive viewport-width check so the module rail can collapse on phones.
// Below ~860px the fixed 280px sidebar would crush the content column, so we
// switch to a collapsible "Modules" drawer + full-width content.
const MOBILE_BREAKPOINT = 860

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT}px)`

// useSyncExternalStore subscribes to matchMedia without any setState-in-effect:
// it's the idiomatic React 18 way to read an external, changing value.
function subscribeNarrow(callback) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mql = window.matchMedia(MOBILE_QUERY)
  // addEventListener is modern; addListener is the Safari <14 fallback.
  if (mql.addEventListener) mql.addEventListener('change', callback)
  else mql.addListener(callback)
  return () => {
    if (mql.removeEventListener) mql.removeEventListener('change', callback)
    else mql.removeListener(callback)
  }
}
function getNarrowSnapshot() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(MOBILE_QUERY).matches
}
function getNarrowServerSnapshot() {
  return false
}
function useIsNarrow() {
  return useSyncExternalStore(subscribeNarrow, getNarrowSnapshot, getNarrowServerSnapshot)
}

const C = {
  amber: '#f59e0b', amberDim: 'rgba(245,158,11,0.10)', amberBorder: 'rgba(245,158,11,0.28)',
  cyan: '#22d3ee', cyanDim: 'rgba(34,211,238,0.10)', cyanBorder: 'rgba(34,211,238,0.28)',
  blueDim: 'rgba(14,165,233,0.10)', blueBorder: 'rgba(14,165,233,0.28)',
  green: 'var(--positive)', greenDim: 'rgba(74,222,128,0.12)', greenBorder: 'rgba(74,222,128,0.28)',
  danger: 'var(--danger)',
}

const CHIP = {
  blue:  { background: C.blueDim,  borderColor: C.blueBorder,  color: 'var(--primary)' },
  amber: { background: C.amberDim, borderColor: C.amberBorder, color: C.amber },
  cyan:  { background: C.cyanDim,  borderColor: C.cyanBorder,  color: C.cyan },
  green: { background: C.greenDim, borderColor: C.greenBorder, color: C.green },
}

// `mono` => bolded segments are numeric data callouts (key facts), so render the
// emphasised value in the tabular monospace face. Plain prose emphasis (words like
// "Monocrystalline") stays in the body face.
function fmt(text, mono = false) {
  return text.split('**').map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: 'var(--text)', fontWeight: 600, ...(mono ? { fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' } : null) }}>{part}</strong>
      : part
  )
}

function renderParas(text) {
  const paras = text.split('\n\n')
  return paras.map((p, i) => (
    <p key={i} style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: i < paras.length - 1 ? 14 : 0 }}>
      {fmt(p)}
    </p>
  ))
}

const MODULES = [
  {
    titlePrefix: 'Solar ', titleHighlight: 'PV Fundamentals',
    title: 'Solar PV Fundamentals', duration: '6 min',
    description: 'Discover how photovoltaic cells convert sunlight into electricity and learn the key performance specifications that define modern solar panels.',
    sections: [
      {
        heading: 'The Photovoltaic Effect', icon: 'zap',
        content: 'Photovoltaic cells exploit the photoelectric effect first described by Einstein in 1905. When photons with sufficient energy strike a semiconductor (typically silicon), they dislodge electrons from their atomic bonds, creating an electric current. A single solar cell generates only ~0.5 V DC — panels wire dozens of cells in series to reach usable voltages (typically 30–40 V per panel).',
        keyFact: { label: 'Key Fact — Panel Efficiency', text: 'Modern monocrystalline silicon panels achieve **20–22% efficiency** at Standard Test Conditions (1,000 W/m², 25°C). This means 1 m² of panel produces roughly 200–220 W under ideal conditions.' },
        chips: [{ color: 'blue', label: 'Photovoltaic Effect' }, { color: 'amber', label: 'Monocrystalline Si' }, { color: 'cyan', label: 'Polycrystalline Si' }, { color: 'green', label: 'Thin-Film' }],
      },
      {
        heading: 'Panel Types & Key Specs', icon: 'flask-conical',
        content: '**Monocrystalline** panels (single-crystal silicon) offer the highest efficiency and best heat tolerance — preferred for Qatar\'s high-temperature environment. **Polycrystalline** panels are cheaper but slightly less efficient. **Thin-film** panels work well in diffuse light but have lower efficiency overall.\n\nKey specifications: rated power (Wp), efficiency (%), temperature coefficient (panels lose ~0.35%/°C above 25°C), and degradation rate (~0.5%/year typical).',
      },
    ],
    quiz: {
      question: 'Which solar panel type offers the highest efficiency and best performance in Qatar\'s high-temperature climate?',
      options: ['Thin-Film (CdTe)', 'Polycrystalline Silicon', 'Monocrystalline Silicon', 'Amorphous Silicon'],
      correct: 2,
      explanation: 'Monocrystalline silicon panels achieve 20–22% efficiency and have the best high-temperature performance due to their lower temperature coefficient compared to other types.',
    },
  },
  {
    titlePrefix: '', titleHighlight: 'System Components',
    title: 'System Components', duration: '9 min',
    description: 'Explore every major component of a grid-tied solar PV system — from panels and inverters to wiring, monitoring, and balance-of-system hardware.',
    sections: [
      {
        heading: 'Core Hardware', icon: 'wrench',
        content: 'A complete grid-tied PV system comprises several subsystems. **Solar panels** capture sunlight and generate DC electricity. **Inverters** convert DC to grid-compatible AC — string inverters handle multiple panel strings, while microinverters work at individual panel level for better shade tolerance. **Mounting systems** (rooftop, facade, canopy) must withstand wind loads and sandstorm conditions common in Qatar.',
        keyFact: { label: 'Key Fact — Inverter Types', text: 'String inverters are standard for large commercial installations like QF Campus. Microinverters cost more per watt but can improve output by up to **25%** in partially shaded conditions by optimising each panel independently.' },
        chips: [{ color: 'blue', label: 'String Inverter' }, { color: 'amber', label: 'Microinverter' }, { color: 'cyan', label: 'Combiner Box' }, { color: 'green', label: 'Monitoring System' }],
      },
      {
        heading: 'Balance of System (BoS)', icon: 'plug',
        content: 'Beyond panels and inverters: **DC wiring** (UV-resistant, rated for rooftop temperatures up to 90°C); **combiner boxes** that aggregate multiple strings; **AC disconnects** for safe maintenance isolation; **bidirectional meters** that track both import and export; and **monitoring systems** providing real-time performance data — essential for fault detection at QF Campus scale.',
      },
    ],
    quiz: {
      question: 'What component aggregates multiple panel strings into a single DC feed before the inverter?',
      options: ['Bidirectional Meter', 'String Inverter', 'Combiner Box', 'DC Disconnect'],
      correct: 2,
      explanation: 'A combiner box aggregates multiple string cables into a single DC output, simplifying wiring runs to the inverter and providing individual string fusing for protection.',
    },
  },
  {
    titlePrefix: 'Energy ', titleHighlight: 'Flow & Grid',
    title: 'Energy Flow & Grid', duration: '8 min',
    description: 'Understand the complete solar energy pathway — from photon capture on the panel surface to usable AC power in your building\'s circuits, including grid interaction in Qatar\'s network.',
    sections: [
      {
        heading: 'The Solar Energy Chain', icon: 'zap',
        content: 'Solar panels convert incoming sunlight into DC electrical charge through the photovoltaic effect. This DC electricity flows through string cables to an inverter, where it is converted to AC at grid-standard frequency (50 Hz in Qatar). From there, AC power enters the building\'s distribution board, powering loads or flowing to the grid.\n\nIn a **grid-tied system** — the most common type at Qatar Foundation Campus — surplus power is exported back to Kahramaa\'s grid, while any deficit is automatically imported through a bidirectional meter.',
        keyFact: { label: 'Key Fact — Qatar GHI', text: 'Qatar\'s annual Global Horizontal Irradiance (GHI) averages **2,050 kWh/m²/year** — one of the highest in the world — making it exceptionally well-suited for photovoltaic generation with minimal shading losses.' },
        chips: [{ color: 'blue', label: 'Photovoltaic Effect' }, { color: 'amber', label: 'MPPT Algorithm' }, { color: 'cyan', label: 'Grid-Tied Inverter' }, { color: 'green', label: 'Bidirectional Meter' }],
      },
      {
        heading: 'Step-by-Step Energy Path', icon: 'refresh-cw',
        content: '**1 · Irradiance Capture** — Solar irradiance strikes the PV cell array. Cell efficiency (~18–22%) determines how much energy becomes electrical power.\n\n**2 · DC Aggregation** — Panels wire in series to form strings. Multiple strings feed into combiner boxes.\n\n**3 · Inversion & MPPT** — The inverter\'s Maximum Power Point Tracker continuously adjusts the operating point for maximum power. DC is inverted to 230 V / 50 Hz AC.\n\n**4 · Local Consumption & Export** — AC power serves on-site loads first. Net surplus flows upstream through the bidirectional meter to Kahramaa\'s grid.',
      },
    ],
    quiz: {
      question: 'What device converts DC electricity from solar panels into AC electricity for Qatar\'s grid-tied buildings?',
      options: ['Combiner Box', 'Charge Controller', 'Grid-Tied Inverter', 'Bidirectional Meter'],
      correct: 2,
      explanation: 'The Grid-Tied Inverter converts DC electricity from panels into AC electricity synchronized with the 230 V / 50 Hz grid standard used in Qatar.',
    },
  },
  {
    titlePrefix: 'Installation ', titleHighlight: 'Basics',
    title: 'Installation Basics', duration: '11 min',
    description: 'Learn the step-by-step process of planning, approving, and installing a solar PV system — from initial site assessment through to grid connection.',
    sections: [
      {
        heading: 'Site Assessment', icon: 'ruler',
        content: 'Before any hardware is ordered, a thorough site assessment determines viability. **Shading analysis** uses tools like SunEye or drone surveys to map shadows from trees, HVAC units, and adjacent buildings. In Qatar, sandstorm dust accumulation requires special consideration alongside shading.\n\n**Roof suitability** checks structural loading capacity (panels + mounting add ~15 kg/m²), roof age and condition, and orientation. South-facing roofs at 20–25° tilt maximize annual yield for Qatar\'s latitude.',
        keyFact: { label: 'Key Fact — Optimal Tilt', text: 'For Qatar\'s latitude (~25°N), the optimal fixed-tilt angle for maximum annual yield is **20–25°**. Flat rooftops use tilted mounting frames to achieve this angle while minimising wind loading.' },
        chips: [{ color: 'blue', label: 'Shade Analysis' }, { color: 'amber', label: 'Structural Load' }, { color: 'cyan', label: 'Optimal Tilt 20–25°' }, { color: 'green', label: 'Roof Survey' }],
      },
      {
        heading: 'Permitting & Grid Connection', icon: 'clipboard',
        content: 'Grid connection in Qatar requires Kahramaa approval. The process includes: submitting a **single-line diagram** and equipment specifications; receiving grid connection approval; passing an **electrical inspection** after installation; installing a Kahramaa-approved **net meter**; and commissioning with final sign-off.\n\nTimeline: typically 4–8 weeks for small commercial systems, 3–6 months for large campus-scale installations like those at QF.',
      },
    ],
    quiz: {
      question: 'What is the optimal fixed-tilt angle for rooftop solar panels at Qatar\'s latitude (~25°N)?',
      options: ['5–10°', '20–25°', '35–40°', '45–50°'],
      correct: 1,
      explanation: 'For Qatar\'s latitude of ~25°N, the optimal fixed-tilt angle is 20–25°, which maximises annual solar energy capture while minimising wind loading on the mounting structure.',
    },
  },
  {
    titlePrefix: 'Qatar ', titleHighlight: 'Climate Factors',
    title: 'Qatar Climate Factors', duration: '7 min',
    description: 'Qatar\'s extreme climate creates unique challenges and opportunities — from record irradiance levels to dust soiling and high temperatures that reduce panel efficiency.',
    sections: [
      {
        heading: 'High Irradiance & Temperature Impact', icon: 'sun',
        content: 'Qatar receives among the highest solar irradiance globally, with GHI averaging **2,000–2,100 kWh/m²/year**. But high temperatures work against efficiency — panel output decreases by approximately **0.35–0.45% per °C** above the 25°C test condition. With rooftop surface temperatures reaching 65–70°C in summer, real-world production can be 15–20% below STC-rated output.\n\nQF Campus buildings experience peak irradiance in June–July, with daily generation often exceeding modelled values due to clear-sky conditions.',
        keyFact: { label: 'Key Fact — Temperature Derating', text: 'On a typical Qatar summer day (ambient 45°C, panel surface ~70°C), output is derated by approximately **16%** from STC ratings. Annual energy yield calculations must include this temperature correction factor.' },
        chips: [{ color: 'amber', label: 'GHI 2,050 kWh/m²/yr' }, { color: 'blue', label: 'Temp Coefficient' }, { color: 'cyan', label: 'STC Derating' }, { color: 'green', label: 'Clear Sky Index' }],
      },
      {
        heading: 'Dust Soiling & Maintenance', icon: 'wind',
        content: '**Dust soiling** is the most significant performance challenge in Qatar. Without cleaning, panels lose **1–2% of daily output** due to dust accumulation. During sandstorm seasons (spring and early summer), losses can spike to 5–7% in a single event.\n\nCleaning schedules at QF Campus target weekly cleaning during sandstorm season and bi-weekly otherwise. Automated cleaning systems are being piloted. Overnight dew provides some natural cleaning but is insufficient in Qatar\'s arid climate.',
      },
    ],
    quiz: {
      question: 'Without regular cleaning, approximately how much daily output do solar panels lose due to dust accumulation in Qatar?',
      options: ['0.1–0.2%', '0.5–0.8%', '1–2%', '5–10%'],
      correct: 2,
      explanation: 'In Qatar\'s dusty environment, panels lose approximately 1–2% of daily output per day without cleaning. During sandstorm events, this can spike to 5–7% in a single event.',
    },
  },
  {
    titlePrefix: 'Economic ', titleHighlight: 'Analysis',
    title: 'Economic Analysis', duration: '10 min',
    description: 'Master the financial case for solar in Qatar — from system cost estimation and tariff savings to full payback period calculations and CO₂ reduction quantification.',
    sections: [
      {
        heading: 'Cost & Savings Framework', icon: 'dollar-sign',
        content: 'Commercial solar PV in Qatar typically costs **1,500–2,500 QAR/kWp** installed. Savings are calculated against Kahramaa\'s electricity tariff of **0.18 QAR/kWh** for commercial consumers. With QF Campus totalling 2,000 kWp generating ~3,200 MWh/year, annual savings reach roughly **576,000 QAR/year** — before accounting for system degradation and export credits.',
        keyFact: { label: 'Key Fact — Qatar Tariff', text: 'Qatar\'s commercial electricity tariff is **0.18 QAR/kWh** (≈ $0.049/kWh). Despite being one of the lowest globally, high irradiance makes payback periods competitive at **6–9 years** for well-designed systems.' },
        chips: [{ color: 'amber', label: '0.18 QAR/kWh Tariff' }, { color: 'blue', label: 'Payback Period' }, { color: 'cyan', label: 'ROI Analysis' }, { color: 'green', label: 'CO₂ Reduction' }],
      },
      {
        heading: 'CO₂ Reduction Calculation', icon: 'leaf',
        content: 'Qatar\'s grid emission factor is **0.49 kg CO₂/kWh** (Kahramaa 2023 data). Every kWh of on-site solar displaces grid electricity and avoids this emission.\n\nFor QF Campus: **3,200,000 kWh/year × 0.49 kg CO₂/kWh = 1,568 tonnes CO₂/year** avoided. Over 25 years (system lifetime) this equates to approximately **39,200 tonnes CO₂** — equivalent to removing ~8,500 cars from the road for a full year.',
      },
    ],
    quiz: {
      question: 'Using Qatar\'s grid emission factor of 0.49 kg CO₂/kWh, how much CO₂ is avoided by generating 1,000 kWh of solar energy?',
      options: ['18 kg CO₂', '49 kg CO₂', '490 kg CO₂', '4,900 kg CO₂'],
      correct: 2,
      explanation: '1,000 kWh × 0.49 kg CO₂/kWh = 490 kg CO₂ avoided. This is the carbon reduction attributed to each MWh of solar generation at Qatar Foundation Campus.',
    },
  },
  {
    titlePrefix: '', titleHighlight: 'Safety & Maintenance',
    title: 'Safety & Maintenance', duration: '12 min',
    description: 'Learn essential electrical safety protocols, routine maintenance procedures, and fault detection strategies for Qatar\'s solar PV installations.',
    sections: [
      {
        heading: 'Electrical Safety Protocols', icon: 'alert-triangle',
        content: 'Working on solar PV systems carries unique hazards. Unlike conventional AC systems, **solar panels cannot be switched off** — they generate voltage whenever light is present. DC voltages in string systems range from 600–1,500 V DC, which is more dangerous than equivalent AC voltages.\n\nSafety protocols for QF Campus include: **lock-out/tag-out (LOTO)** for all maintenance; **arc-flash PPE** (rated gloves, face shields); work only during low-irradiance periods; and a **two-person rule** for all electrical work.',
        keyFact: { label: 'Key Fact — DC Safety', text: 'DC arcs are significantly harder to extinguish than AC arcs. A DC arc at **600 V** can sustain itself across a gap that would immediately quench an equivalent AC arc — making proper isolation procedures critical.' },
        chips: [{ color: 'blue', label: 'Lock-Out / Tag-Out' }, { color: 'amber', label: 'Arc Flash PPE' }, { color: 'cyan', label: 'Rapid Shutdown' }, { color: 'green', label: 'IEC 60364-7-712' }],
      },
      {
        heading: 'Maintenance Schedule', icon: 'calendar',
        content: '**Panel Cleaning:** Weekly during sandstorm season (March–May), bi-weekly otherwise. Record pre/post-cleaning performance to quantify soiling loss.\n\n**Visual Inspection:** Monthly — check for physical damage, hotspots (IR camera), discoloration, and loose connectors.\n\n**Inverter Checks:** Quarterly — review error logs, check cooling fans and filters, verify string currents match design values.\n\n**Annual Inspection:** Full electrical test including I-V curve tracing, insulation resistance measurement, and earth continuity verification.',
      },
    ],
    quiz: {
      question: 'Why can\'t you simply switch off solar panels to make them safe for maintenance?',
      options: ['They have no off switch by design', 'They generate voltage whenever light is present, including ambient daylight', 'Qatar regulations prohibit panel isolation', 'The inverter must always remain connected'],
      correct: 1,
      explanation: 'Solar panels generate voltage whenever photons hit them — including ambient daylight and cloud-filtered light. They cannot be "switched off" and must always be handled with appropriate DC-rated PPE.',
    },
  },
]

// ── ContentCard ─────────────────────────────────────────────
function ContentCard({ section }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
      borderRadius: 18, padding: '26px 28px',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700,
        color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, fontSize: 14, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: C.blueDim, border: `1px solid ${C.blueBorder}`,
        }}><Icon name={section.icon} color="var(--accent)" size={18} /></span>
        {section.heading}
      </h2>

      {renderParas(section.content)}

      {section.keyFact && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14, marginTop: 18,
          background: 'rgba(245,158,11,0.08)',
          border: `1px solid ${C.amberBorder}`,
          borderRadius: 12, padding: '16px 20px',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0, fontSize: 17,
            background: C.amberDim, border: `1px solid ${C.amberBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="sun" color={C.amber} size={18} /></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.amber, marginBottom: 4 }}>
              <Icon name="zap" color={C.amber} size={12} /> {section.keyFact.label}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>
              {fmt(section.keyFact.text, true)}
            </div>
          </div>
        </div>
      )}

      {section.chips && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {section.chips.map((chip, ci) => (
            <span key={ci} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              letterSpacing: '0.03em', border: '1px solid', ...CHIP[chip.color],
            }}>{chip.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── QuizCard ────────────────────────────────────────────────
const LETTERS = ['A', 'B', 'C', 'D']

function QuizCard({ quiz, quizAnswer, setQuizAnswer, quizSubmitted, onSubmit }) {
  const isCorrect = quizAnswer === quiz.correct
  const optionRefs = useRef([])
  const groupLabelId = 'quiz-question'

  // Roving-tabindex radio group: arrow keys move + select, Enter/Space select.
  function moveTo(idx) {
    if (quizSubmitted) return
    const n = quiz.options.length
    const next = ((idx % n) + n) % n
    setQuizAnswer(next)
    const el = optionRefs.current[next]
    if (el) el.focus()
  }

  function handleKeyDown(e, oi) {
    if (quizSubmitted) return
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault(); moveTo(oi + 1); break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault(); moveTo(oi - 1); break
      case 'Home':
        e.preventDefault(); moveTo(0); break
      case 'End':
        e.preventDefault(); moveTo(quiz.options.length - 1); break
      case ' ':
      case 'Enter':
        e.preventDefault(); setQuizAnswer(oi); break
      default:
        break
    }
  }

  // Which option should be in the tab order when nothing is chosen yet.
  const tabbableIdx = quizAnswer === null ? 0 : quizAnswer

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
      borderRadius: 18, padding: '26px 28px', marginBottom: 0,
    }}>
      <div style={{ marginBottom: 18 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 11px', borderRadius: 20, background: C.cyanDim,
          border: `1px solid ${C.cyanBorder}`, fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: C.cyan,
        }}><Icon name="clipboard" color={C.cyan} size={12} /> Knowledge Check</span>
      </div>

      <p id={groupLabelId} style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.45, marginBottom: 20, letterSpacing: '-0.01em' }}>
        {quiz.question}
      </p>

      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}
      >
        {quiz.options.map((opt, oi) => {
          const selected = quizAnswer === oi
          // After submit, mark the correct answer and the wrong pick non-by-color-alone.
          const showCorrect = quizSubmitted && oi === quiz.correct
          const showWrong = quizSubmitted && selected && oi !== quiz.correct
          let borderColor = 'rgba(30,58,95,0.7)'
          let bg = 'rgba(5,13,26,0.4)'
          if (showCorrect) { borderColor = C.greenBorder; bg = C.greenDim }
          else if (showWrong) { borderColor = 'rgba(248,113,113,0.4)'; bg = 'rgba(248,113,113,0.08)' }
          else if (selected) { borderColor = 'rgba(14,165,233,0.35)'; bg = 'rgba(14,165,233,0.09)' }
          return (
            <div
              key={oi}
              ref={(el) => { optionRefs.current[oi] = el }}
              role="radio"
              aria-checked={selected}
              aria-disabled={quizSubmitted || undefined}
              tabIndex={quizSubmitted ? -1 : (oi === tabbableIdx ? 0 : -1)}
              onClick={() => !quizSubmitted && setQuizAnswer(oi)}
              onKeyDown={(e) => handleKeyDown(e, oi)}
              style={{
                display: 'flex', alignItems: 'center', gap: 13,
                padding: '12px 16px', borderRadius: 12,
                border: `1px solid ${borderColor}`,
                background: bg,
                cursor: quizSubmitted ? 'default' : 'pointer',
                opacity: quizSubmitted && !selected && !showCorrect ? 0.55 : 1,
                transition: 'background-color 0.18s, border-color 0.18s, opacity 0.18s',
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: showCorrect ? C.greenDim : showWrong ? 'rgba(248,113,113,0.12)' : selected ? C.blueDim : 'rgba(30,58,95,0.5)',
                color: showCorrect ? C.green : showWrong ? C.danger : selected ? 'var(--primary)' : 'var(--text-dim)',
                border: `1px solid ${showCorrect ? C.greenBorder : showWrong ? 'rgba(248,113,113,0.4)' : selected ? C.blueBorder : 'rgba(30,58,95,0.8)'}`,
                transition: 'background-color 0.15s, color 0.15s, border-color 0.15s',
              }}>
                {showCorrect
                  ? <Icon name="check-circle" color={C.green} size={14} />
                  : showWrong
                    ? <Icon name="x-circle" color={C.danger} size={14} />
                    : LETTERS[oi]}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, color: selected || showCorrect ? 'var(--text)' : 'var(--text-muted)', transition: 'color 0.15s' }}>
                {opt}
              </span>
            </div>
          )
        })}
      </div>

      {!quizSubmitted ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onSubmit}
            disabled={quizAnswer === null}
            aria-disabled={quizAnswer === null}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 26px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none',
              background: quizAnswer === null ? 'rgba(14,165,233,0.12)' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: quizAnswer === null ? 'var(--text-dim)' : '#fff',
              cursor: quizAnswer === null ? 'not-allowed' : 'pointer',
              boxShadow: quizAnswer === null ? 'none' : '0 6px 20px rgba(14,165,233,0.32)',
              transition: 'background-color 0.18s, color 0.18s, box-shadow 0.18s',
            }}
          >Submit Answer →</button>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            {quizAnswer === null ? 'Select an option above to continue' : 'Press Enter or click to check your response'}
          </span>
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12,
            background: isCorrect ? C.greenDim : 'rgba(248,113,113,0.08)',
            border: `1px solid ${isCorrect ? C.greenBorder : 'rgba(248,113,113,0.28)'}`,
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0, display: 'flex' }}>{isCorrect ? <Icon name="check-circle" color={C.green} size={16} /> : <Icon name="x-circle" color={C.danger} size={16} />}</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.5, color: isCorrect ? C.green : C.danger }}>
            {isCorrect ? 'Correct! ' : 'Not quite. '}{quiz.explanation}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Sidebar module list (shared by desktop rail + mobile drawer) ──
function ModuleList({ activeModule, completedModules, onSelect }) {
  return (
    <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 20px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {MODULES.map((m, idx) => {
        const isDone = completedModules.has(idx)
        const isActive = activeModule === idx
        return (
          <button key={idx} onClick={() => onSelect(idx)} aria-current={isActive ? 'true' : undefined} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px',
            borderRadius: 12, width: '100%', textAlign: 'left', position: 'relative', cursor: 'pointer',
            border: isActive ? '1px solid rgba(14,165,233,0.35)' : '1px solid rgba(255,255,255,0.09)',
            background: isActive
              ? 'rgba(14,165,233,0.12)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
            backdropFilter: isActive ? undefined : 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: isActive ? undefined : 'blur(20px) saturate(180%)',
            boxShadow: isActive
              ? '0 0 0 1px rgba(14,165,233,0.12) inset, 0 4px 14px rgba(14,165,233,0.08)'
              : '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
            transition: 'background 0.18s, border-color 0.18s',
          }}>
            {isActive && (
              <div style={{
                position: 'absolute', left: 0, top: '20%', bottom: '20%',
                width: 3, borderRadius: 2, background: 'var(--primary)',
                boxShadow: '0 0 8px rgba(14,165,233,0.7)',
              }} />
            )}
            {/* Number / check badge */}
            <div style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 11, fontWeight: 700,
              background: isDone ? C.greenDim : isActive ? C.blueDim : 'rgba(13,31,56,0.6)',
              border: `1px solid ${isDone ? C.greenBorder : isActive ? C.blueBorder : 'rgba(30,58,95,0.8)'}`,
              color: isDone ? C.green : isActive ? 'var(--primary)' : 'var(--text-dim)',
            }}>
              {isDone
                ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                : idx + 1}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: isActive ? 600 : 500, lineHeight: 1.3,
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{m.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                {isDone ? 'Completed' : isActive ? 'In progress' : 'Not started'} · <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{m.duration}</span>
              </div>
            </div>
            {/* State indicator */}
            <div style={{ width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isDone ? (
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.greenDim, border: `1.5px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              ) : isActive ? (
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px rgba(14,165,233,0.7)', animation: 'trainingPulse 2.4s ease-in-out infinite' }} />
              ) : null}
            </div>
          </button>
        )
      })}
    </nav>
  )
}

// ── Sidebar footer (progress meta + reset) ──────────────────
// The reset is destructive (wipes all completion in one click), so it is guarded
// by a lightweight inline confirm: the single "Reset progress" button swaps in
// place to a "Reset? · Confirm / Cancel" pair — no native confirm() dialog.
// Confirm state is local to each footer instance so the desktop rail and the
// mobile drawer manage their own swap independently.
function SidebarFooter({ onReset }) {
  const [confirming, setConfirming] = useState(false)
  const confirmRef = useRef(null)

  // When the confirm pair appears, move focus to its primary so keyboard users
  // land on the guarded action rather than being stranded on the vanished button.
  useEffect(() => {
    if (confirming && confirmRef.current) confirmRef.current.focus()
  }, [confirming])

  function handleConfirm() {
    onReset()
    setConfirming(false)
  }

  return (
    <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(30,58,95,0.4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <Icon name="graduation-cap" color="var(--text-dim)" size={14} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>SolarIQ <strong style={{ color: 'var(--text-muted)' }}>Learning Path</strong> v1.0</span>
      </div>
      {confirming ? (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Reset?</span>
          <button
            ref={confirmRef}
            onClick={handleConfirm}
            aria-label="Confirm reset of all course progress"
            style={{
              padding: '4px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)',
              color: C.danger, cursor: 'pointer',
              transition: 'background-color 0.18s, border-color 0.18s, color 0.18s',
            }}
          >Confirm</button>
          <button
            onClick={() => setConfirming(false)}
            aria-label="Cancel reset"
            style={{
              padding: '4px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600,
              background: 'transparent', border: '1px solid rgba(30,58,95,0.6)',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'background-color 0.18s, border-color 0.18s, color 0.18s',
            }}
          >Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          title="Reset all course progress"
          aria-label="Reset all course progress"
          style={{
            flexShrink: 0, padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: 'transparent', border: '1px solid rgba(30,58,95,0.6)',
            color: 'var(--text-muted)', cursor: 'pointer',
            transition: 'background-color 0.18s, border-color 0.18s, color 0.18s',
          }}
        >Reset progress</button>
      )}
    </div>
  )
}

// ── Training page ───────────────────────────────────────────
export default function Training() {
  const total = MODULES.length
  const isNarrow = useIsNarrow()

  // Lazy init from localStorage so a refresh resumes where the learner left off.
  const [completedModules, setCompletedModules] = useState(() => {
    const saved = loadProgress()
    const list = Array.isArray(saved?.completed) ? saved.completed : []
    return new Set(list.filter((i) => Number.isInteger(i) && i >= 0 && i < total))
  })
  const [activeModule, setActiveModule] = useState(() => {
    const saved = loadProgress()
    const idx = saved?.active
    return Number.isInteger(idx) && idx >= 0 && idx < total ? idx : 0
  })
  const [quizAnswer, setQuizAnswer] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  // Mobile module drawer open/closed (only relevant below the breakpoint).
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Polite live-region message announced when a module is completed.
  const [liveMessage, setLiveMessage] = useState('')

  // Persist progress on every change (demo-safe: silently no-ops if storage fails).
  useEffect(() => {
    saveProgress({ active: activeModule, completed: [...completedModules] })
  }, [activeModule, completedModules])

  // Note: the mobile drawer is only ever rendered while `isNarrow` is true (see
  // the `{isNarrow && drawerOpen && ...}` guard below), so growing the viewport
  // back to desktop hides it automatically — no resize effect needed.

  const mod = MODULES[activeModule]
  const completedCount = completedModules.size
  const pct = Math.round((completedCount / total) * 100)
  const isCompleted = completedModules.has(activeModule)
  const isFirst = activeModule === 0
  const isLast = activeModule === total - 1
  const courseComplete = completedCount === total
  // Gate completion on having submitted the knowledge check (not correctness).
  const completeBlocked = !quizSubmitted

  function goToModule(idx) {
    setActiveModule(idx)
    setQuizAnswer(null)
    setQuizSubmitted(false)
    setDrawerOpen(false)
  }

  function handleReset() {
    clearProgress()
    setCompletedModules(new Set())
    setActiveModule(0)
    setQuizAnswer(null)
    setQuizSubmitted(false)
    setDrawerOpen(false)
    setLiveMessage('Course progress reset. Back to module 1 of ' + total + '.')
  }

  // Primary CTA: mark current module complete AND advance to the next one.
  // Guarded so an un-submitted quiz can never complete the module. The button
  // stays ENABLED (so it is focusable) and validates on click — when blocked it
  // announces the reason via the polite live region instead of relying on an
  // aria-describedby hint hung off a disabled (unfocusable) button.
  function handleMarkComplete() {
    if (completeBlocked) {
      setLiveMessage('Answer the knowledge check below before completing this module.')
      return
    }
    const next = new Set(completedModules)
    next.add(activeModule)
    setCompletedModules(next)
    const newPct = Math.round((next.size / total) * 100)
    setLiveMessage(
      next.size === total
        ? `Module ${activeModule + 1} of ${total} completed. Course complete — 100 percent.`
        : `Module ${activeModule + 1} of ${total} completed. Course progress now ${newPct} percent.`
    )
    if (!isLast) goToModule(activeModule + 1)
  }

  function handleQuizSubmit() {
    if (quizAnswer !== null) setQuizSubmitted(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
    <div style={{
      display: 'flex',
      // On phones the page scrolls in the document flow (no inner overflow trap);
      // on desktop it keeps the two independent scroll columns under the topbar.
      height: isNarrow ? 'auto' : 'calc(100vh - 64px)',
      minHeight: isNarrow ? 'calc(100vh - 64px)' : undefined,
      overflow: isNarrow ? 'visible' : 'hidden',
    }}>

      {/* ── DESKTOP SIDEBAR (rail) ── */}
      {!isNarrow && (
        <aside style={{
          width: 280, flexShrink: 0,
          background: 'rgba(9,20,38,0.92)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Progress header */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(30,58,95,0.5)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Course Progress</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 700, color: C.amber }}>{pct}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Course progress"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${completedCount} of ${total} modules completed`}
              style={{ height: 5, borderRadius: 99, background: 'rgba(30,58,95,0.7)', overflow: 'hidden' }}
            >
              <div style={{
                height: '100%', width: '100%', borderRadius: 99,
                background: `linear-gradient(90deg, ${C.amber} 0%, #fbbf24 100%)`,
                transform: `scaleX(${pct / 100})`, transformOrigin: 'left center',
                transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
                boxShadow: '0 0 10px rgba(245,158,11,0.5)',
              }} />
            </div>
            <p style={{ marginTop: 7, fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
              <strong style={{ color: C.amber }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{completedCount}</span> of <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{total}</span>
              </strong> modules completed
            </p>
          </div>

          <ModuleList activeModule={activeModule} completedModules={completedModules} onSelect={goToModule} />
          <SidebarFooter onReset={handleReset} />
        </aside>
      )}

      {/* ── MOBILE MODULE DRAWER (overlay) ── */}
      {isNarrow && drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
            style={{ position: 'fixed', inset: '64px 0 0 0', zIndex: 90, background: 'rgba(5,13,26,0.6)' }}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Course modules"
            style={{
              position: 'fixed', top: 64, bottom: 0, left: 0, zIndex: 91,
              width: 'min(300px, 86vw)',
              background: 'rgba(9,20,38,0.98)', borderRight: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 16px 44px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid rgba(30,58,95,0.5)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Course Progress</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close modules"
                  style={{
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text)', cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>
              <div
                role="progressbar"
                aria-label="Course progress"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${completedCount} of ${total} modules completed`}
                style={{ height: 5, borderRadius: 99, background: 'rgba(30,58,95,0.7)', overflow: 'hidden' }}
              >
                <div style={{
                  height: '100%', width: '100%', borderRadius: 99,
                  background: `linear-gradient(90deg, ${C.amber} 0%, #fbbf24 100%)`,
                  transform: `scaleX(${pct / 100})`, transformOrigin: 'left center',
                  transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
                  boxShadow: '0 0 10px rgba(245,158,11,0.5)',
                }} />
              </div>
              <p style={{ marginTop: 7, fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                <strong style={{ color: C.amber }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{completedCount}</span> of <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{total}</span>
                </strong> modules completed
              </p>
            </div>

            <ModuleList activeModule={activeModule} completedModules={completedModules} onSelect={goToModule} />
            <SidebarFooter onReset={handleReset} />
          </aside>
        </>
      )}

      {/* ── CONTENT AREA ── */}
      <section style={{
        flex: 1, minWidth: 0,
        overflowY: isNarrow ? 'visible' : 'auto',
        padding: isNarrow ? '20px 20px 40px' : '32px 40px 48px',
      }}>

        {/* Mobile: open the module drawer + show current position inline */}
        {isNarrow && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px',
                borderRadius: 12, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.35)',
                color: 'var(--primary)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></svg>
              Modules
            </button>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div
                role="progressbar"
                aria-label="Course progress"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${completedCount} of ${total} modules completed`}
                style={{ height: 5, borderRadius: 99, background: 'rgba(30,58,95,0.7)', overflow: 'hidden' }}
              >
                <div style={{
                  height: '100%', width: '100%', borderRadius: 99,
                  background: `linear-gradient(90deg, ${C.amber} 0%, #fbbf24 100%)`,
                  transform: `scaleX(${pct / 100})`, transformOrigin: 'left center',
                  transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
                  boxShadow: '0 0 10px rgba(245,158,11,0.5)',
                }} />
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 600, color: C.amber, flexShrink: 0 }}>{pct}%</span>
          </div>
        )}

        {/* Module header — full width now that the redundant position ring is
            gone (the sidebar bar + bottom dot stepper already show position) */}
        <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
          {/* Eyebrow chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.22)', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--primary)' }}>
              Step <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{activeModule + 1}</span> of <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{total}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(30,58,95,0.4)', border: '1px solid rgba(30,58,95,0.8)', fontSize: 11, fontWeight: 500, color: 'var(--text-dim)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{mod.duration}</span>
            </span>
            {isCompleted ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: C.greenDim, border: `1px solid ${C.greenBorder}`, fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.green }}>
                <Icon name="check-circle" size={15} color="currentColor" style={{ marginRight: 5 }} />Completed
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: C.amberDim, border: `1px solid ${C.amberBorder}`, fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.amber }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, display: 'inline-block', animation: 'trainingPulse 2s ease-in-out infinite' }} />
                In Progress
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text)', marginBottom: 12 }}>
            {mod.titlePrefix}
            <span style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {mod.titleHighlight}
            </span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 760 }}>{mod.description}</p>
        </div>

        {/* Content sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {mod.sections.map((section, si) => (
            <ContentCard key={`${activeModule}-${si}`} section={section} />
          ))}

          <QuizCard
            key={activeModule}
            quiz={mod.quiz}
            quizAnswer={quizAnswer}
            setQuizAnswer={setQuizAnswer}
            quizSubmitted={quizSubmitted}
            onSubmit={handleQuizSubmit}
          />

          {/* Course-complete terminal state — replaces a dead disabled "Next" */}
          {courseComplete && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderRadius: 16,
              background: C.greenDim, border: `1px solid ${C.greenBorder}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(74,222,128,0.12)', border: `1px solid ${C.greenBorder}`,
              }}><Icon name="graduation-cap" color={C.green} size={22} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 3 }}>
                  Course complete — all {total} modules done
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  You have finished the SolarIQ Learning Path. Revisit any module from the sidebar to review.
                </div>
              </div>
              <button onClick={() => goToModule(0)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px',
                borderRadius: 12, fontSize: 13, fontWeight: 600, flexShrink: 0,
                background: C.greenDim, border: `1px solid ${C.greenBorder}`, color: C.green,
              }}><Icon name="refresh-cw" size={14} color="currentColor" />Review from start</button>
            </div>
          )}

          {/* Navigation */}
          <nav aria-label="Module navigation" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', paddingTop: 24, borderTop: '1px solid rgba(30,58,95,0.5)' }}>
            <button onClick={() => !isFirst && goToModule(activeModule - 1)} disabled={isFirst} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px',
              borderRadius: 12, fontSize: 14, fontWeight: 600, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)',
              cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.4 : 1, transition: 'background-color 0.18s, border-color 0.18s, opacity 0.18s',
            }}>← Previous</button>

            {/* Position indicators — secondary STATUS readout, not a third advance
                control. Reads quieter than the CTAs (muted "Progress" label, no
                glow); the 16px dots stay clickable but each sits inside a >=28px
                padded hit area for WCAG 2.2 target size. Distinguishable beyond
                color: current = label, completed = check, upcoming = hollow ring. */}
            <div role="group" aria-label="Module progress" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Progress · <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{activeModule + 1} / {total}</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {MODULES.map((_, idx) => {
                  const done = completedModules.has(idx)
                  const current = idx === activeModule
                  return (
                    <button
                      key={idx}
                      onClick={() => goToModule(idx)}
                      aria-label={`Go to module ${idx + 1}${current ? ', current' : done ? ', completed' : ''}`}
                      aria-current={current ? 'step' : undefined}
                      title={`Module ${idx + 1}${current ? ' (current)' : done ? ' (completed)' : ''}`}
                      style={{
                        // 28px transparent padded hit area (>=24px WCAG 2.2) wrapping
                        // a 16px visual dot; padding 6px each side, no layout shift.
                        width: 28, height: 28, padding: 6, borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent', border: 'none',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 16, height: 16, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: current ? 'var(--primary)' : done ? C.greenDim : 'transparent',
                          border: current
                            ? '1px solid var(--primary)'
                            : done
                              ? `1.5px solid ${C.greenBorder}`
                              : '1.5px solid rgba(126,168,201,0.5)',
                          transition: 'background-color 0.2s, border-color 0.2s',
                        }}
                      >
                        {current ? (
                          <span style={{ fontSize: 8.5, fontWeight: 800, color: '#0b1a2f', lineHeight: 1, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1}</span>
                        ) : done ? (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right buttons — single primary CTA that marks AND advances;
                the secondary is demoted to "Skip" (advance without completing) */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
              {/* Demoted to a quiet text link (no fill, no border) so it does not
                  compete with the primary CTA as a forward affordance. */}
              {!isLast && !isCompleted && (
                <button
                  onClick={() => goToModule(activeModule + 1)}
                  title="Skip to next module without marking complete"
                  aria-label="Skip to next module without marking complete"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '11px 8px',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    border: 'none', background: 'transparent', color: 'var(--text-muted)',
                    textDecoration: 'underline', textDecorationColor: 'var(--text-dim-decorative)',
                    textUnderlineOffset: 3, transition: 'color 0.18s',
                  }}>Skip for now</button>
              )}
              {isCompleted ? (
                !isLast && (
                  <button onClick={() => goToModule(activeModule + 1)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px',
                    borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff',
                    boxShadow: '0 6px 20px rgba(14,165,233,0.3)', transition: 'box-shadow 0.18s, opacity 0.18s',
                  }}>Next Module →</button>
                )
              ) : (
                /* Completion requires submitting the knowledge check first (not
                   getting it right). The button stays focusable so SR users can
                   reach it; when blocked it carries aria-disabled (not the
                   disabled attribute) and validate-on-click announces the reason
                   through the polite live region. The visible hint remains for
                   sighted users and is referenced via aria-describedby. */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <button
                    onClick={handleMarkComplete}
                    aria-disabled={completeBlocked}
                    aria-describedby={completeBlocked ? 'complete-hint' : undefined}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px',
                      borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none',
                      cursor: completeBlocked ? 'not-allowed' : 'pointer',
                      background: completeBlocked
                        ? 'rgba(14,165,233,0.12)'
                        : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      color: completeBlocked ? 'var(--text-dim)' : '#fff',
                      boxShadow: completeBlocked ? 'none' : '0 6px 20px rgba(14,165,233,0.3)',
                      transition: 'background-color 0.18s, color 0.18s, box-shadow 0.18s',
                    }}>
                    <Icon name="check-circle" size={16} color="currentColor" />
                    {isLast ? 'Mark Complete' : 'Mark Complete & Continue →'}
                  </button>
                  {completeBlocked && (
                    <span id="complete-hint" style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 240, textAlign: 'right', lineHeight: 1.4 }}>
                      Answer the knowledge check to complete this module
                    </span>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Polite announcer for completion + progress changes (visually hidden) */}
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }}
        >{liveMessage}</div>
      </section>

      <style>{`
        @keyframes trainingPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.7); }
        }
      `}</style>
    </div>
    </motion.div>
  )
}
