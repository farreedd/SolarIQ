---
name: SolarIQ
description: A premium, dark-navy liquid-glass dashboard for QEERI's QF-campus solar program.
colors:
  bg: "#050d1a"
  surface: "#0d1f38"
  surface-2: "#122845"
  border: "#1e3a5f"
  primary: "#0ea5e9"
  accent: "#f59e0b"
  success: "#22d3ee"
  positive: "#4ade80"
  text: "#f0f9ff"
  text-muted: "#7ea8c9"
  text-dim: "#6b97bd"
  text-dim-decorative: "#3d6488"
typography:
  display:
    fontFamily: "Syne, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Syne, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  kpi:
    fontFamily: "Syne, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  sm: "6px"
  md: "12px"
  lg: "20px"
  xl: "28px"
  full: "999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
  nav-cta:
    backgroundColor: "rgba(14,165,233,0.12)"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "8px 20px"
  glass-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "24px"
  status-badge-primary:
    backgroundColor: "rgba(14,165,233,0.15)"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
---

# Design System: SolarIQ

## 1. Overview

**Creative North Star: "The Observation Deck at Night"**

SolarIQ should feel like standing in a calm, dark control room looking out over the QF campus while the energy data glows in front of you. The surround is deep, near-black navy so nothing competes with the numbers; the panels are panes of cool, lightly frosted glass that catch a faint top sheen, as if lit from a screen rather than the sun. Amber is the one warm note, used the way a single status light reads across a dark room: it means energy, and it is rare enough to mean something. This is a **product** register: the design serves the data, it is not the show.

The system explicitly rejects three looks. It is not a **generic SaaS template** (no repeated icon-heading-text card grid, no gradient hero-metric block, no tracked-uppercase eyebrow above every section). It is not **cluttered enterprise BI** (no chart-junk, no wall of equal-weight gauges, hierarchy is enforced). And it is not **flashy crypto/gaming** (glow is a rare accent, never the default coat of paint). Premium here is carried by restraint, accurate type, and real contrast, not by effects.

**Key Characteristics:**
- Dark-navy canvas only; no light or white backgrounds anywhere.
- Liquid glass as the panel material: layered translucency, a 20px saturated backdrop blur, a hairline white border, and one soft specular sheen at the top.
- Two-font system: Syne for display and big numbers, DM Sans for everything readable.
- One amber accent for energy, one sky-blue for actions, used sparingly; cyan and green are reserved for data and positive status.
- WCAG AA contrast and non-color status cues are non-negotiable, even in the dark theme.

## 2. Colors

A cold, deep-navy ground with a small, disciplined set of luminous accents; warmth appears only as the amber energy note.

### Primary
- **Sky Action Blue** (`#0ea5e9`): the single interactive color. Links, primary buttons, focus rings, active nav, the "self-consumed" data series. If something is clickable or selected, it trends toward this blue. Used on a small fraction of any screen so it always reads as "act here".

### Secondary
- **Solar Amber** (`#f59e0b`): the energy color. Highlights, the sun mark, the production/peak data series, the one accent allowed to glow. Treated as scarce; amber on more than a small share of a screen reads as alarm, not brand.

### Tertiary
- **Signal Cyan** (`#22d3ee`): positive data and "success" series in charts; distinct from blue so action and outcome never blur.
- **Producing Green** (`#4ade80`): "producing / active / up" status and savings deltas. Always paired with a word or arrow, never color alone (`--positive`).

### Neutral
- **Abyss Navy** (`#050d1a`): the page background; the dark room the data sits in.
- **Surface Navy** (`#0d1f38`) and **Raised Navy** (`#122845`): solid panel and card fills under the glass layer.
- **Hairline Border** (`#1e3a5f`): subtle structural dividers and panel edges.
- **Ink** (`#f0f9ff`): primary near-white text.
- **Muted Ink** (`#7ea8c9`): secondary text, nav labels.
- **Dim Ink** (`#6b97bd`): the lowest-contrast text allowed; holds AA (6.3:1 on bg, 4.8:1 on raised navy).
- **Decorative Dim** (`#3d6488`): non-text decoration only (inactive dots, faint rules). Forbidden for any text.

### Named Rules
**The Amber Scarcity Rule.** Solar Amber is the only color permitted to glow, and it covers at most a small share of any screen. Its rarity is what makes it mean "energy".

**The Dim Ink Floor Rule.** `#3d6488` never carries text. The lowest text color is `#6b97bd`. If text looks too faint, it is too faint; move it up the ramp, never down.

## 3. Typography

**Display Font:** Syne (sans-serif)
**Body Font:** DM Sans (sans-serif)

**Character:** Syne is geometric, slightly mechanical, and confident; it makes big numbers feel engineered. DM Sans is a clean, neutral workhorse that gets out of the way at reading sizes. The pair contrasts on weight and personality, not on two near-identical sans-serifs.

### Hierarchy
- **Display** (Syne, 700, 40px, line-height 1.05, tracking -0.025em): hero and page-defining headings.
- **Headline** (Syne, 700, 28px, line-height 1.15): section titles and panel headers.
- **KPI** (Syne, 700, 28px, line-height 1): the signature treatment for headline metric numbers (`.kpi-value`). The numbers are the visual payload of the product.
- **Body** (DM Sans, 400, 16px, line-height 1.6): all reading text; cap measure at 65–75ch.
- **Label** (DM Sans, 500, 12–14px, tracking 0.04em): chips, axis labels, nav links, status words.

### Named Rules
**The Number-Is-the-Hero Rule.** KPI values get the display face at large size and bold weight; their labels stay small and muted. The eye lands on the number first, every time.

**The Caps-for-Labels-Only Rule.** Uppercase is reserved for short labels and status words (4 words or fewer). Never set body copy or headings in all caps.

## 4. Elevation

A hybrid system: tonal navy layering provides the base depth (bg → surface → surface-2), and a single glass shadow recipe lifts panels off that ground. There is no broad ambient drop-shadow vocabulary; depth comes from the glass material itself (blur, hairline border, inset highlights) plus a tonal step, not from stacking dark shadows.

### Shadow Vocabulary
- **Glass Rest** (`box-shadow: 0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)`): the default panel shadow; the inset top highlight is what sells "glass".
- **Glass Hover** (`box-shadow: 0 16px 44px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.22)`): paired with a 2px lift on interactive cards only.
- **Blue Glow / Amber Glow** (`0 0 24px <glow>, 0 0 60px <glow>`): reserved for active or energy-bearing elements; never ambient.

### Named Rules
**The Lift-On-Intent Rule.** The hover lift (translateY(-2px) + brighter edge) is only for cards that actually do something on click. Static display cards stay at rest, so motion always signals interactivity.

## 5. Components

### Buttons
- **Shape:** small radius (`6px`), compact.
- **Primary CTA:** sky-blue tinted fill with a blue border (`rgba(14,165,233,0.12)` bg, `rgba(14,165,233,0.35)` border), `--primary` text, weight 600, padding `8px 20px`. Used for the headline action ("Open Dashboard").
- **Hover / Focus:** 200ms color/border transition; visible `:focus-visible` ring (2px `--primary`, 2px offset). Cursor pointer on every clickable element.
- **Ghost / nav link:** muted-ink label, no fill, brightens to `--text` on active/hover.

### Cards / Containers
- **Corner Style:** large radius (`20px`).
- **Background:** the liquid-glass recipe (`--glass-bg`: a white-tinted 135deg gradient over `rgba(13,31,56,0.5)`), `20px` saturated backdrop blur.
- **Border:** hairline white (`1px rgba(255,255,255,0.12)`), brightening to `0.18` on hover.
- **Shadow Strategy:** Glass Rest at rest, Glass Hover + 2px lift only when interactive (see Elevation).
- **Sheen:** a single `::before` top-down white gradient (10% to 0% over 38%) at `z-index:-1` for the specular highlight. One sheen per card, never stacked.
- **Internal Padding:** `24px` default. **Never nest a glass card inside another glass card.**

### Inputs / Fields
- **Style:** raised-navy fill (`--surface-2`), hairline border, small radius.
- **Focus:** `--primary` focus ring via the global `:focus-visible` rule; no removal of outlines.

### Navigation
- **Top nav (Home, Training):** fixed, translucent navy bar that deepens on scroll; logo (amber sun mark) left, muted-ink links, one tinted blue CTA right.
- **Sidebar (dashboards):** 220px rail with the sun-mark logo and icon+label items; active item brightens to `--text`. Mobile collapses the rail.

### Status Badge (signature)
- Pill (`12px` radius), `4px 10px`, weight 500, a tinted background of its own hue at ~15% alpha with full-strength text in that hue. Variants: primary (blue), accent (amber), success (cyan). Status that matters is always backed by a word, not color alone.

### Liquid-Glass Panel (signature)
The defining surface of the product. Canonical source of truth is the `.liquid-glass` / `.glass-card` class. Any new panel adopts the class rather than re-declaring the recipe inline, so the sheen, border, shadow, and hover stay identical everywhere.

## 6. Do's and Don'ts

### Do:
- **Do** keep the canvas dark navy (`#050d1a`) everywhere; surfaces step up through `#0d1f38` and `#122845`.
- **Do** give headline numbers the Syne display face at large size; let labels stay small and muted (the Number-Is-the-Hero Rule).
- **Do** hold all text at 4.5:1 or better; the lowest text color is `#6b97bd`, and `#3d6488` is decoration only.
- **Do** back every meaningful status with a word or icon, not color alone (color-blind and dark-room safe).
- **Do** reuse the `.liquid-glass` class for new panels so the glass recipe stays identical, and reserve the hover lift for cards that are actually clickable.
- **Do** respect `prefers-reduced-motion` (MotionConfig + the CSS reduce block already in place).

### Don't:
- **Don't** ship the **generic SaaS template** look: no repeated icon-heading-text card grid, no gradient hero-metric block, no tiny tracked-uppercase eyebrow above every section.
- **Don't** drift into **cluttered enterprise BI**: no chart-junk, no wall of equal-weight gauges, never let everything share the same visual weight.
- **Don't** go **flashy crypto/gaming**: glow is a rare accent (amber and active states only), never the default coat of paint.
- **Don't** use any light or white page background.
- **Don't** let amber cover more than a small share of a screen, and don't add a second glow color (the Amber Scarcity Rule).
- **Don't** nest a glass card inside another glass card, or stack more than one specular sheen.
- **Don't** set body copy in all caps; uppercase is for short labels and status words only.
