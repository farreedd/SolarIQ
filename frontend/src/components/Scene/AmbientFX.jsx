import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BUILDING_GEOMETRY } from '../../utils/visualizerData'

// ── Sun Orbit ─────────────────────────────────────────────────────────────────
function SunOrbit({ stop, reducedMotion }) {
  const groupRef  = useRef()
  const lightRef  = useRef()
  const corona1   = useRef()
  const corona2   = useRef()
  const raysRef   = useRef()

  const isQatar   = stop === 'Qatar'
  const orbitR    = isQatar ? 55 : 18
  const orbitY    = isQatar ? 45 : 14
  const speed     = 0.12  // rad/s — full loop ~52 s

  useFrame(({ clock }) => {
    if (reducedMotion) return  // freeze the sun + corona when motion is reduced
    const t   = clock.elapsedTime
    const ang = t * speed
    const x   = Math.cos(ang) * orbitR
    const z   = Math.sin(ang) * orbitR

    if (groupRef.current) {
      groupRef.current.position.set(x, orbitY, z)
    }
    if (lightRef.current) {
      lightRef.current.position.set(x, orbitY, z)
    }
    // Gentle corona spin
    if (corona1.current) corona1.current.rotation.z = t * 0.4
    if (corona2.current) corona2.current.rotation.z = -t * 0.25
    // Very slow ray rotation — independent of corona
    if (raysRef.current)  raysRef.current.rotation.y  = t * 0.05
  })

  // Static resting position for the sun when motion is reduced (NE, mid-elevation).
  const restPos = [orbitR * 0.7, orbitY, orbitR * 0.7]

  return (
    <>
      {/* Sun sphere + corona */}
      <group ref={groupRef} position={reducedMotion ? restPos : undefined}>
        {/* Core */}
        <mesh>
          <sphereGeometry args={[isQatar ? 3.5 : 0.7, 16, 16]} />
          <meshStandardMaterial
            color="#fffbe0"
            emissive="#fbbf24"
            emissiveIntensity={2.5}
            roughness={0}
            metalness={0}
          />
        </mesh>

        {/* Corona disc 1 */}
        <mesh ref={corona1} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={isQatar ? [4.5, 8, 48] : [0.95, 1.8, 48]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Corona disc 2 — tilted */}
        <mesh ref={corona2} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
          <ringGeometry args={isQatar ? [5.5, 10, 48] : [1.2, 2.4, 48]} />
          <meshBasicMaterial
            color="#fde68a"
            transparent
            opacity={0.07}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Sun rays — 5 thin planes fanning outward and angled ~38° downward */}
        <group ref={raysRef}>
          {[0, 1, 2, 3, 4].map(i => {
            const θ = (i / 5) * Math.PI * 2
            const len   = isQatar ? 28 : 10
            const width = isQatar ? 0.55 : 0.10
            return (
              <group key={i} rotation={[0, θ, 0]}>
                {/* tilt 0.90 rad ≈ 52° from vertical = 38° below horizontal */}
                <group rotation={[0.90, 0, 0]}>
                  <mesh position={[0, -len / 2, 0]}>
                    <planeGeometry args={[width, len]} />
                    <meshBasicMaterial
                      color="#fde68a"
                      transparent
                      opacity={0.055}
                      side={THREE.DoubleSide}
                      depthWrite={false}
                    />
                  </mesh>
                </group>
              </group>
            )
          })}
        </group>
      </group>

      {/* Travelling point light */}
      <pointLight
        ref={lightRef}
        position={reducedMotion ? restPos : undefined}
        color="#fff5cc"
        intensity={isQatar ? 1.2 : 2.0}
        distance={isQatar ? 200 : 40}
        decay={1.5}
        castShadow={false}
      />
    </>
  )
}

// ── Energy Particles ──────────────────────────────────────────────────────────
const CAMPUS_CENTER = new THREE.Vector3(0, 0.5, 0)
const PARTICLES_PER_BUILDING = 5
const PARTICLE_SPEED = 0.38  // units/s along path (0→1 in 1/speed seconds)

function EnergyParticles({ stop, reducedMotion }) {
  // Hooks must run unconditionally; we branch on `stop` only in the render output.
  const meshRefs = useRef([])

  const particles = useMemo(() => {
    const entries = Object.entries(BUILDING_GEOMETRY)
    const list = []
    entries.forEach(([, geo], bi) => {
      const origin = new THREE.Vector3(geo.position[0], geo.height * 0.6, geo.position[2])
      for (let pi = 0; pi < PARTICLES_PER_BUILDING; pi++) {
        list.push({
          origin,
          phase: (bi * PARTICLES_PER_BUILDING + pi) / (entries.length * PARTICLES_PER_BUILDING),
        })
      }
    })
    return list
  }, [])

  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    // Gate the loop on reduced motion: leave particles at their static snapshot.
    if (reducedMotion || stop === 'Qatar') return
    const t = clock.elapsedTime
    particles.forEach((p, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      const progress = ((t * PARTICLE_SPEED + p.phase) % 1.0)
      tmp.lerpVectors(p.origin, CAMPUS_CENTER, progress)
      mesh.position.copy(tmp)
      // Fade in at start, fade out near centre
      const alpha = progress < 0.15
        ? progress / 0.15
        : progress > 0.80
          ? (1 - progress) / 0.20
          : 1
      mesh.material.opacity = alpha * 0.85
    })
  })

  if (stop === 'Qatar') return null

  return (
    <group>
      {particles.map((p, i) => {
        // Static snapshot midway along the path when motion is reduced.
        const snap = reducedMotion
          ? new THREE.Vector3().lerpVectors(p.origin, CAMPUS_CENTER, 0.5)
          : null
        return (
          <mesh
            key={i}
            ref={el => (meshRefs.current[i] = el)}
            position={snap ? [snap.x, snap.y, snap.z] : undefined}
          >
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={1.6}
              transparent
              opacity={reducedMotion ? 0.5 : 0.85}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function AmbientFX({ stop, reducedMotion }) {
  return (
    <>
      <SunOrbit stop={stop} reducedMotion={reducedMotion} />
      <EnergyParticles stop={stop} reducedMotion={reducedMotion} />
    </>
  )
}
