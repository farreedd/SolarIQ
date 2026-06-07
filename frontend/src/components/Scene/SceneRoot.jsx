import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { CameraControls, Grid } from '@react-three/drei'
import CampusScene from './CampusScene'
import QatarContext from './QatarContext'
import AmbientFX from './AmbientFX'
import { BUILDINGS, CAMERA_STOPS, BUILDING_GEOMETRY } from '../../utils/visualizerData'

// ── WebGL capability probe ────────────────────────────────────────────────────
// Run once before mounting <Canvas> so locked-down / older hardware never gets a
// blank dark rectangle. Returns false if a WebGL context cannot be created.
function detectWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

// ── Static fallback panel (no WebGL) ──────────────────────────────────────────
// Renders the key campus facts as text so the page still informs when the 3D
// twin cannot run. Matches the liquid-glass HUD language.
function FallbackPanel({ selectedId, message }) {
  const ids = Object.keys(BUILDINGS)
  return (
    <div
      role="img"
      aria-label="3D campus view unavailable. Campus solar data shown as text."
      style={{
        position: 'absolute', inset: 0, zIndex: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        background: 'radial-gradient(ellipse at 55% 35%, #0b2040 0%, #050d1a 65%)',
      }}
    >
      <div
        className="glass-card"
        style={{ maxWidth: 460, width: '100%', padding: 24, textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" /><path d="M12 17h.01" />
            </svg>
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            3D view unavailable on this device
          </div>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 16px' }}>
          {message || 'This device or browser could not start WebGL, so the interactive digital twin is hidden. The campus solar data is shown below instead.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Campus Output', value: '2,373 kWh', accent: 'var(--success)' },
            { label: 'Peak Power', value: '1.85 MW', accent: 'var(--accent)' },
            { label: 'Active Systems', value: '4 / 5', accent: 'var(--text)' },
            { label: 'Efficiency', value: '84%', accent: 'var(--primary)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '10px 12px', borderRadius: 10,
              background: 'rgba(18,40,69,0.55)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: s.accent }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>
          QF Campus Buildings
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ids.map(id => {
            const b = BUILDINGS[id]
            const sel = id === selectedId
            return (
              <li key={id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8,
                padding: '6px 10px', borderRadius: 8,
                background: sel ? 'rgba(14,165,233,0.10)' : 'transparent',
                border: sel ? '1px solid rgba(14,165,233,0.35)' : '1px solid transparent',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text)' }}>
                  <strong style={{ color: sel ? 'var(--primary)' : 'var(--text)' }}>{id}</strong>
                  {' · '}{b.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {b.size} kWp · {b.pvType} · {b.status}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// ── Error boundary (must be a class — hooks can't catch render errors) ─────────
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error) {
    this.props.onError?.(error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <FallbackPanel
          selectedId={this.props.selectedId}
          message="The 3D engine hit an error and stopped. Campus solar data is shown below instead."
        />
      )
    }
    return this.props.children
  }
}

// ── Loading overlay shown while the scene (suspense) initialises ──────────────
function LoadingOverlay() {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 4,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 14, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 55% 35%, rgba(11,32,64,0.65) 0%, rgba(5,13,26,0.85) 70%)',
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{
        width: 34, height: 34, borderRadius: '50%',
        border: '2.5px solid rgba(14,165,233,0.2)',
        borderTopColor: 'var(--primary)',
        animation: 'sceneSpin 0.9s linear infinite',
      }} />
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
        letterSpacing: '0.04em', color: 'var(--text-muted)',
      }}>
        Initializing digital twin…
      </span>
      <style>{`@keyframes sceneSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Smooth camera transitions — responds to both stop and selectedId changes
function CameraRig({ stop, selectedId, controlsRef, fitNonce }) {
  useThree()
  useEffect(() => {
    const cam = controlsRef.current
    if (!cam) return

    if (stop === 'Building' && selectedId && BUILDING_GEOMETRY[selectedId]) {
      const geo = BUILDING_GEOMETRY[selectedId]
      const [bx, , bz] = geo.position
      const h = geo.height
      const [fw, fd] = geo.footprint

      // Outward unit vector from campus centre through this building.
      // Camera sits along this vector so no other building can occlude the view.
      const len = Math.sqrt(bx * bx + bz * bz) || 1
      const dx = bx / len
      const dz = bz / len

      // View distance scales with footprint; height scales with building height
      const viewDist  = Math.max(fw, fd) * 1.2 + 8
      const camHeight = Math.max(h * 1.8, 6)

      cam.setLookAt(
        bx + dx * viewDist, camHeight, bz + dz * viewDist,
        bx, h / 2, bz,
        true,
      )
      return
    }

    const s = CAMERA_STOPS[stop]
    if (!s) return
    cam.setLookAt(
      s.position[0], s.position[1], s.position[2],
      s.target[0],   s.target[1],   s.target[2],
      true,
    )
  }, [stop, selectedId, controlsRef, fitNonce])
  return null
}

// Reads azimuth each frame and fires onHeadingChange when it moves > 0.5°
function HeadingTracker({ controlsRef, onHeadingChange }) {
  const last = useRef(0)
  useFrame(() => {
    if (!controlsRef.current || !onHeadingChange) return
    const deg = controlsRef.current.azimuthAngle * (180 / Math.PI)
    if (Math.abs(deg - last.current) > 0.5) {
      last.current = deg
      onHeadingChange(deg)
    }
  })
  return null
}

// Fires once the first frame is rendered so the HUD can mark WebGL "Live".
function ReadySignal({ onReady }) {
  const fired = useRef(false)
  useFrame(() => {
    if (!fired.current) {
      fired.current = true
      onReady?.()
    }
  })
  return null
}

export default function SceneRoot({
  stop, selectedId, onSelectBuilding, onHeadingChange,
  fitNonce, onReady, onError, reducedMotion, lowPower,
}) {
  const controlsRef = useRef()
  const webglOk = useMemo(detectWebGL, [])
  const [contextLost, setContextLost] = useState(false)

  // On small / low-power viewports (phones), drop the render resolution ceiling
  // and skip shadow maps so the scene stays smooth without overheating the GPU.
  const shadowsOn = !reducedMotion && !lowPower
  const dpr = lowPower ? [1, 1.5] : [1, 2]

  // No WebGL at all, or the context was lost at runtime — skip the Canvas and
  // show static facts rather than a blank white rectangle.
  if (!webglOk || contextLost) {
    return (
      <>
        <FallbackPanel
          selectedId={selectedId}
          message={contextLost
            ? 'The 3D engine lost its graphics context and stopped. Campus solar data is shown below instead.'
            : undefined}
        />
        <NotifyOnce fn={onError} />
      </>
    )
  }

  return (
    <WebGLErrorBoundary selectedId={selectedId} onError={onError}>
      <Suspense fallback={<LoadingOverlay />}>
        <Canvas
          shadows={shadowsOn}
          gl={{ antialias: !lowPower, powerPreference: lowPower ? 'low-power' : 'high-performance' }}
          dpr={dpr}
          style={{ width: '100%', height: '100%', background: '#04111f' }}
          onCreated={({ gl }) => {
            onReady?.()
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              setContextLost(true)
              onError?.(e)
            }, { once: true })
          }}
        >
          <fog attach="fog" args={['#050d1a', 80, 260]} />

          <ambientLight intensity={0.35} />
          <hemisphereLight args={['#0ea5e9', '#050d1a', 0.4]} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            castShadow={shadowsOn}
            shadow-mapSize={lowPower ? [1024, 1024] : [2048, 2048]}
          />

          <CameraControls
            ref={controlsRef}
            smoothTime={0.55}
            draggingSmoothTime={0.12}
            minDistance={4}
            maxDistance={260}
            maxPolarAngle={Math.PI / 2.1}
            makeDefault
          />

          <CameraRig stop={stop} selectedId={selectedId} controlsRef={controlsRef} fitNonce={fitNonce} />
          <HeadingTracker controlsRef={controlsRef} onHeadingChange={onHeadingChange} />
          <ReadySignal onReady={onReady} />

          <Grid
            args={[100, 100]}
            cellSize={2}
            cellThickness={0.4}
            cellColor="#1e3a5f"
            sectionSize={10}
            sectionThickness={0.8}
            sectionColor="#122845"
            fadeDistance={70}
            fadeStrength={1.5}
            infiniteGrid
          />

          <QatarContext visible={stop === 'Qatar'} reducedMotion={reducedMotion} />
          <CampusScene stop={stop} selectedId={selectedId} onSelectBuilding={onSelectBuilding} />
          <AmbientFX stop={stop} reducedMotion={reducedMotion} />
        </Canvas>
      </Suspense>
    </WebGLErrorBoundary>
  )
}

// Tiny helper so the no-WebGL path can flag status without violating render purity.
function NotifyOnce({ fn }) {
  const done = useRef(false)
  useEffect(() => {
    if (!done.current) { done.current = true; fn?.(new Error('WebGL unavailable')) }
  }, [fn])
  return null
}
