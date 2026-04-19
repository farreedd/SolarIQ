import { useRef, useState } from 'react'
import { Edges } from '@react-three/drei'

export default function BuildingMesh({ id, position, footprint, height, pvType, isActive, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [w, d] = footprint

  const bodyPos = [position[0], height / 2, position[2]]
  const pvY     = height + 0.03

  const bodyEmissive  = isActive ? '#f59e0b' : hovered ? '#1e6fa8' : '#0ea5e9'
  const bodyIntensity = isActive ? 0.45      : hovered ? 0.14      : 0.03

  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true);  document.body.style.cursor = 'pointer' }}
      onPointerOut={(e)  => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'    }}
      onClick={(e)       => { e.stopPropagation(); onClick?.(id) }}
    >
      {/* Building body */}
      <mesh ref={meshRef} position={bodyPos} castShadow receiveShadow>
        <boxGeometry args={[w, height, d]} />
        <meshStandardMaterial
          color="#0d1f38"
          roughness={0.7}
          metalness={0.2}
          emissive={bodyEmissive}
          emissiveIntensity={bodyIntensity}
        />
        {/* Selection wireframe outline */}
        {isActive && (
          <Edges
            scale={1.04}
            threshold={15}
            color="#f59e0b"
            lineWidth={1.2}
          />
        )}
      </mesh>

      {/* Rooftop / canopy PV */}
      {pvType !== 'facade' && (
        <mesh
          position={[position[0], pvY, position[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[w * 0.82, d * 0.82]} />
          <meshStandardMaterial
            color="#0d3055"
            emissive="#0ea5e9"
            emissiveIntensity={isActive ? 0.70 : hovered ? 0.45 : 0.30}
            roughness={0.4}
            metalness={0.5}
          />
        </mesh>
      )}

      {/* Facade PV on B02 */}
      {pvType === 'facade' && (
        <mesh
          position={[position[0], height / 2, position[2] + d / 2 + 0.02]}
          receiveShadow
        >
          <planeGeometry args={[w * 0.80, height * 0.85]} />
          <meshStandardMaterial
            color="#0d3055"
            emissive="#0ea5e9"
            emissiveIntensity={isActive ? 0.70 : hovered ? 0.40 : 0.25}
            roughness={0.4}
            metalness={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Amber point light above active building */}
      {isActive && (
        <pointLight
          position={[position[0], height + 2.5, position[2]]}
          color="#f59e0b"
          intensity={1.8}
          distance={8}
          decay={2}
        />
      )}
    </group>
  )
}
