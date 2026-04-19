import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'

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

export default function TopNavLayout() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav style={navStyle(scrolled)} aria-label="Primary navigation">
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent) 0%, #f97316 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
          }}>☀️</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', lineHeight: 1 }}>
            Solar<span style={{ color: 'var(--accent)' }}>IQ</span>
          </span>
        </Link>

        {/* Nav links */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: 28, listStyle: 'none', margin: 0, padding: 0 }}>
          <li><NavLink to="/" end style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>Home</NavLink></li>
          <li><NavLink to="/analytics" style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>Analytics</NavLink></li>
          <li><NavLink to="/visualizer" style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>3D Visualizer</NavLink></li>
          <li><NavLink to="/ai-insights" style={({ isActive }) => ({ ...linkStyle, color: isActive ? 'var(--text)' : 'var(--text-muted)' })}>AI Insights</NavLink></li>
          <li>
            <NavLink to="/overview" style={ctaStyle}>Open Dashboard →</NavLink>
          </li>
        </ul>
      </nav>

      {/* Push content below fixed nav */}
      <div style={{ paddingTop: 64 }}>
        <Outlet />
      </div>
    </>
  )
}
