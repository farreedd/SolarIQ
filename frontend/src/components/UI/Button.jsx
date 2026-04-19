const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    border: 'none',
    color: '#fff',
    boxShadow: '0 0 20px rgba(14,165,233,0.35)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid rgba(14,165,233,0.35)',
    color: 'var(--primary)',
    boxShadow: 'none',
  },
}

export default function Button({ children, variant = 'primary', onClick, disabled, style, ...rest }) {
  const base = VARIANTS[variant] || VARIANTS.primary
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '9px 22px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-body)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s, box-shadow 0.15s, transform 0.1s',
        letterSpacing: '0.01em',
        ...base,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
