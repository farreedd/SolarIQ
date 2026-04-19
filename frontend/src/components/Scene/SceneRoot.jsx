import { useEffect, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { CameraControls, Grid } from '@react-three/drei'
import CampusScene from './CampusScene'
import QatarContext from './QatarContext'
import AmbientFX from './AmbientFX'
import { CAMERA_STOPS, BUILDING_GEOMETRY } from '../../utils/visualizerData'

// Smooth camera transitions — responds to both stop and selectedId changes
function CameraRig({ stop, selectedId, controlsRef }) {
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
  }, [stop, selectedId, controlsRef])
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

export default function SceneRoot({ stop, selectedId, onSelectBuilding, onHeadingChange }) {
  const controlsRef = useRef()

  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', background: '#04111f' }}
    >
      <fog attach="fog" args={['#050d1a', 80, 260]} />

      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#0ea5e9', '#050d1a', 0.4]} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
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

      <CameraRig stop={stop} selectedId={selectedId} controlsRef={controlsRef} />
      <HeadingTracker controlsRef={controlsRef} onHeadingChange={onHeadingChange} />

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

      <QatarContext visible={stop === 'Qatar'} />
      <CampusScene stop={stop} selectedId={selectedId} onSelectBuilding={onSelectBuilding} />
      <AmbientFX stop={stop} />
    </Canvas>
  )
}
