# SolarIQ — Design Guidelines

**Status:** Authoritative UI/UX reference for Phase 2+ development
**Owner:** Fareed | QEERI
**Sources:** `Wireframe/html/design-system.css`, all 7 `Wireframe/html/*.html` files, `documentation/frontend examples/`
**Last Updated:** 2026-04-18

---

## 1. Purpose & Scope

This document is the single reference for the visual language, component patterns, motion design, and interaction specifications of the SolarIQ platform.

**When to consult:**
- Before starting any frontend task (Phase 2 onward).
- When translating a wireframe into a React component.
- When choosing a color, radius, or animation duration.
- When a design decision is not obvious from the wireframes alone.

**Hierarchy of authority (important):**

1. **`documentation/SolarIQ_Technical_Documentation.docx`** — source of truth for data schemas, KPI formulas, API contracts, Qatar constants.
2. **`Wireframe/html/*.html`** + **`Wireframe/html/design-system.css`** — source of truth for **visual ground truth**. Match pixel-for-pixel.
3. **This document (`SolarIQ_Design_Guidelines.md`)** — distilled, written form of #2 for quick reference. If it ever disagrees with the wireframes, the wireframes win.
4. **`SolarIQ_Project_Plan.md`** + **`task_tracker.md`** — scope and milestones.
5. **`SolarIQ_Vibe_Coding_Prompts.md`** — executable prompts; defers to all of the above.

**Out of scope:** data contracts, KPI formulas, API response shapes — consult the Technical Documentation.

---

## 2. Brand Principles

1. **Premium and cinematic.** The platform should feel like a product demo from Vercel, Linear, or Apple — not a research tool.
2. **Dark-first, always.** Deep navy base with semi-transparent glass elevation. Never light backgrounds, never white surfaces.
3. **Data as art.** KPI numbers are large, bold, and dominant. Charts are transparent, elegant, and legible.
4. **Qatar-contextualized.** Colors evoke Gulf sky (blue) and desert sun (amber). Content references Qatar Foundation campus buildings and realistic Qatar solar conditions.
5. **Motion has purpose.** Aurora drift, pulsing live dots, reveal-on-scroll — every animation conveys liveness, hierarchy, or state. No gratuitous motion.
6. **Every pixel intentional.** No placeholder text, no Lorem ipsum, no flat cards, no unanimated hover states.

---

## 3. Color System

### Core palette (from `design-system.css`)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#050d1a` | Page background (near-black navy) |
| `--surface` | `#0d1f38` | Elevated surface (panels behind glass cards) |
| `--surface-2` | `#122845` | Cards, panels (secondary surface) |
| `--border` | `#1e3a5f` | Divider lines, neutral edges |
| `--primary` | `#0ea5e9` | Sky blue — interactive elements, focus, active states |
| `--accent` | `#f59e0b` | Solar amber — energy, highlights, warnings |
| `--success` | `#22d3ee` | Cyan — positive values, online/live status |
| `--text` | `#f0f9ff` | Primary body text (near-white) |
| `--text-muted` | `#7ea8c9` | Secondary labels |
| `--text-dim` | `#3d6488` | Tertiary text, placeholders, disabled |

### Extended tokens (defined in wireframes, not yet in `design-system.css`)

| Token | Value | Role |
|---|---|---|
| `--surface-3` | `#0a1929` | Topbar, sidebar (deeper than surface) |
| `--color-primary-glow` | `rgba(14,165,233,0.25)` / `#0ea5e940` | Blue glow halo |
| `--color-accent-glow` | `rgba(245,158,11,0.19)` / `#f59e0b30` | Amber glow halo |

### Semantic overlays (rgba tints of the base colors)

| Opacity | Primary | Accent | Success | Usage |
|---|---|---|---|---|
| 0.08 – 0.10 | `rgba(14,165,233,0.10)` | `rgba(245,158,11,0.10)` | `rgba(34,211,238,0.10)` | Hover backgrounds |
| 0.15 | `rgba(14,165,233,0.15)` | `rgba(245,158,11,0.15)` | `rgba(34,211,238,0.15)` | Status badges, active chip bg |
| 0.35 – 0.45 | `rgba(14,165,233,0.35)` | `rgba(245,158,11,0.35)` | — | Button halos (shadow) |

### Page-specific accent: Indigo (AI Insights ONLY)

| Token | Value | Role |
|---|---|---|
| `--ai-indigo` | `#6366f1` | AI Insights page — navbar underline, sidebar active, button outlines, confidence bars |

**Rule:** Indigo must appear **only** on the `/ai-insights` route. All other pages use the primary + accent + success system.

---

## 4. Typography

### Font families

| Family | Role | Weights used |
|---|---|---|
| **Syne** | Display (headlines, logo, KPI values, panel titles) | 600, 700, 800 |
| **DM Sans** | Body (UI labels, paragraphs, buttons, input text) | 300, 400, 500, 600 |

Both loaded via Google Fonts `link` tag in `index.html`.

### Type scale

| Element | Size | Family | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| Hero headline | `clamp(3rem, 6vw, 5.25rem)` | Syne | 800 | `-0.035em` | 1.06 |
| Page title | 20px | Syne | 700 | `-0.015em` | 1.2 |
| Panel title | 12–14px | Syne | 700 (UPPERCASE) | `+0.08em` | 1.3 |
| KPI value | 22–28px | Syne | 800 | `-0.02em` | 1.1 |
| Body prose | 14–14.5px | DM Sans | 400 | 0 | 1.65 |
| UI label | 13–14px | DM Sans | 500 | 0 | 1.4 |
| Small caps label | 10–11.5px | DM Sans | 600 (UPPERCASE) | `+0.07–0.12em` | 1.3 |
| Button text | 15px | DM Sans | 600 | 0 | 1 |

### Rules

- Never use Arial, Inter, Roboto, or system fonts.
- Headlines always Syne. Body always DM Sans. No exceptions.
- Uppercase tracking (`letter-spacing`) is mandatory for small-caps labels — without it they read cheap.

---

## 5. Spacing & Layout

### Spacing scale

```
XS:   4px
S:    6–8px
M:    12–16px
L:    20–24px
XL:   28–32px
XXL:  40–48px
```

### Container widths & layout tokens

| Token | Value | Notes |
|---|---|---|
| Sidebar width | 220px | Fixed on `SidebarLayout` pages |
| Topbar height | 64px | Fixed on all pages |
| Content max width | 1160px | Feature grids, hero content |
| KPI card gap | 14px | 4-column grid |
| Canvas/info split | 70 / 30 | Visualizer page |

### Grid patterns

| Page | Grid |
|---|---|
| Home — features | 3 columns, 1100px wide, collapses to 1 column @ 900px |
| Home — stats | 4 columns, collapses to 2 @ 900px |
| Dashboard KPIs | 4 columns (Overview) or 7 columns (Analytics), fixed 14px gap |
| Analytics chart rows | 2 columns (left 2/3, right 1/3) |
| Visualizer | 70/30 horizontal split |
| AI Insights cards | 2 columns, collapses to 1 @ 1100px |

### Breakpoints

| Breakpoint | Behavior |
|---|---|
| `max-width: 1100px` | 2-column grids collapse to 1 |
| `max-width: 900px` | Sidebar navigation hides, KPI grid 4→2, feature grid 3→1 |
| `max-width: 600px` | Full mobile — single column everywhere |

Mobile pass targets 768px+ first; full phone-size optimization is Phase 5.

---

## 6. Glass Morphism Recipe

The signature UI effect. Used on every card, panel, modal, and overlay.

### Standard glass card

```css
background: rgba(13, 31, 56, 0.7);        /* --surface @ 70% */
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid #1e3a5f;                /* --border */
border-radius: 20px;                       /* --radius-lg */
```

### Variants

| Variant | Background | Blur | Use |
|---|---|---|---|
| Standard | `rgba(13,31,56,0.7)` | 12px | Default cards, panels |
| Light | `rgba(13,31,56,0.5)` | 14–20px | Info panels, secondary cards |
| Dark | `rgba(10,25,41,0.85)` | 18px | Sidebar, left rail |
| Topbar | `rgba(5,13,26,0.72–0.92)` | 20px | Scroll-activated opacity on navbar |

### Hover

```css
transform: translateY(-2px to -4px);
box-shadow: 0 8px 28px rgba(0,0,0,0.3);
border-color: rgba(14, 165, 233, 0.25);   /* primary-dim */
transition: all 0.2s ease-out;
```

---

## 7. Elevation & Shadows

| Name | Shadow |
|---|---|
| Card hover (light) | `0 4px 14px rgba(245,158,11,0.4)` — amber tint for solar cards |
| Card hover (medium) | `0 8px 28px rgba(0,0,0,0.3)` |
| Card hover (heavy) | `0 14px 36px rgba(0,0,0,0.35)` |
| Primary button halo | `0 8px 28px rgba(14,165,233,0.35), 0 0 0 1px rgba(14,165,233,0.4)` |
| Amber logo glow | `0 4px 14px rgba(245,158,11,0.35–0.4)` |
| Inset stat accent | `inset 0 0 10px rgba(245,158,11,0.04)` |

Defined as convenience tokens:

```css
--shadow-glow-blue:  0 0 24px var(--color-primary-glow), 0 0 60px var(--color-primary-glow);
--shadow-glow-amber: 0 0 24px var(--color-accent-glow), 0 0 60px var(--color-accent-glow);
```

---

## 8. Border Radii

| Token | Value | Usage |
|---|---|---|
| XS | 4–6px | Inputs, small pills |
| SM | 6–8px | Toggle buttons, badges |
| MD | 12px | **Buttons**, standard cards, select dropdowns |
| LG | 18–20px | Large cards, modals, glass cards (`--radius-lg`) |
| XL | 24–28px | Stat cards, feature cards (`--radius-xl`) |
| Full | 50% | Status dots, avatar circles |

**Buttons are 12px, not 999px.** The pill shape is reserved for small chips and status badges only.

```css
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 20px;
--radius-xl: 28px;
--radius-full: 999px;  /* chips only */
```

---

## 9. Buttons

### Primary

```css
background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
color: #fff;
font: 600 15px 'DM Sans';
padding: 14px 32px;
border-radius: 12px;
box-shadow: 0 8px 28px rgba(14,165,233,0.35), 0 0 0 1px rgba(14,165,233,0.4);
transition: all 200ms ease-out;
```

Hover: `translateY(-2px)`, shadow spread expands to `0.45`, overlay gradient lightens.
Active: `translateY(0)`, shadow shrinks.

### Secondary (ghost)

```css
background: transparent;
border: 1px solid var(--border);
color: var(--text-muted);
padding: 14px 28px;
border-radius: 12px;
```

Hover: background `rgba(14,165,233,0.05)`, border-color `rgba(14,165,233,0.4)`, color → `var(--text)`.

### Compact option (tilt selectors, time-range tabs)

```css
padding: 7px 4px;
border-radius: 6px;
```

Active: background `rgba(14,165,233,0.15)`, border-color `rgba(14,165,233,0.45)`, color `var(--primary)`.

### AI indigo action (AI Insights page only)

```css
border: 1px solid #6366f1;
color: #6366f1;
background: transparent;
```

Hover: background `rgba(99,102,241,0.15)`, shadow `0 2px 10px rgba(99,102,241,0.2)`.

---

## 10. Status Indicators

### Status badges (from `design-system.css`)

```css
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}
.status-badge.primary  { background: rgba(14,165,233,0.15); color: var(--primary); }
.status-badge.accent   { background: rgba(245,158,11,0.15); color: var(--accent);  }
.status-badge.success  { background: rgba(34,211,238,0.15); color: var(--success); }
```

### Live dots (pulsing)

```css
width: 5–7px;
height: 5–7px;
border-radius: 50%;
background: #22d3ee;       /* or #4ade80 for green */
box-shadow: 0 0 8px currentColor;
animation: pulse-dot 2s ease-in-out infinite;
```

```css
@keyframes pulse-dot {
  0%   { opacity: 1;    transform: scale(1); }
  50%  { opacity: 0.35; transform: scale(0.95); }
  100% { opacity: 1;    transform: scale(1); }
}
```

### KPI top accent bar

A 2–3px solid bar at the top of each KPI card, color-coded:
- `--primary` for generation/efficiency
- `--accent` for economics/savings
- `--success` for self-consumption/environmental

---

## 11. Animation & Motion

### Standard durations

| Duration | Use |
|---|---|
| 150ms | Micro: hover tints, focus rings |
| 180–250ms | Card transforms, color shifts |
| 400ms | Page transitions (Framer Motion) |
| 500–700ms | Scroll-triggered reveals |
| 1800ms | KPI count-up animations |

### Easings

- Hover / standard: `ease-out` or `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Scroll reveals: `cubic-bezier(0.22, 1, 0.36, 1)` (smooth ease-out)
- Keyframe loops: `ease-in-out`

### Canonical keyframes

| Name | Duration | Effect |
|---|---|---|
| `aurora-drift` | 18–26s | Blob scales 1→1.07→1, opacity 0→1→0 |
| `pulse-dot` | 2–2.5s | Live status dot pulses |
| `fade-up` | 0.5–0.7s | `translateY(18–28px) + opacity 0 → 0 + 1` |
| `reveal` | 0.65s | Scroll-triggered staggered fade-up (0.08–0.32s delays) |
| `dash-move` | 0.5–2.2s linear infinite | Animated dashed borders flow +16px |
| `flow-travel` | 2.2s linear infinite | Dot traverses connector line |

### Framer Motion defaults

- Page transitions: `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0, y: -20 }}`, `transition={{ duration: 0.4 }}`
- Staggered children: `staggerChildren: 0.1` with child delays of 0.15s

### Count-up numbers

KPI values count up from 0 to target over 1800ms with cubic ease-out. Locale-aware formatting (commas).

---

## 12. Component Patterns

### KPI Card (Overview / Analytics)

```
┌─ 2–3px accent bar (color-coded) ─┐
│                                   │
│  LABEL (10–11px, uppercase, dim)  │
│                                   │
│  28 kWh     ← value (Syne 800)    │
│                                   │
│  +12% vs yesterday  ← sub (muted) │
│                                   │
└───────────────────────────────────┘
```

- Background: `rgba(13,31,56,0.75)` + `blur(10px)`
- Border: `1px solid var(--border)`
- Padding: 18–32px
- Top accent: 2–3px solid
- Left glow dot (optional): 90px radius, blur(28px), color-tinted at 0.55 opacity

### Building List Item (Analytics, Visualizer)

```
● Building Name            298 kWh  87%
  status dot   name             value  pct
```

- Flex row, 10–12px padding, 12px radius
- Status dot: 8px circle, pulsing animation, colored by state
- Hover: background shift to `rgba(primary, 0.08)`, border → `rgba(primary, 0.3)`

### Chart Wrapper

```
┌─ Panel Title (Syne 14px 700) ────── timestamp / tab row ─┐
│  Description (12px muted)                                 │
├───────────────────────────────────────────────────────────┤
│                                                           │
│                    [chart canvas]                         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

- Glass card, 20–24px padding
- Canvas height: 210–300px responsive
- Grid lines: `rgba(30,58,95,0.5)`, no axis borders
- Tooltip: dark `#071526` bg, 1px border `--border`, custom glass morphism styling

### Sidebar Navigation Item

```
◻ Icon    Label                 [●]
```

- Padding: 8px 10–13px
- Border-radius: 6px
- Active: background `rgba(14,165,233,0.12)`, color `var(--primary)`, 3px left accent border
- Icon: 17px, opacity 0.75 (1 when active)

Sections on `SidebarLayout` pages:
- **Platform:** Overview, Analytics, Visualizer, Training
- **Intelligence:** AI Insights, Forecasting
- Demo badge at bottom of sidebar

### Top Navbar

```
⚡ SolarIQ     Home  Visualizer  Dashboard  Training     [🎬 Demo]
```

- Fixed, 64px height, full width, z-index 100
- Background: `rgba(5,13,26,0.72–0.92)` + `blur(20px)`
- Border-bottom: `1px solid rgba(30,58,95,0.6)`
- Logo: 32px amber gradient icon + 18px Syne 700 text ("Solar" in `--text`, "IQ" in `--accent` with amber glow)
- Nav links: 13.5px DM Sans, `--text-muted` default, `--primary` active with 2px gradient underline (blue→cyan), smooth color transition on hover

### Energy Flow Diagram (full)

Horizontal 3–4 node chain with connectors:

```
  ☀️            →              🏢            →           ⚡
 Solar Gen    [48px dash]    Building Load  [48px dash]  Grid
 298 kWh                     220 kWh                     78 kWh
```

- Each node: 86–100px flex column, 10px padding, 12px radius
- Node borders: solar (amber), building (blue), grid (cyan)
- Connector: 48px width, animated dashed border (2.2s), 10px arrow tip, 9.5px bold kWh label
- Animated flow dot: 6px amber circle, travels connector (`flow-travel` keyframe)

### Energy Flow (simple 3-node)

Compact inline version for Overview KPI strip and Visualizer info panel.

### Hero Section (Home only)

- Full viewport height
- Center content: label (amber uppercase) → headline (Syne 800, mixed blue highlight) → subhead (DM Sans muted) → 2 CTAs (primary + ghost)
- Aurora blob background (see §16)
- Noise overlay (see §16)
- Staggered Framer Motion entrance (0.15s delay per element)

---

## 13. Interactive States

| State | Visual |
|---|---|
| **Hover** | `translateY(-2px to -4px)`, shadow expands, border shifts to primary-dim |
| **Active / Focus** | Primary color on text/icon, primary border, subtle box-shadow halo |
| **Selected (card)** | Background `rgba(14,165,233,0.12)`, left or top primary border accent |
| **Disabled** | `opacity: 0.5`, `cursor: not-allowed`, color → `var(--text-dim)` |
| **Checked (radio)** | Border → primary, inner dot white 6px, container bg `rgba(14,165,233,0.09)` |

All transitions: `200ms ease-out`.

---

## 14. Page-Specific Accents

| Page | Route | Layout | Primary accent(s) |
|---|---|---|---|
| Home | `/` | TopNavLayout | Primary + accent gradient in headline |
| Overview | `/overview` | SidebarLayout | Primary (interactive), success (live status) |
| Analytics | `/analytics` | SidebarLayout | Multi-color KPI top bars (primary/accent/success/green) |
| Visualizer | `/visualizer` | SidebarLayout | Primary (active building), sky-blue slider thumb |
| Training | `/training` | TopNavLayout | Amber (progress bar), blue→cyan gradient (module progress ring) |
| AI Insights | `/ai-insights` | SidebarLayout | **Indigo `#6366f1` exclusive** — navbar underline, sidebar active, button outlines, confidence bars |
| Forecasting | `/forecasting` | SidebarLayout | Multi-hue (amber bars, blue lines, cyan accents, red risk, green success) |

---

## 15. Iconography

- **Style:** Inline SVG, stroke-based (not filled).
- **Stroke width:** 1.8–2.2px.
- **Size tokens:** 14px (inline), 17px (sidebar), 20–26px (section headers), 32px (logo mark).
- **Color:** Inherit `currentColor` or explicit rgba tint.
- **Sidebar icons:** 17px, `opacity: 0.75` default, `1.0` when active.
- **Status pips:** 6–8px filled circles with matching `box-shadow` glow.
- **Emoji fallbacks** (acceptable in wireframes, replace with SVG in production):
  - ☀️ solar
  - 🏢 building
  - ⚡ electricity
  - 🔄 flow
  - 📊 analytics
  - 🎬 demo mode

---

## 16. Background Effects

### Aurora blobs (hero + dashboard backgrounds)

Three radial-gradient ellipses, each blurred `100–110px`, positioned top-left / top-right / center-bottom, animated with staggered `aurora-drift`:

```css
.blob-1 { background: radial-gradient(ellipse, rgba(245,158,11,0.18), transparent);
          filter: blur(100px); animation: aurora-drift 22s ease-in-out infinite; }
.blob-2 { background: radial-gradient(ellipse, rgba(14,165,233,0.12), transparent);
          filter: blur(110px); animation: aurora-drift 26s ease-in-out infinite -8s; }
.blob-3 { background: radial-gradient(ellipse, rgba(34,211,238,0.08), transparent);
          filter: blur(100px); animation: aurora-drift 18s ease-in-out infinite -14s; }

@keyframes aurora-drift {
  0%, 100% { opacity: 0; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.07); }
}
```

### Noise overlay

SVG turbulence filter, fixed position, inset 0, `pointer-events: none`, `z-index: 0`, `opacity: 0.35`. Subtle texture that elevates the dark palette.

### Grid overlay (canvas + hero)

Linear gradients at 40–60px spacing with stroke `rgba(14,165,233,0.04–0.055)`. Masked or clipped to avoid full-page coverage.

---

## 17. Form Elements

### Select dropdown

- Background: `var(--surface-2)`
- Border: `1px solid var(--border)`, radius 12px
- Padding: 7–12px, DM Sans 13px
- Chevron icon: SVG as `background-image`, right-aligned
- Hover: border → `rgba(primary, 0.4)`
- Focus: border → `var(--primary)`

### Range slider

- Track: `var(--border)`, 4px height, 2px radius
- Filled portion: `linear-gradient(to right, var(--primary), var(--primary))`, dynamic width
- Thumb: 16px `#38bdf8` circle, 2px border, `box-shadow: 0 0 8px currentColor`
- Hover thumb: `scale(1.2)`, `box-shadow: 0 0 14px currentColor`

### Radio (Training module)

- Hidden native input (`appearance: none`)
- 18px circle, 2px border (transparent → primary when `:checked`)
- Inner dot: 6px white `::after` pseudo-element, centered
- Container background on `:checked`: `rgba(14,165,233,0.09)`

---

## 18. Responsive Rules

| Breakpoint | Change |
|---|---|
| < 1100px | 2-column chart/insight grids → 1 column |
| < 900px | Sidebar hides; KPI grid 4→2; feature grid 3→1; padding 28px→24px |
| < 600px | Single column everywhere; reduced hero type; padding 24px→20px |

- `scroll-behavior: smooth` on `html`.
- Chart canvas heights use `clamp()` to shrink gracefully.
- Sidebar collapses to a hamburger drawer below 900px (Phase 5 enhancement).

---

## 19. Accessibility Baseline

- **Focus states:** all interactive elements have visible focus rings (2px `--primary` outline or primary box-shadow halo).
- **ARIA roles:** mandatory on region landmarks, tab lists, listbox, progressbar, alert, and all custom buttons.
- **Color contrast:** body text on `--bg` is 7:1 (WCAG AAA). Muted text meets 4.5:1 minimum.
- **Motion:** honor `prefers-reduced-motion` by disabling aurora, pulse-dot, and long reveal animations.
- **Keyboard:** all interactive flows (building selection, module navigation, demo toggle) work without a mouse.

---

## 20. Implementation Notes

### Tailwind config mapping

Extend `tailwind.config.js` with:

```js
colors: {
  bg: '#050d1a',
  surface: { DEFAULT: '#0d1f38', 2: '#122845', 3: '#0a1929' },
  border: '#1e3a5f',
  primary: '#0ea5e9',
  accent:  '#f59e0b',
  success: '#22d3ee',
  text:    { DEFAULT: '#f0f9ff', muted: '#7ea8c9', dim: '#3d6488' },
  ai:      '#6366f1',
},
fontFamily: {
  display: ['Syne', 'sans-serif'],
  body:    ['DM Sans', 'sans-serif'],
},
borderRadius: {
  sm: '6px', md: '12px', lg: '20px', xl: '28px', full: '999px',
},
```

### Canonical wireframe per component

| Component | Canonical wireframe |
|---|---|
| Hero, stats strip, feature cards | `Wireframe/html/Home.html` |
| KPI strip, campus energy map, live energy flow, system status, quick actions | `Wireframe/html/Overview.html` |
| 7-KPI row, production vs consumption chart, donut chart, AI insights mini-panel, economics summary | `Wireframe/html/analytics.html` |
| 70/30 canvas split, building selector, simulation controls | `Wireframe/html/Visualizer.html` |
| Module sidebar, module content, progress tracking | `Wireframe/html/Training.html` |
| AI insight cards, confidence panel, indigo accents | `Wireframe/html/AIInsights.html` |
| Forecast chart, weather strip, per-building table | `Wireframe/html/Forecasting.html` |
| All shared tokens | `Wireframe/html/design-system.css` |

### CSS strategy

- Define CSS custom properties in `index.css` using the canonical names (`--bg`, `--primary`, etc.) to match `design-system.css`.
- Reference them via `var(--name)` in components — **do not** hardcode hex values in component files.
- Tailwind utilities for layout and spacing; inline styles for CSS-variable references that Tailwind doesn't cover.

---

## 21. Visual Inspiration References

### `documentation/frontend examples/SCR-20260406-lich.png` — "SolarSync" (dark)

Very close aesthetic match. **Adopt:**
- KPI card treatment with sparkline + primary number + delta
- Inset "3D panel" visual motif for hero/stat cards
- List-style building/system panel on the right
- Dark navy base with subtle color accent bars

**Differences from SolarIQ:** uses orange/red gradient for production chart (we use blue + amber); has a "75 panels" counter with a 3D illustration (we use real Three.js scene).

### `documentation/frontend examples/SCR-20260406-lhly.png` — "SolarSync" (light variant)

**Reference for layout and component architecture only.** Same dashboard layout in a light palette.

**Reject the light palette entirely** — SolarIQ is dark-first per CLAUDE.md. Use this image to validate that our chosen layout patterns (left sidebar, KPI + chart grid, right-rail system list) are robust, but do not migrate any colors from this screenshot.

### `documentation/frontend examples/dribble.md`

Search query bank for ongoing Dribbble inspiration research. Best starting query: `dark energy monitoring dashboard glassmorphism`.

### `Wireframe/html/*.html`

**The canonical ground truth.** All 7 pages are already built to exact pixel specification. When this document and a wireframe disagree, **the wireframe wins**.

---

## Changelog

| Date | Change |
|---|---|
| 2026-04-18 | Initial document. Extracted from `design-system.css`, all 7 wireframes, and cited frontend examples. |
