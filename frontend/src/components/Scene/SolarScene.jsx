import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei'

function PlaceholderBuilding() {
  return (
    <mesh position={[0, 1, 0]} castShadow receiveShadow>
      <boxGeometry args={[3, 2, 3]} />
      <meshStandardMaterial color="#0d1f38" emissive="#f59e0b" emissiveIntensity={0.05} />
    </mesh>
  )
}

export default function SolarScene() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      style={{ background: '#04111f' }}
    >
      <PerspectiveCamera makeDefault position={[12, 10, 18]} fov={45} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.2}
      />

      <Grid
        args={[40, 40]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#1e3a5f"
        sectionSize={8}
        sectionThickness={1}
        sectionColor="#122845"
        fadeDistance={55}
        fadeStrength={1}
        infiniteGrid
      />

      <PlaceholderBuilding />
    </Canvas>
  )
}
