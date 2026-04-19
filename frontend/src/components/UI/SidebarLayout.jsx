import { useEffect, useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import DemoBanner from './DemoBanner'

const PAGE_META = {
  '/overview':    { title: 'Overview',      subtitle: 'QF Campus · All Systems' },
  '/analytics':   { title: 'Analytics',     subtitle: 'QF Campus · Energy Intelligence' },
  '/visualizer':  {
    title: '3D Visualizer',
    subtitle: 'Qatar Digital Twin · Education City · Research Complex B01',
    fullBleed: true,
    chips: [
      { label: 'WebGL Live',      color: 'var(--success)', bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.22)' },
      { label: 'Simulation Mode', color: 'var(--accent)',  bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.22)' },
    ],
  },
  '/ai-insights': { title: 'AI Insights',   subtitle: 'Intelligence Hub · Beta' },
  '/forecasting': { title: 'Forecasting',   subtitle: 'QF Campus · 7-Day Outlook' },
}

const NAV_ITEMS = {
  platform: [
    {
      to: '/overview', label: 'Overview',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    },
    {
      to: '/analytics', label: 'Analytics',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
    },
    {
      to: '/visualizer', label: '3D Visualizer',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    },
    {
      to: '/training', label: 'Training',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    },
  ],
  intelligence: [
    {
      to: '/ai-insights', label: 'AI Insights',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    },
    {
      to: '/forecasting', label: 'Forecasting',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v4l3 3"/></svg>,
    },
  ],
}

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px 8px 13px',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none', position: 'relative',
        fontSize: 13.5, fontWeight: isActive ? 500 : 400,
        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
        background: isActive ? 'rgba(14,165,233,0.08)' : 'transparent',
        transition: 'background 0.15s, color 0.15s',
      })}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span style={{
              position: 'absolute', left: 0, top: 7, bottom: 7,
              width: 3, background: 'var(--primary)',
              borderRadius: '0 3px 3px 0',
            }} />
          )}
          <span style={{ width: 17, height: 17, flexShrink: 0, opacity: isActive ? 1 : 0.75, display: 'flex' }}>
            {icon}
          </span>
          {label}
        </>
      )}
    </NavLink>
  )
}

export default function SidebarLayout() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] || { title: 'Dashboard', subtitle: 'QF Campus' }
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: '#0a1929',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', zIndex: 10,
      }} aria-label="Primary navigation">

        {/* Logo */}
        <Link to="/" style={{
          padding: '22px 18px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent) 0%, #f97316 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, flexShrink: 0,
            boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
          }}>☀️</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', lineHeight: 1 }}>
            Solar<span style={{ color: 'var(--accent)' }}>IQ</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '12px 10px 5px' }}>
            Platform
          </span>
          {NAV_ITEMS.platform.map(item => <NavItem key={item.to} {...item} />)}

          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '18px 10px 5px' }}>
            Intelligence
          </span>
          {NAV_ITEMS.intelligence.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        {/* Demo badge */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px',
            background: 'rgba(245,158,11,0.07)',
            border: '1px solid rgba(245,158,11,0.22)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 11.5, fontWeight: 500, color: 'var(--accent)',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--accent)', flexShrink: 0,
              animation: 'pulse-demo 2s ease-in-out infinite',
            }} />
            Demo Mode — Active
          </div>
        </div>
      </aside>

      {/* ── Main column ── */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px',
          background: '#0a1929',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0, gap: 16,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text)', lineHeight: 1.15, margin: 0 }}>
              {meta.title}
            </h1>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{meta.subtitle}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{clock}</span>
            {meta.chips ? meta.chips.map(chip => (
              <div key={chip.label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                background: chip.bg,
                border: `1px solid ${chip.border}`,
                borderRadius: 20, fontSize: 12, fontWeight: 500, color: chip.color,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: chip.color, animation: 'pulse-demo 2s ease-in-out infinite' }} />
                {chip.label}
              </div>
            )) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.22)',
                borderRadius: 20, fontSize: 12, fontWeight: 500, color: 'var(--success)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse-demo 2s ease-in-out infinite' }} />
                All Systems Live
              </div>
            )}
          </div>
        </header>

        {/* Demo banner */}
        <DemoBanner />

        {/* Page content — full-bleed for Visualizer, scrollable otherwise */}
        <div style={meta.fullBleed
          ? { flex: 1, overflow: 'hidden', padding: 0 }
          : { flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 24px 28px' }
        }>
          <Outlet />
        </div>
      </main>

      <style>{`
        @keyframes pulse-demo {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.75); }
        }
        .sidebar-nav-item:hover {
          background: rgba(14,165,233,0.06) !important;
          color: var(--text) !important;
        }
      `}</style>
    </div>
  )
}
