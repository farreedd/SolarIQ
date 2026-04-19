import SolarScene from '../components/Scene/SolarScene'

export default function Visualizer() {
  return (
    <div style={{ height: 'calc(100vh - 120px)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <SolarScene />
    </div>
  )
}
