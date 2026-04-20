import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/* ── Count-up hook ── */
function useCountUp(target, decimals = 0, duration = 1800, started = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!started) return
    let raf
    const startTime = performance.now()
    const easeOut = t => 1 - Math.pow(1 - t, 3)
    const tick = now => {
      const progress = Math.min((now - startTime) / duration, 1)
      setValue(easeOut(progress) * target)
      if (progress < 1) raf = requestAnimationFrame(tick)
      else setValue(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, target, duration])
  return decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString('en-US')
}

/* ── Stat Card ── */
function StatCard({ icon, target, decimals, unit, label, delay, started }) {
  const formatted = useCountUp(target, decimals, 1800, started)
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 28 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className="stat-card-home"
      style={{
        background: 'rgba(13,31,56,0.7)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px 28px',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
        transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
      }}
    >
      <span style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: 'linear-gradient(90deg,transparent,var(--accent),transparent)', opacity: 0.8 }} />
      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, background: 'radial-gradient(ellipse at 50% 120%,rgba(245,158,11,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
        {icon}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,3.5vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, background: 'linear-gradient(135deg,#fbbf24 0%,#f59e0b 60%,#f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {formatted}
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--accent)', opacity: 0.7 }}>{unit}</span>
      </div>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: 10 }}>
        {label}
      </span>
    </motion.div>
  )
}

/* ── Feature Card ── */
const ICON_VARIANTS = {
  amber: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', shadow: 'rgba(245,158,11,0.15)' },
  cyan:  { bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.22)', shadow: 'rgba(34,211,238,0.12)' },
  blue:  { bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.22)', shadow: 'rgba(14,165,233,0.12)' },
}

function FeatureCard({ icon, iconVariant, title, desc, linkTo, delay }) {
  const c = ICON_VARIANTS[iconVariant]
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 28 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(13,31,56,0.6)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? 'rgba(14,165,233,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', gap: 18,
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.35),0 0 0 1px rgba(14,165,233,0.25)' : 'none',
        transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
      }}
    >
      <span style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 0% 0%,rgba(14,165,233,0.06) 0%,transparent 55%)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: 'none' }} />
      <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 8px 24px ${c.shadow}` }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.015em', marginBottom: 10, lineHeight: 1.2 }}>{title}</h3>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
      </div>
      <div style={{ height: 1, background: 'var(--border)', opacity: 0.6 }} />
      <Link to={linkTo} style={{ display: 'inline-flex', alignItems: 'center', gap: hovered ? 10 : 6, fontSize: 13, fontWeight: 600, color: hovered ? '#38bdf8' : 'var(--primary)', textDecoration: 'none', letterSpacing: '0.01em', transition: 'gap 0.2s,color 0.2s' }}>
        Explore <span style={{ display: 'inline-block', transform: hovered ? 'translateX(3px)' : 'none', transition: 'transform 0.2s' }}>→</span>
      </Link>
    </motion.div>
  )
}

/* ── Page ── */
export default function Home() {
  const statsSectionRef = useRef(null)
  const [countersStarted, setCountersStarted] = useState(false)

  useEffect(() => {
    const el = statsSectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setCountersStarted(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <style>{`
        @keyframes aurora-drift {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          10%  { opacity:1; }
          50%  { transform:translate(40px,25px) scale(1.07); }
          90%  { opacity:1; }
          100% { opacity:0; transform:translate(0,0) scale(1); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.35; transform:scale(0.7); }
        }
        .home-btn-primary { transition:transform 0.2s,box-shadow 0.2s !important; }
        .home-btn-primary:hover { transform:translateY(-2px) !important; box-shadow:0 14px 36px rgba(14,165,233,0.45),0 0 0 1px rgba(14,165,233,0.5) !important; }
        .home-btn-primary:hover .btn-arrow { transform:translateX(4px); }
        .home-btn-ghost:hover { border-color:rgba(14,165,233,0.4) !important; color:var(--text) !important; background:rgba(14,165,233,0.05) !important; }
        .stat-card-home:hover { transform:translateY(-4px) !important; box-shadow:0 16px 40px rgba(0,0,0,0.3),0 0 0 1px rgba(245,158,11,0.2) !important; border-color:rgba(245,158,11,0.25) !important; }
        @media (max-width:900px) {
          .stats-grid-home { grid-template-columns:repeat(2,1fr) !important; }
          .features-grid-home { grid-template-columns:1fr !important; max-width:520px !important; }
        }
        @media (max-width:600px) {
          .stats-grid-home { gap:12px !important; }
          .footer-strip-home { padding:20px 24px !important; flex-direction:column !important; align-items:flex-start !important; }
        }
      `}</style>

      {/* 3.1f — Aurora blobs */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[
          { w: 700, h: 500, bg: 'radial-gradient(ellipse,rgba(245,158,11,0.18) 0%,transparent 70%)', top: -140, left: -120, dur: '20s', delay: '0s' },
          { w: 600, h: 600, bg: 'radial-gradient(ellipse,rgba(14,165,233,0.12) 0%,transparent 70%)',  top: 30,  right: -80,  dur: '24s', delay: '-7s' },
          { w: 400, h: 300, bg: 'radial-gradient(ellipse,rgba(34,211,238,0.08) 0%,transparent 70%)',  bottom: '40%', left: '40%', dur: '22s', delay: '-14s' },
        ].map((b, i) => (
          <div key={i} style={{ position: 'absolute', width: b.w, height: b.h, background: b.bg, borderRadius: '50%', filter: 'blur(100px)', top: b.top, left: b.left, right: b.right, bottom: b.bottom, animation: `aurora-drift ${b.dur} ease-in-out infinite`, animationDelay: b.delay }} />
        ))}
      </div>

      {/* 3.1f — Noise overlay */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, opacity: 0.35 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ 3.1b — HERO ══ */}
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>

          {/* Grid decoration */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(14,165,233,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 100%)' }} />

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 2s ease-in-out infinite', flexShrink: 0 }} />
            QEERI · Qatar Foundation Campus · 2026
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,6vw,5.25rem)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.06, color: 'var(--text)', maxWidth: 880, margin: '0 auto 24px' }}>
            Qatar's{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ background: 'linear-gradient(135deg,#f59e0b 0%,#fbbf24 45%,#f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Solar</span>
              <span style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius: 2, opacity: 0.6 }} />
            </span>
            {' '}Future,<br />Visualized
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            style={{ fontSize: 'clamp(1rem,1.6vw,1.2rem)', fontWeight: 400, color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 44px', lineHeight: 1.65 }}>
            Real-time 3D solar intelligence for QF Campus buildings. Monitor generation, consumption, and carbon impact — powered by AI.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/visualizer" className="home-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 8px 28px rgba(14,165,233,0.35),0 0 0 1px rgba(14,165,233,0.4)' }}>
              Explore 3D Campus <span className="btn-arrow" style={{ display: 'inline-block', transition: 'transform 0.2s' }}>→</span>
            </Link>
            <Link to="/analytics" className="home-btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 'var(--radius-md)', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'border-color 0.2s,color 0.2s,background 0.2s' }}>
              View Analytics
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginTop: 52, paddingTop: 40, borderTop: '1px solid rgba(30,58,95,0.5)' }}>
            {[
              { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>, label: 'Live QF Campus Data' },
              { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20"/><path d="M12 2v10l4.24 3.46"/></svg>, label: '5 Buildings Monitored' },
              { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, label: 'AI-Powered Forecasting' },
              { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Qatar Climate Calibrated' },
            ].map(({ svg, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{svg}</span>
                {label}
              </div>
            ))}
          </motion.div>
        </section>

        {/* ══ 3.1c — STATS ══ */}
        <section ref={statsSectionRef} style={{ padding: '80px 24px', background: 'linear-gradient(180deg,transparent 0%,rgba(13,31,56,0.4) 50%,transparent 100%)' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44, justifyContent: 'center' }}>
              <span style={{ flex: 1, maxWidth: 100, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Platform Metrics</span>
              <span style={{ flex: 1, maxWidth: 100, height: 1, background: 'var(--border)' }} />
            </div>
            <div className="stats-grid-home" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
              <StatCard icon="⚡" target={872}   decimals={0} unit="MWh/yr" label="Annual Generation" delay={0}    started={countersStarted} />
              <StatCard icon="🌿" target={427}   decimals={0} unit="t CO₂"  label="Avoided Annually" delay={0.08} started={countersStarted} />
              <StatCard icon="💰" target={12400} decimals={0} unit="QAR/mo" label="Monthly Savings"   delay={0.16} started={countersStarted} />
              <StatCard icon="📊" target={74.2}  decimals={1} unit="%"      label="Self-Consumption" delay={0.24} started={countersStarted} />
            </div>
          </div>
        </section>

        {/* ══ 3.1d — FEATURES ══ */}
        <section style={{ padding: '80px 24px 100px' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1, marginBottom: 14 }}>
                Everything You Need,<br />In One Platform
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
                Three powerful modules. One unified solar intelligence platform for QF Campus.
              </p>
            </div>
            <div className="features-grid-home" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, maxWidth: 1100, margin: '0 auto' }}>
              <FeatureCard icon="🏗️" iconVariant="amber" title="3D Campus Visualizer"
                desc="Immersive, real-time 3D rendering of QF Campus buildings with live solar panel overlays, irradiance heat maps, and shadow simulation tied to Qatar's sun path."
                linkTo="/visualizer" delay={0} />
              <FeatureCard icon="📈" iconVariant="cyan" title="Analytics Dashboard"
                desc="Comprehensive energy intelligence — production vs. consumption trends, per-building breakdowns, economic metrics, and exportable reports across any time range."
                linkTo="/analytics" delay={0.08} />
              <FeatureCard icon="🤖" iconVariant="blue" title="AI Insights"
                desc="Machine-learning driven recommendations for load shifting, predictive fault detection, weather-adjusted forecasts, and ROI optimization calibrated for Qatar's climate."
                linkTo="/ai-insights" delay={0.16} />
            </div>
          </div>
        </section>

        {/* ══ 3.1e — FOOTER ══ */}
        <footer className="footer-strip-home" style={{ background: '#0a1929', borderTop: '1px solid var(--border)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#1e3a5f 0%,#0d1f38 100%)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>QF</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>QEERI</span>
            </div>
            <span style={{ width: 1, height: 20, background: 'var(--border)', display: 'block' }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', fontSize: 11, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.04em' }}>◈ v1.0 Demo</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', fontWeight: 500 }}>
            Powered by <strong style={{ color: 'var(--accent)' }}>SolarIQ Intelligence</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px rgba(34,211,238,0.6)', animation: 'pulse-dot 2.5s ease-in-out infinite', display: 'block' }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>All systems operational</span>
          </div>
        </footer>

      </div>
    </motion.div>
  )
}
