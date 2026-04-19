export default function GlassCard({ children, style, className, onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'rgba(13,31,56,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
