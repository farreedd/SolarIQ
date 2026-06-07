import { useState } from 'react'
import Icon from './Icon'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 28px',
      background: 'rgba(245,158,11,0.05)',
      borderBottom: '1px solid rgba(245,158,11,0.14)',
      fontSize: 11.5, color: 'var(--accent)', flexShrink: 0,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <span>Demo mode — all values are synthetic and calibrated to QF campus solar profiles.</span>
      <button
        onClick={() => setDismissed(true)}
        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', opacity: 0.6, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
        aria-label="Dismiss banner"
      ><Icon name="x" size={12} /></button>
    </div>
  )
}
