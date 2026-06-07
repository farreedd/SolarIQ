# Product

## Register

product

## Users

Primary: **Qatar Foundation leadership** (executives and decision-makers) reviewing the QF-campus solar program. Their context is a meeting, a demo, or a wall display; they glance for headline outcomes (energy produced, savings, payback, CO2 avoided) before anyone drills in. Secondary: QEERI researchers and engineers who read the data deeply for accuracy, and external visitors or partners who see SolarIQ as a flagship demonstration of QEERI's capability.

The job to be done: make the campus solar program legible and trustworthy in seconds for a non-technical leader, while still rewarding an engineer who wants the detail one layer down.

## Product Purpose

SolarIQ is a smart-solar digital experience platform for QEERI (Qatar Environment and Energy Research Institute) at Qatar Foundation. It combines 3D rooftop-solar visualization of QF campus buildings, real-time energy simulation, analytics dashboards, AI insights, a forecasting view, and a training module, across five campus buildings (B01–B05).

It exists to (1) communicate the value and performance of the campus solar deployment to leadership, and (2) demonstrate QEERI's technical and design capability. Success looks like: a leader reads the seven platform KPIs and believes them without hesitation, and an engineer can interrogate the underlying data without the experience ever feeling less than premium.

## Brand Personality

**Premium and futuristic, anchored by scientific credibility.** Three words: precise, confident, understated. The voice is the voice of a research institute that also has impeccable taste: it does not oversell, it does not use marketing buzzwords, it lets accurate numbers and clean craft carry the impression. Emotional goal: a QF executive should feel quiet confidence, not dazzle for its own sake. Wow comes from the data and the 3D, not from chrome.

## Anti-references

- **Generic SaaS template.** No Stripe/Linear-clone scaffolding: identical icon-heading-text card grids repeated endlessly, the gradient hero-metric block, tiny tracked-uppercase eyebrows above every section.
- **Cluttered enterprise BI.** No Power BI / dense-grid dashboard look: chart-junk, competing gauges, everything the same visual weight, no hierarchy.
- **Flashy crypto/gaming.** No neon overload, no aggressive glow on everything, no hype aesthetics. Glow is a rare accent, not the default. Anything that reads as hype undercuts the scientific trust the platform depends on.

## Design Principles

- **Credibility first.** Every number must read as trustworthy. Precision and legibility beat decoration in every conflict.
- **Glanceable, then deep.** Headline KPIs are legible across a room in seconds; analytical detail lives one layer down and never crowds the top line.
- **Restraint is the premium signal.** The dark-navy / liquid-glass language is a quiet frame for the data, not the performance itself. When in doubt, remove.
- **Data is the hero.** Charts, the 3D campus scene, and the KPI numbers carry the impact. Chrome (nav, panels, borders) stays out of the way.
- **Accessible by default.** AA contrast, status never by color alone, full keyboard operation, reduced-motion honored. Accessibility is part of "premium," not a tax on it.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**. Body text holds at least 4.5:1 against its glass and navy backgrounds (tokens are already tuned for this: `--text-dim` is `#6b97bd`, with the old `#3d6488` demoted to decoration-only). Status is never conveyed by color alone (e.g. building markers carry a status word, not just a colored dot). All interactive elements are keyboard operable with a visible focus ring (`:focus-visible` outline in `--primary`). `prefers-reduced-motion` is respected globally via Framer `MotionConfig reducedMotion="user"` plus a CSS reduce block. Designed for dark-ambient viewing (meeting rooms, wall displays), so contrast is tuned for a dark surround rather than a bright office.
