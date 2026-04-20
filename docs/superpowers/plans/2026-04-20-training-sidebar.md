# Training Page Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Training Center page shell with a functional ModuleSidebar component matching `Wireframe/html/Training.html` pixel-for-pixel.

**Architecture:** `Training.jsx` owns state (`activeModule`, `completedModules`) and renders a full-viewport two-panel layout using `position: fixed` to escape `TopNavLayout`'s padded container. The 280px left panel is extracted to `components/Training/ModuleSidebar.jsx`, receiving active/completed state and an `onSelect` callback. The right panel is a placeholder for Task 3.5b.

**Tech Stack:** React 18 + Vite, inline styles (CSS custom properties), React Router v6 NavLink

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `frontend/src/components/UI/TopNavLayout.jsx` | Add Training nav link |
| Modify | `frontend/src/index.css` | Add `pulse-dot` keyframe |
| Create | `frontend/src/components/Training/ModuleSidebar.jsx` | 280px sidebar — progress header, 7 module items, footer |
| Modify | `frontend/src/pages/Training.jsx` | Page shell — fixed viewport layout, state, placeholder content panel |
| Modify | `task_tracker.md` | Tick 3.5a complete |

---

### Task 1: Add Training nav link + pulse-dot animation

**Files:**
- Modify: `frontend/src/components/UI/TopNavLayout.jsx`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Add Training NavLink to TopNavLayout**

In `frontend/src/components/UI/TopNavLayout.jsx`, replace the `<ul>` block with:

```jsx
<ul style={{ display: 'flex', alignItems: 'center', gap: 28, listStyle: 'none', margin: 0, padding: 0 }}>
  <li><NavLink to="/" end style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>Home</NavLink></li>
  <li><NavLink to="/analytics" style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>Analytics</NavLink></li>
  <li><NavLink to="/visualizer" style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>3D Visualizer</NavLink></li>
  <li><NavLink to="/training" style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>Training</NavLink></li>
  <li><NavLink to="/ai-insights" style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>AI Insights</NavLink></li>
  <li>
    <NavLink to="/overview" style={ctaStyle}>Open Dashboard →</NavLink>
  </li>
</ul>
```

- [ ] **Step 2: Add pulse-dot keyframe to index.css**

Append to `frontend/src/index.css` (after the `.status-badge` rules):

```css
/* ─── Animations ────────────────────────────────────────────── */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.35; transform: scale(0.7); }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/UI/TopNavLayout.jsx frontend/src/index.css
git commit -m "feat: add Training nav link and pulse-dot animation"
```

---

### Task 2: Create ModuleSidebar component

**Files:**
- Create: `frontend/src/components/Training/ModuleSidebar.jsx`

The sidebar receives: `activeModule` (number 0–6), `completedModules` (Set of indices), `onSelect` (fn).

- [ ] **Step 1: Create ModuleSidebar.jsx**

Create `frontend/src/components/Training/ModuleSidebar.jsx`:

```jsx
const CHECK_ICON = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const MODULES = [
  { title: 'Solar PV Fundamentals', duration: '15 min' },
  { title: 'System Components',     duration: '12 min' },
  { title: 'Energy Flow & Grid',    duration: '10 min' },
  { title: 'Installation Basics',   duration: '14 min' },
  { title: 'Qatar Climate Factors', duration: '8 min'  },
  { title: 'Economic Analysis',     duration: '11 min' },
  { title: 'Safety & Maintenance',  duration: '9 min'  },
]

export default function ModuleSidebar({ activeModule, completedModules, onSelect }) {
  const completedCount = completedModules.size
  const pct = Math.round((completedCount / MODULES.length) * 100)

  return (
    <aside
      style={{
        width: 280, flexShrink: 0,
        background: 'rgba(9,20,38,0.92)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
      aria-label="Training modules navigation"
    >
      {/* ── Progress header ── */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(30,58,95,0.5)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Course Progress
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
            {pct}%
          </span>
        </div>
        <div
          role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
          aria-label={`Course ${pct}% complete`}
          style={{ height: 5, borderRadius: 99, background: 'rgba(30,58,95,0.7)', overflow: 'hidden' }}
        >
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, #fbbf24 100%)',
            boxShadow: '0 0 10px rgba(245,158,11,0.5)',
            transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
        <p style={{ marginTop: 7, fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
          <strong style={{ color: 'var(--accent)' }}>{completedCount} of {MODULES.length}</strong> modules completed
        </p>
      </div>

      {/* ── Module list ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 20px', display: 'flex', flexDirection: 'column', gap: 3 }} aria-label="Module list">
        {MODULES.map((mod, idx) => {
          const isDone   = completedModules.has(idx)
          const isActive = idx === activeModule && !isDone
          const subText  = isDone
            ? `Completed · ${mod.duration}`
            : idx === activeModule
              ? `In progress · ${mod.duration}`
              : `Not started · ${mod.duration}`

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Module ${idx + 1}: ${mod.title} — ${subText}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '11px 12px', borderRadius: 12, position: 'relative',
                border: isActive ? '1px solid rgba(14,165,233,0.35)' : '1px solid transparent',
                background: isActive ? 'rgba(14,165,233,0.12)' : 'transparent',
                boxShadow: isActive ? '0 0 0 1px rgba(14,165,233,0.12) inset, 0 4px 14px rgba(14,165,233,0.08)' : 'none',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'background 0.18s, border-color 0.18s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(14,165,233,0.06)'
                  e.currentTarget.style.borderColor = 'rgba(14,165,233,0.15)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              {/* Left accent bar — active only */}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: 2,
                  background: 'var(--primary)',
                  boxShadow: '0 0 8px rgba(14,165,233,0.7)',
                }} />
              )}

              {/* Number badge */}
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                border: isDone
                  ? '1px solid rgba(74,222,128,0.28)'
                  : isActive
                    ? '1px solid rgba(14,165,233,0.28)'
                    : '1px solid rgba(30,58,95,0.8)',
                background: isDone
                  ? 'rgba(74,222,128,0.12)'
                  : isActive
                    ? 'rgba(14,165,233,0.10)'
                    : 'rgba(13,31,56,0.6)',
                color: isDone ? '#4ade80' : isActive ? 'var(--primary)' : 'var(--text-dim)',
              }}>
                {idx + 1}
              </div>

              {/* Title + subtitle */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  transition: 'color 0.18s',
                }}>
                  {mod.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                  {subText}
                </div>
              </div>

              {/* State indicator */}
              <div style={{ width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isDone && (
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(74,222,128,0.12)',
                    border: '1.5px solid rgba(74,222,128,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#4ade80',
                  }} aria-label="Completed">
                    {CHECK_ICON}
                  </div>
                )}
                {isActive && (
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--primary)',
                    boxShadow: '0 0 8px rgba(14,165,233,0.7)',
                    animation: 'pulse-dot 2.4s ease-in-out infinite',
                  }} aria-label="Active" />
                )}
              </div>
            </button>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(30,58,95,0.4)', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden="true">🎓</span>
          <span>SolarIQ <strong style={{ color: 'var(--text-muted)' }}>Learning Path</strong> v1.0</span>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Training/ModuleSidebar.jsx
git commit -m "feat: create ModuleSidebar component (Task 3.5a)"
```

---

### Task 3: Build Training.jsx page shell

**Files:**
- Modify: `frontend/src/pages/Training.jsx`

The page shell uses `position: fixed; top: 64px` to break out of `TopNavLayout`'s `paddingTop: 64` wrapper and claim the full remaining viewport as a flex row.

- [ ] **Step 1: Replace stub with full page shell**

Replace all content of `frontend/src/pages/Training.jsx` with:

```jsx
import { useState, useEffect } from 'react'
import ModuleSidebar, { MODULES } from '../components/Training/ModuleSidebar'

export default function Training() {
  const [activeModule, setActiveModule]  = useState(0)
  const [completedModules, setCompleted] = useState(new Set())

  // Lock body scroll — this page uses a fixed full-viewport layout
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 64, left: 0, right: 0, bottom: 0,
      display: 'flex',
      zIndex: 1,
    }}>
      <ModuleSidebar
        activeModule={activeModule}
        completedModules={completedModules}
        onSelect={setActiveModule}
      />

      {/* Content area — placeholder until Task 3.5b */}
      <section
        style={{
          flex: 1, minWidth: 0,
          overflowY: 'auto',
          padding: '32px 40px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Module content"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800,
            color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.02em',
          }}>
            {MODULES[activeModule].title}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>
            Module content — Task 3.5b
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173/training` and verify:

1. TopNav shows "Training" link highlighted white (active)
2. Left sidebar is 280px, dark background, right border visible
3. Progress header shows "Course Progress" label, "0%" in amber, empty amber bar, "0 of 7 modules completed"
4. Module 1 is highlighted: blue background, left blue accent bar, pulsing blue dot indicator
5. Modules 2–7 are un-highlighted with muted text
6. Clicking Module 3 moves the blue highlight to Module 3; Module 1 returns to default state
7. Sidebar footer shows "🎓 SolarIQ Learning Path v1.0"
8. Content area shows the active module's title in large display font

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Training.jsx
git commit -m "feat: Training page shell with ModuleSidebar (Task 3.5a)"
```

---

### Task 4: Update task tracker

**Files:**
- Modify: `task_tracker.md`

- [ ] **Step 1: Tick 3.5a in task_tracker.md**

Find Phase 3.5 in `task_tracker.md` and mark 3.5a complete:

```
[x] 3.5a  Module sidebar with progress tracking (7 modules)
```

Update `**Last Updated:**` at the top to `2026-04-20`.

- [ ] **Step 2: Commit**

```bash
git add task_tracker.md
git commit -m "chore(tracker): tick 3.5a Training sidebar complete"
```
