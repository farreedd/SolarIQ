import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import {
  QATAR_SHAPE_PTS,
  EC_MARKER_POS,
  QATAR_LANDMARKS,
} from '../../utils/visualizerData'

// shape(x, y) is rotated by [-π/2, 0, 0] so it lies flat:
//   world(x, 0, -y)

// Labels are DOM (drei <Html>), not troika <Text>: troika's SDF glyph atlas
// generation does a GPU ReadPixels that stalls some drivers hard enough to lose
// the WebGL context (the Qatar white-screen). DOM labels avoid GL entirely.
function LandmarkLabel({ text, position }) {
  return (
    <Html
      position={position}
      center
      zIndexRange={[4, 0]}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.02em', color: '#cfe4f7', whiteSpace: 'nowrap',
        textShadow: '0 1px 5px rgba(5,13,26,0.95)',
      }}>
        {text}
      </div>
    </Html>
  )
}

function TowerCluster({ position, count, spread, baseHeight, heightVar, ring }) {
  const towers = useMemo(() => {
    const rng = (seed) => {
      const x = Math.sin(seed * 999.1) * 43758.5453
      return x - Math.floor(x)
    }
    return Array.from({ length: count }, (_, i) => {
      const ang = rng(i + count * 0.3) * Math.PI * 2
      const rad = rng(i + count * 0.7) * spread
      const h = baseHeight + rng(i + count * 1.1) * heightVar
      const w = 0.7 + rng(i + count * 1.4) * 0.6
      return {
        x: Math.cos(ang) * rad,
        z: Math.sin(ang) * rad,
        h,
        w,
      }
    })
  }, [count, spread, baseHeight, heightVar])

  return (
    <group position={position}>
      {towers.map((t, i) => (
        <mesh key={i} position={[t.x, t.h / 2, t.z]} castShadow>
          <boxGeometry args={[t.w, t.h, t.w]} />
          <meshStandardMaterial
            color="#142a46"
            emissive="#0ea5e9"
            emissiveIntensity={0.18}
            roughness={0.55}
            metalness={0.25}
          />
        </mesh>
      ))}
      {ring && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[spread * 1.15, spread * 1.35, 48]} />
          <meshBasicMaterial
            color="#0ea5e9"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

function Cylinder({ position, height, radius }) {
  return (
    <mesh position={[position[0], height / 2, position[2]]} castShadow>
      <cylinderGeometry args={[radius * 0.7, radius, height, 20]} />
      <meshStandardMaterial
        color="#16304d"
        emissive="#0ea5e9"
        emissiveIntensity={0.22}
        roughness={0.5}
        metalness={0.3}
      />
    </mesh>
  )
}

function AngledBlock({ position, size }) {
  const [w, h, d] = size
  return (
    <group position={[position[0], h / 2, position[2]]} rotation={[0, Math.PI / 4, 0]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color="#1a3658"
          emissive="#0ea5e9"
          emissiveIntensity={0.14}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, h / 2 + 0.4, 0]}>
        <boxGeometry args={[w * 0.55, 0.8, d * 0.55]} />
        <meshStandardMaterial
          color="#1d3e64"
          emissive="#0ea5e9"
          emissiveIntensity={0.2}
          roughness={0.55}
          metalness={0.2}
        />
      </mesh>
    </group>
  )
}

function Slab({ position, size }) {
  const [w, h, d] = size
  return (
    <mesh position={[position[0], h / 2, position[2]]} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial
        color="#142a46"
        emissive="#0ea5e9"
        emissiveIntensity={0.16}
        roughness={0.6}
        metalness={0.2}
      />
    </mesh>
  )
}

function QatarLandmarks() {
  return (
    <group>
      {Object.entries(QATAR_LANDMARKS).map(([key, lm]) => {
        let body = null
        let labelY = 4
        if (lm.type === 'cluster') {
          body = <TowerCluster {...lm} />
          labelY = lm.baseHeight + lm.heightVar + 1.2
        } else if (lm.type === 'cylinder') {
          body = <Cylinder position={lm.position} height={lm.height} radius={lm.radius} />
          labelY = lm.height + 1.2
        } else if (lm.type === 'angled') {
          body = <AngledBlock position={lm.position} size={lm.size} />
          labelY = lm.size[1] + 1.6
        } else if (lm.type === 'slab' || lm.type === 'strip') {
          body = <Slab position={lm.position} size={lm.size} />
          labelY = lm.size[1] + 1.2
        }
        return (
          <group key={key}>
            {body}
            <LandmarkLabel
              text={lm.label}
              position={[lm.position[0], labelY, lm.position[2]]}
            />
          </group>
        )
      })}
    </group>
  )
}

export default function QatarContext({ visible, reducedMotion }) {
  const markerRef = useRef()
  const ringRef = useRef()

  const qatarGeom = useMemo(() => {
    const shape = new THREE.Shape()
    const [[sx, sy], ...rest] = QATAR_SHAPE_PTS
    shape.moveTo(sx, sy)
    rest.forEach(([x, y]) => shape.lineTo(x, y))
    shape.closePath()
    return new THREE.ShapeGeometry(shape, 6)
  }, [])

  // Closed 3D outline: shape(x,y) → world(x, 0.15, -y)
  const outlinePts = useMemo(() => {
    const closed = [...QATAR_SHAPE_PTS, QATAR_SHAPE_PTS[0]]
    return closed.map(([x, y]) => [x, 0.15, -y])
  }, [])

  useFrame(({ clock }) => {
    if (reducedMotion) return  // hold the EC marker pulse static
    const t = clock.elapsedTime
    if (markerRef.current) {
      const s = 1 + 0.22 * Math.sin(t * 2.4)
      markerRef.current.scale.setScalar(s)
    }
    if (ringRef.current) {
      ringRef.current.material.opacity = 0.18 + 0.28 * Math.abs(Math.sin(t * 2.4))
    }
  })

  if (!visible) return null

  return (
    <group>
      {/* Ocean base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[280, 280]} />
        <meshStandardMaterial color="#030a14" roughness={1} metalness={0} />
      </mesh>

      {/* Peninsula fill */}
      <mesh
        geometry={qatarGeom}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#091828"
          emissive="#0ea5e9"
          emissiveIntensity={0.07}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Glowing border */}
      <Line
        points={outlinePts}
        color="#0ea5e9"
        lineWidth={2}
        transparent
        opacity={0.75}
      />

      {/* Qatar infrastructure landmarks */}
      <QatarLandmarks />

      {/* Education City marker */}
      <group position={EC_MARKER_POS}>
        {/* Pulsing sphere */}
        <mesh ref={markerRef} position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.9, 14, 14]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.9}
          />
        </mesh>

        {/* Ripple ring on ground */}
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[1.6, 2.2, 32]} />
          <meshBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.32}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Static outer ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[2.6, 2.85, 32]} />
          <meshBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Education City label (DOM, not troika Text) */}
        <Html position={[0, 3.8, 0]} center zIndexRange={[4, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
            color: '#fbbf24', whiteSpace: 'nowrap',
            textShadow: '0 1px 6px rgba(5,13,26,0.98)',
          }}>
            Education City · QF
          </div>
        </Html>
      </group>
    </group>
  )
}
