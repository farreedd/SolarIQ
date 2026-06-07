import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../components/UI/Icon'

/* ── Reduced-motion check (safe for SSR / older browsers) ── */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ── Count-up hook ── */
function useCountUp(target, decimals = 0, duration = 1800, started = false) {
  // Honor reduced-motion: snap to the final value immediately so the number
  // is never left at 0 and never animates.
  const reduced = prefersReducedMotion()
  // Seed so the number is never a literal 0 once counting begins: reduced-motion
  // snaps to the final value; everyone else starts at a small 2% seed that clears
  // the rounding/toFixed threshold for every stat (even the 1-decimal one).
  const seed = reduced ? target : 0.02 * target
  const [value, setValue] = useState(() => (started ? seed : 0))
  // Adjust state during render (React's recommended pattern over an effect) the
  // moment `started` flips true, so the very first painted frame after the stats
  // scroll into view is already non-zero — no one-frame "0" flash before rAF.
  // For reduced motion `seed === target`, so this also lands the final value
  // immediately with no animation.
  const [wasStarted, setWasStarted] = useState(started)
  if (started && !wasStarted) {
    setWasStarted(true)
    if (value === 0) setValue(seed)
  }
  useEffect(() => {
    // reduced-motion has no animation — the seeded value above is already final.
    if (!started || reduced) return
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
  }, [started, target, duration, reduced])
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
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
        backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px 28px',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
        transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
      }}
    >
      <span style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: 'linear-gradient(90deg,transparent,var(--accent),transparent)', opacity: 0.8 }} />
      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, background: 'radial-gradient(ellipse at 50% 120%,rgba(245,158,11,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <Icon name={icon} size={22} color="#f59e0b" />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 'clamp(2.1rem,3.2vw,2.9rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--text)' }}>
          {formatted}
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--accent)', opacity: 0.7 }}>{unit}</span>
      </div>
      <span style={{ display: 'block', fontSize: 14, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 10 }}>
        {label}
      </span>
    </motion.div>
  )
}

/* ── Feature Card ── */
const ICON_VARIANTS = {
  amber: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', shadow: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  cyan:  { bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.22)', shadow: 'rgba(34,211,238,0.12)', color: '#22d3ee' },
  blue:  { bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.22)', shadow: 'rgba(14,165,233,0.12)', color: '#0ea5e9' },
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
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012)), rgba(13,31,56,0.5)',
        backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${hovered ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.09)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', gap: 18,
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.35),0 0 0 1px rgba(14,165,233,0.25)' : '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.22)',
        transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
      }}
    >
      <span style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 0% 0%,rgba(14,165,233,0.06) 0%,transparent 55%)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: 'none' }} />
      <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 8px 24px ${c.shadow}` }}>
        <Icon name={icon} size={26} color={c.color} />
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

/* ── Overdrive: Solar sun-path arc ───────────────────────────────────────────
   A geometric signature: a glowing sun (disc + rays) tracks Qatar's sun path
   across the hero, trailing a thin amber "charging" line. Pure SVG + SMIL, so it
   works in every browser. Under prefers-reduced-motion it renders a static frame
   (full arc, sun at noon) with no animation. */
const SUN_ARC = 'M 70 300 Q 500 56 930 300'
const SUN_DUR = '17s'

function SunPathHero() {
  const reduced = prefersReducedMotion()
  const fade = { attributeName: 'opacity', values: '0;0.92;0.92;0', keyTimes: '0;0.08;0.9;1', dur: SUN_DUR, repeatCount: 'indefinite' }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="sunArcGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.04" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
          <stop offset="32%" stopColor="#f59e0b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* invisible motion guide */}
      <path id="sunArcPath" d={SUN_ARC} fill="none" />
      {/* faint full arc */}
      <path d={SUN_ARC} fill="none" stroke="rgba(245,158,11,0.13)" strokeWidth="1.5" strokeDasharray="1.5 7" strokeLinecap="round" />
      {/* charged trail (drawn behind the sun) */}
      <path
        d={SUN_ARC} fill="none" stroke="url(#sunArcGrad)" strokeWidth="2.5" strokeLinecap="round"
        pathLength="100" strokeDasharray="100"
        strokeDashoffset={reduced ? 0 : 100}
        opacity={reduced ? 0.5 : undefined}
      >
        {!reduced && <animate attributeName="stroke-dashoffset" values="100;0" dur={SUN_DUR} repeatCount="indefinite" />}
        {!reduced && <animate {...fade} />}
      </path>

      {/* sun */}
      <g opacity={reduced ? 0.9 : undefined} transform={reduced ? 'translate(500,56)' : undefined}>
        {!reduced && <animateMotion dur={SUN_DUR} repeatCount="indefinite" rotate="0"><mpath href="#sunArcPath" /></animateMotion>}
        {!reduced && <animate {...fade} />}
        <circle r="48" fill="url(#sunGlow)" />
        <g stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4
            return <line key={i} x1={Math.cos(a) * 15} y1={Math.sin(a) * 15} x2={Math.cos(a) * 23} y2={Math.sin(a) * 23} />
          })}
        </g>
        <circle r="9" fill="#fde68a" />
        <circle r="9" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.85" />
      </g>
    </svg>
  )
}

/* ── Page ── */
export default function Home() {
  const statsSectionRef = useRef(null)
  const [countersStarted, setCountersStarted] = useState(false)

  useEffect(() => {
    const el = statsSectionRef.current
    if (!el) return
    // If the stats section is already on screen at mount, the IntersectionObserver
    // may never "intersect" (no scroll happens) — start the counters straight away.
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < vh && rect.bottom > 0) { setCountersStarted(true); return }
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
        @keyframes scroll-bob {
          0%,100% { transform:translateY(0); opacity:0.65; }
          50%     { transform:translateY(5px); opacity:1; }
        }
        .scroll-cue-chev { animation:scroll-bob 1.8s ease-in-out infinite; }
        .home-btn-primary { transition:transform 0.2s,box-shadow 0.2s !important; }
        .home-btn-primary:hover { transform:translateY(-2px) !important; box-shadow:0 14px 36px rgba(14,165,233,0.45),0 0 0 1px rgba(14,165,233,0.5) !important; }
        .home-btn-primary:hover .btn-arrow { transform:translateX(4px); }
        .home-btn-primary:focus-visible { outline:2px solid var(--primary) !important; outline-offset:3px !important; }
        .home-btn-primary:active { transform:translateY(0) scale(0.98) !important; box-shadow:0 4px 14px rgba(14,165,233,0.3),0 0 0 1px rgba(14,165,233,0.5) !important; }
        .home-btn-ghost:focus-visible { outline:2px solid var(--primary) !important; outline-offset:3px !important; }
        .home-btn-ghost:active { transform:translateY(0) scale(0.98) !important; }
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
        ].map((b, i) => (
          <div key={i} style={{ position: 'absolute', width: b.w, height: b.h, background: b.bg, borderRadius: '50%', filter: 'blur(100px)', top: b.top, left: b.left, right: b.right, bottom: b.bottom, animation: `aurora-drift ${b.dur} ease-in-out infinite`, animationDelay: b.delay }} />
        ))}
      </div>

      {/* 3.1f — Noise overlay */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`, opacity: 0.35 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ 3.1b — HERO ══ */}
        <section style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '72px 24px 84px', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>

          {/* Overdrive: solar sun-path arc (SVG; static under reduced-motion) */}
          <SunPathHero />

          {/* Grid decoration */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(14,165,233,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 100%)' }} />

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            QEERI · Qatar Foundation Campus · 2026
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,6vw,5.25rem)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.06, color: 'var(--text)', maxWidth: 880, margin: '0 auto 24px', textWrap: 'balance' }}>
            Qatar's{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 800 }}>Solar</span>
              {/* Signature: the amber energy line draws itself across once the headline lands */}
              <motion.span
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.7 }}
                transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius: 2, transformOrigin: 'left center' }}
              />
            </span>
            {' '}Future, Visualized
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            style={{ fontSize: 'clamp(1rem,1.6vw,1.2rem)', fontWeight: 400, color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 30px', lineHeight: 1.6 }}>
            Real-time 3D solar intelligence for QF Campus buildings. Monitor generation, consumption, and carbon impact — powered by AI.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/visualizer" className="home-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 8px 28px rgba(14,165,233,0.35),0 0 0 1px rgba(14,165,233,0.4)' }}>
              Explore 3D Visualizer <span className="btn-arrow" style={{ display: 'inline-block', transition: 'transform 0.2s' }}>→</span>
            </Link>
            <Link to="/analytics" className="home-btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 'var(--radius-md)', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'border-color 0.2s,color 0.2s,background 0.2s' }}>
              View Analytics
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginTop: 22, paddingTop: 20, borderTop: '1px solid rgba(30,58,95,0.5)' }}>
            {[
              { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>, label: 'Live QF Campus Data' },
              { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20"/><path d="M12 2v10l4.24 3.46"/></svg>, label: '5 Buildings Monitored' },
              { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, label: 'AI-Powered Forecasting' },
            ].map(({ svg, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{svg}</span>
                {label}
              </div>
            ))}
          </motion.div>

          {/* Scroll cue — gentle guidance to the content below (static under reduced-motion) */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.95 }}
            style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, pointerEvents: 'none' }}
          >
            <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>Scroll</span>
            <span className="scroll-cue-chev" style={{ display: 'block', lineHeight: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </span>
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
              <StatCard icon="zap" target={872}   decimals={0} unit="MWh/yr" label="Annual Generation" delay={0}    started={countersStarted} />
              <StatCard icon="leaf" target={427}   decimals={0} unit="t CO₂"  label="Avoided Annually" delay={0.08} started={countersStarted} />
              <StatCard icon="dollar-sign" target={12400} decimals={0} unit="QAR/mo" label="Monthly Savings"   delay={0.16} started={countersStarted} />
              <StatCard icon="bar-chart" target={74.2}  decimals={1} unit="%"      label="Self-Consumption" delay={0.24} started={countersStarted} />
            </div>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 24, fontSize: 12, color: 'var(--text-dim)', fontWeight: 500, lineHeight: 1.5 }}>
              <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--text-dim)', fontSize: 10, fontWeight: 700, fontStyle: 'italic', flexShrink: 0 }}>i</span>
              Modeled estimate — figures are simulated from Qatar-calibrated solar models, not metered readings.{' '}
              <Link to="/analytics" style={{ color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: 2, fontWeight: 600 }}>See methodology</Link>
            </p>
          </div>
        </section>

        {/* ══ 3.1d — FEATURES ══ */}
        <section style={{ padding: '80px 24px 100px' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1, marginBottom: 14, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', textWrap: 'balance' }}>
                Everything You Need, In One Platform
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
                Five connected modules. One unified solar intelligence platform for QF Campus.
              </p>
            </div>
            <div className="features-grid-home" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, maxWidth: 1100, margin: '0 auto' }}>
              <FeatureCard icon="building" iconVariant="amber" title="3D Visualizer"
                desc="Immersive, real-time 3D rendering of QF Campus buildings with live solar panel overlays, irradiance heat maps, and shadow simulation tied to Qatar's sun path."
                linkTo="/visualizer" delay={0} />
              <FeatureCard icon="trending-up" iconVariant="cyan" title="Analytics Dashboard"
                desc="Comprehensive energy intelligence — production vs. consumption trends, per-building breakdowns, economic metrics, and exportable reports across any time range."
                linkTo="/analytics" delay={0.08} />
              <FeatureCard icon="cpu" iconVariant="blue" title="AI Insights"
                desc="Machine-learning driven recommendations for load shifting, predictive fault detection, weather-adjusted forecasts, and ROI optimization calibrated for Qatar's climate."
                linkTo="/ai-insights" delay={0.16} />
              <FeatureCard icon="cloud-sun" iconVariant="cyan" title="Solar Forecasting"
                desc="Day-ahead and intraday generation forecasts driven by weather models, so you can plan loads and grid export against Qatar's irradiance and temperature."
                linkTo="/forecasting" delay={0.24} />
              <FeatureCard icon="graduation-cap" iconVariant="blue" title="Training Center"
                desc="Guided modules on solar fundamentals, the QF Campus deployment, and reading the platform — onboard operators and stakeholders at their own pace."
                linkTo="/training" delay={0.32} />
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
