# SolarIQ — Smart Solar Digital Experience Platform
## Project Plan & Task Breakdown

**Owner:** Fareed | QEERI
**Development Tool:** Antigravity (Gemini + Claude models)
**Team:** Solo
**Deployment Target:** Local demo → Vercel (frontend) + Railway (backend)
**Internal Deadline:** End of April / Mid-May 2026

### Authoritative References

| Document | Role |
|---|---|
| `documentation/SolarIQ_Technical_Documentation.docx` | **Source of truth** — data schemas, API contracts, KPI formulas, Qatar constants |
| `SolarIQ_Design_Guidelines.md` | **Source of truth** — visual language, component patterns, motion specs |
| `Wireframe/html/*.html` + `design-system.css` | Canonical pixel-perfect visual ground truth (all 7 pages) |
| `task_tracker.md` | Current progress across all phases |
| `SolarIQ_Vibe_Coding_Prompts.md` | Executable prompts per phase |

If any document disagrees with the Technical Documentation, the Technical Documentation wins.

---

## 1. Platform Vision

SolarIQ is a web-based interactive smart solar experience platform combining:

- Immersive 3D visualization of rooftop solar on Qatar/QF campus buildings
- Real-time energy flow simulation and analytics dashboard
- Public awareness and stakeholder training module
- AI-ready modular architecture for future ML extensions (forecasting, DSM, personalized recommendations)

The design must be **premium, modern, and visually unforgettable** — closer to a tech product demo than a research tool. Think Vercel, Linear, or Apple-level polish applied to an energy platform.

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                        │
│                                                                   │
│   ┌──────────────┐  ┌─────────────┐  ┌──────────┐  ┌─────────┐ │
│   │  3D Scene     │  │  Dashboards │  │ Training  │  │  AI Hub │ │
│   │ (Three.js/R3F)│  │ (Recharts)  │  │  Module   │  │  Stub   │ │
│   └──────┬───────┘  └──────┬──────┘  └────┬─────┘  └────┬────┘ │
│          └─────────────────┴───────────────┴─────────────┘       │
│                             API Layer (solarApi.js)               │
└─────────────────────────────┬────────────────────────────────────┘
                              │ REST/JSON
┌─────────────────────────────▼────────────────────────────────────┐
│                   BACKEND (Python FastAPI)                         │
│                                                                   │
│   /api/simulate    /api/analytics    /api/training    /api/forecast│
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│               Simulation & Data Engine (Python)                    │
│                                                                   │
│   synthetic_data.py   solar_engine.py   economics.py             │
│   co2_calculator.py   [future: pvlib, real meter data]           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React + Vite (JavaScript) | SPA, fast dev server |
| 3D Visualization | Three.js via @react-three/fiber + @react-three/drei | Interactive 3D scene |
| Charts & Analytics | Recharts | KPI dashboards and energy charts |
| Styling | Tailwind CSS + CSS custom properties | Design system, responsive layout |
| Fonts | Syne (display) + DM Sans (body) via Google Fonts | Premium, distinctive typography |
| Animations | Framer Motion | Page transitions, micro-interactions |
| Backend API | Python FastAPI | Simulation endpoints |
| Simulation | Custom Python engine (synthetic data) | Solar production, economics, CO₂ |
| Deployment | Vercel (frontend) + Railway (backend) | Public demo hosting |

---

## 4. Design System

The full design language — colors, typography, spacing, glass morphism, motion, components — is defined in **`SolarIQ_Design_Guidelines.md`**. The summary below is for quick reference; always consult the guidelines doc for authoritative values.

### Color Palette (summary)

```css
--bg:        #050d1a   /* Deep navy background */
--surface:   #0d1f38   /* Elevated surface */
--surface-2: #122845   /* Cards, panels */
--border:    #1e3a5f   /* Subtle borders */
--primary:   #0ea5e9   /* Sky blue — actions */
--accent:    #f59e0b   /* Solar amber — energy */
--success:   #22d3ee   /* Cyan — positive values */
--text:      #f0f9ff
--text-muted:#7ea8c9
--text-dim:  #3d6488
/* AI Insights page exclusive */
--ai-indigo: #6366f1
```

### Typography

- **Display:** Syne (600/700/800) — headlines, logo, KPI values
- **Body:** DM Sans (300/400/500/600) — UI labels, paragraphs, buttons

### Radii

```css
--radius-sm:  6px     /* chips, badges */
--radius-md:  12px    /* buttons, cards */
--radius-lg:  20px    /* glass cards */
--radius-xl:  28px    /* stat/feature cards */
--radius-full:999px   /* small chips only, NOT buttons */
```

### UI Principles

- **Glass morphism cards:** `backdrop-filter: blur(12px)` on `rgba(13,31,56,0.7)` with 1px border
- **Micro-interactions:** 200ms ease-out on hover/active
- **Data as art:** KPI numbers large, bold, Syne
- **Glow effects:** Primary blue halo and amber solar glow on active elements
- **Dark-first always:** No white or light backgrounds
- **Motion with purpose:** Aurora drift, pulse dots, reveal on scroll

### Qatar Constants (consult Technical Documentation for authoritative values)

| Constant | Value |
|---|---|
| Electricity tariff | 0.18 QAR/kWh |
| Grid CO₂ emission factor | 0.49 kg CO₂/kWh |
| Annual GHI (Global Horizontal Irradiance) | ≈ 2,000 kWh/m²/year |
| Peak summer temperature | 45 °C |
| Installation cost estimate | 3,500 QAR/kWp |

---

## 5. Project Phases & Timeline

### Phase 1 — Wireframes & Design System [COMPLETE]

**Goal:** Pixel-perfect visual ground truth and consolidated design guidelines before any React code is written.

| # | Deliverable | Status |
|---|---|---|
| 1.1 | 7 HTML wireframes (Home, Overview, Analytics, Visualizer, Training, AIInsights, Forecasting) | ✅ |
| 1.2 | Shared `design-system.css` with tokens | ✅ |
| 1.3 | Dribbble inspiration research (`documentation/frontend examples/dribble.md`) | ✅ |
| 1.4 | Frontend example screenshots collected | ✅ |
| 1.5 | Consolidated design guidelines doc (`SolarIQ_Design_Guidelines.md`) | ✅ |

---

### Phase 2 — Project Setup & Architecture
**Duration:** Days 1–3 (Week 1)
**Goal:** Working project scaffold, design system in place, both servers running

| # | Task | Deliverable |
|---|---|---|
| 2.1 | Initialize React + Vite frontend | `/frontend` with working dev server |
| 2.2 | Initialize FastAPI backend | `/backend` with `/health` endpoint |
| 2.3 | Set up Tailwind + design system (CSS vars, fonts, global styles from `design-system.css`) | `index.css`, `tailwind.config.js` |
| 2.4 | Install all frontend dependencies | `package.json` complete |
| 2.5 | Scaffold React Router with 7 routes (Home, Overview, Analytics, Visualizer, Training, AIInsights, Forecasting) | `App.jsx` with nested routes |
| 2.6 | Build two Layout patterns: `TopNavLayout` (Home, Training) and `SidebarLayout` (dashboard pages) | Reusable layout components |
| 2.7 | Build Sidebar with Platform + Intelligence sections | `Sidebar.jsx` with demo badge |
| 2.8 | Build shared UI: `GlassCard`, `DemoBanner`, `Button`, `LoadingSkeleton` | `components/UI/*` |
| 2.9 | Three.js/R3F scene scaffold | Empty 3D canvas with camera + lighting |
| 2.10 | Git repo + folder structure | Clean monorepo |

---

### Phase 3 — Frontend Screens (Static Data)
**Duration:** Days 4–10 (Weeks 1–2)
**Goal:** All 7 screens fully designed and clickable with hardcoded data — no backend required yet

| # | Task | Wireframe Reference |
|---|---|---|
| 3.1 | Home / Landing (hero, stats, features, animations) | `Wireframe/html/Home.html` |
| 3.2 | Overview / Dashboard (KPIs, campus map, energy flow, system status, quick actions) | `Wireframe/html/Overview.html` |
| 3.3 | Analytics Dashboard (7 KPIs, 4 chart types, AI panel, economics summary) | `Wireframe/html/analytics.html` |
| 3.4 | 3D Visualizer (70/30 split, building selector, simulation controls) | `Wireframe/html/Visualizer.html` |
| 3.5 | Training Center (module sidebar, step-by-step content, progress tracking) | `Wireframe/html/Training.html` |
| 3.6 | AI Insights (indigo accent, insight cards, confidence panel, beta badge) | `Wireframe/html/AIInsights.html` |
| 3.7 | Forecasting (forecast charts, weather strip, per-building table, model info) | `Wireframe/html/Forecasting.html` |
| 3.8 | Cross-cutting: Framer Motion transitions, mobile responsiveness, loading/error states | All routes |

---

### Phase 4 — Backend & Simulation Engine
**Duration:** Days 8–15 (Weeks 2–3)
**Goal:** FastAPI serving simulated data; frontend fully connected

| # | Task | Deliverable |
|---|---|---|
| 4.1 | FastAPI structure + CORS | `main.py` with all routers |
| 4.2 | Synthetic data generator (Qatar solar profiles, 8,760-hour) | `engine/synthetic_data.py` |
| 4.3 | Solar simulation engine | `engine/solar_engine.py` |
| 4.4 | Economics module (0.18 QAR/kWh, 0.49 kg CO₂/kWh, payback) | `engine/economics.py` |
| 4.5 | All API endpoints (simulate, analytics, training, forecast, overview summary, AI insights) | Route files |
| 4.6 | Frontend API layer (`solarApi.js` + `useSolarData` hook) | Integration |
| 4.7 | Connect all 7 screens to live backend data | Hardcoded data replaced |

---

### Phase 5 — Integration, Polish & Demo Mode
**Duration:** Days 14–21 (Weeks 3–4)
**Goal:** Fully integrated, demo-ready, visually polished prototype

| # | Task | Deliverable |
|---|---|---|
| 5.1 | 3D scene enhancement (5 QF campus buildings, animated energy flows) | Enhanced `SolarScene.jsx` |
| 5.2 | Dashboard interactivity (sliders, building selector, time-range tabs, live recalculation) | Interactive controls on 7 pages |
| 5.3 | Training completion logic + progress tracking | Stateful training flow |
| 5.4 | Demo Mode (local data fallback, amber banner) | `useDemoMode.js` + `DemoBanner.jsx` |
| 5.5 | Full UI polish pass across all 7 pages (animations, hover states, glow effects) | Production-quality UI |
| 5.6 | Performance (lazy loading, code splitting, Three.js optimization) | Fast load times |

---

### Phase 6 — Deployment & Documentation
**Duration:** Days 20–25 (Week 4)
**Goal:** Live URL, complete docs, polished demo visuals

| # | Task | Deliverable |
|---|---|---|
| 6.1 | Deploy frontend to Vercel | Public frontend URL |
| 6.2 | Deploy backend to Railway | Public API URL |
| 6.3 | Env variable configuration | `.env` files for both environments |
| 6.4 | Technical documentation | `docs/technical_summary.md` |
| 6.5 | Root `README.md` | Setup and deployment guide |
| 6.6 | Demo screenshots and screen recording | Presentation-ready visuals |

---

## 6. Folder Structure

```
SolarIQ/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Scene/       (SolarScene, BuildingMesh, EnergyParticles)
│       │   ├── Dashboard/   (KPICard, charts, BuildingList, EnergyFlow)
│       │   ├── Training/    (ModuleSidebar, ModuleContent, ProgressBar)
│       │   └── UI/          (NavBar, Sidebar, Layout, GlassCard, DemoBanner, Button, LoadingSkeleton)
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Overview.jsx
│       │   ├── Analytics.jsx
│       │   ├── Visualizer.jsx
│       │   ├── Training.jsx
│       │   ├── AIInsights.jsx
│       │   └── Forecasting.jsx
│       ├── api/             (solarApi.js)
│       ├── hooks/           (useSolarData, useDemoMode)
│       └── utils/           (demoData.js)
├── backend/
│   ├── main.py
│   ├── routes/              (simulate, analytics, training, forecast)
│   └── engine/              (synthetic_data, solar_engine, economics)
├── Wireframe/html/          (reference wireframes — do not modify)
├── documentation/
├── prompts/
├── SolarIQ_Design_Guidelines.md
├── SolarIQ_Project_Plan.md
├── SolarIQ_Vibe_Coding_Prompts.md
└── task_tracker.md
```

---

## 7. Platform KPIs (7 total)

| KPI | Unit | Source |
|---|---|---|
| Solar Energy Produced | kWh/day | Simulation engine |
| Self-Consumption Rate | % | Simulation engine |
| Grid Export | kWh/day | Simulation engine |
| Estimated Monthly Savings | QAR | Economics module |
| CO₂ Reduction | kg CO₂/year | Economics module |
| Payback Period | Years | Economics module |
| System Efficiency | % | Simulation engine |

---

## 8. QF Campus Buildings (5 total)

| ID | Name | Capacity | Type |
|---|---|---|---|
| B01 | Research Complex | 500 kWp | Rooftop |
| B02 | Admin Tower | 320 kWp | Facade |
| B03 | Lab Block | 280 kWp | Rooftop |
| B04 | Parking Structure | 750 kWp | Canopy |
| B05 | QF Auditorium | 150 kWp | Rooftop |

---

## 9. Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Three.js complexity delays Phase 3 | Medium | Start with box geometry; enhance in Phase 5 |
| Backend deployment issues | Medium | Test locally; Railway provides easy deploy |
| Scope creep on AI features | High | AI endpoints are stubs only in v1 |
| Demo instability during presentation | High | Demo Mode with full local data fallback |
| UI polish taking longer than expected | Medium | Build UI components before wiring backend |

---

## 10. Definition of Done — End of April

- [ ] All 7 screens functional and connected to backend
- [ ] Premium UI with glass morphism, glow effects, smooth animations
- [ ] 3D scene with 5 QF campus buildings, solar panels, animated energy flow
- [ ] Analytics dashboard with 7 live KPIs and 4 chart types
- [ ] Training module with 7 guided steps and progress tracking
- [ ] AI Insights page with indigo-accented stubs and confidence panel
- [ ] Forecasting page with forecast charts and per-building table
- [ ] Overview dashboard as command center with campus map, energy flow, weather
- [ ] Demo Mode fully functional (no backend required)
- [ ] Deployed to public URL
- [ ] Technical documentation complete
- [ ] Screenshots and demo visuals ready for presentations
