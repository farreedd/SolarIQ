export default function ErrorCard({ title = 'Unable to load data', message, onRetry, onDemoMode }) {
  return (
    <div style={{
      background: 'rgba(13,31,56,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16,
      padding: '32px 28px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 14, textAlign: 'center',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>⚠️</div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
        {title}
      </div>

      {message && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.55, margin: 0 }}>
          {String(message).slice(0, 140)}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.4)',
              color: 'var(--primary)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(14,165,233,0.12)'}
          >
            Retry
          </button>
        )}
        {onDemoMode && (
          <button
            onClick={onDemoMode}
            style={{
              padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            Switch to Demo Mode
          </button>
        )}
      </div>
    </div>
  )
}
