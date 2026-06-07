import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Icon from './Icon'

const navStyle = (scrolled) => ({
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 48px', height: 64,
  background: scrolled ? 'rgba(5,13,26,0.92)' : 'rgba(5,13,26,0.72)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: scrolled ? '1px solid var(--border)' : '1px solid rgba(30,58,95,0.6)',
  transition: 'background 0.3s, border-color 0.3s',
})

const linkStyle = { fontSize: 13.5, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.01em', transition: 'color 0.18s' }
const ctaStyle = {
  ...linkStyle,
  padding: '8px 20px', borderRadius: 'var(--radius-sm)',
  background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.35)',
  color: 'var(--primary)', fontWeight: 600,
}

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/analytics', label: 'Analytics' },
  { to: '/visualizer', label: '3D Visualizer' },
  { to: '/ai-insights', label: 'AI Insights' },
  { to: '/forecasting', label: 'Forecasting' },
  { to: '/training', label: 'Training' },
]

export default function TopNavLayout() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Esc closes the mobile menu and returns focus to the toggle
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <>
      <style>{`
        /* Desktop row visible by default; collapses to hamburger on narrow screens */
        .topnav-desktop { display: flex; }
        .topnav-hamburger { display: none; }
        @media (max-width: 720px) {
          .topnav-bar { padding: 0 20px !important; }
          .topnav-desktop { display: none !important; }
          .topnav-hamburger { display: inline-flex !important; }
        }
        .topnav-link:hover { color: var(--text) !important; }
        .topnav-sheet-link:hover { color: var(--text) !important; background: rgba(14,165,233,0.06) !important; }
        .topnav-burger-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        /* Skip link: visually hidden until focused, then pinned to the top-left */
        .topnav-skip-link {
          position: fixed; top: 8px; left: 8px; z-index: 200;
          padding: 10px 18px; border-radius: var(--radius-sm);
          background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.5);
          color: var(--text); font-size: 13.5px; font-weight: 600;
          text-decoration: none; letter-spacing: 0.01em;
          transform: translateY(-150%); opacity: 0; pointer-events: none;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .topnav-skip-link:focus,
        .topnav-skip-link:focus-visible {
          transform: translateY(0); opacity: 1; pointer-events: auto;
          outline: 2px solid var(--primary); outline-offset: 2px;
        }
      `}</style>

      {/* First focusable element: lets keyboard users jump past the nav */}
      <a href="#main-content" className="topnav-skip-link">Skip to main content</a>

      <nav style={navStyle(scrolled)} className="topnav-bar" aria-label="Primary navigation">
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent) 0%, #f97316 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
          }}><Icon name="sun" size={18} color="#0b1a2f" /></div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', lineHeight: 1 }}>
            Solar<span style={{ color: 'var(--accent)' }}>IQ</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="topnav-desktop" style={{ alignItems: 'center', gap: 24, listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV_LINKS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className="topnav-link"
                style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/overview" style={ctaStyle}>Open Dashboard →</NavLink>
          </li>
        </ul>

        {/* Mobile hamburger toggle */}
        <button
          ref={menuButtonRef}
          type="button"
          className="topnav-hamburger topnav-burger-btn"
          aria-expanded={menuOpen}
          aria-controls="topnav-mobile-menu"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen(o => !o)}
          style={{
            width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
            background: menuOpen ? 'rgba(14,165,233,0.1)' : 'transparent',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text)', cursor: 'pointer', padding: 0,
            transition: 'background 0.18s, border-color 0.18s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {menuOpen
              ? <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>
              : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown sheet */}
      {menuOpen && (
        <div
          id="topnav-mobile-menu"
          style={{
            position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
            background: 'rgba(5,13,26,0.97)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 20px 20px',
            display: 'flex', flexDirection: 'column', gap: 4,
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="topnav-sheet-link"
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                ...linkStyle, fontSize: 15,
                display: 'flex', alignItems: 'center', minHeight: 44,
                padding: '0 12px', borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                background: isActive ? 'rgba(14,165,233,0.08)' : 'transparent',
                transition: 'color 0.18s, background 0.18s',
              })}>
              {label}
            </NavLink>
          ))}
          <NavLink to="/overview" className="topnav-sheet-link"
            onClick={() => setMenuOpen(false)}
            style={{
              ...ctaStyle, fontSize: 15, marginTop: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: 44, padding: '0 12px',
            }}>
            Open Dashboard →
          </NavLink>
        </div>
      )}

      {/* Push content below fixed nav; skip-link target + main landmark */}
      <main id="main-content" tabIndex={-1} style={{ paddingTop: 64, outline: 'none' }}>
        <AnimatePresence mode="wait" initial={false}>
          <div key={pathname}>
            <Outlet />
          </div>
        </AnimatePresence>
      </main>
    </>
  )
}
