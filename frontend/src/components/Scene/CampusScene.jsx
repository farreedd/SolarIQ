import BuildingMesh from './BuildingMesh'
import { BUILDINGS, BUILDING_GEOMETRY } from '../../utils/visualizerData'

export default function CampusScene({ stop, selectedId, onSelectBuilding }) {
  if (stop === 'Qatar') return null
  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#060f1e"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Path markings — subtle lighter strips between buildings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[1.5, 28]} />
        <meshStandardMaterial color="#0a1929" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[28, 1.5]} />
        <meshStandardMaterial color="#0a1929" roughness={1} />
      </mesh>

      {/* 5 QF campus buildings */}
      {Object.entries(BUILDING_GEOMETRY).map(([id, geo]) => (
        <BuildingMesh
          key={id}
          id={id}
          position={geo.position}
          footprint={geo.footprint}
          height={geo.height}
          pvType={BUILDINGS[id].pvType}
          isActive={selectedId === id}
          onClick={onSelectBuilding}
        />
      ))}
    </group>
  )
}
