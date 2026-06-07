// Canonical glass surface. Uses the .liquid-glass recipe from index.css
// (single source of truth) so visual tweaks happen in one place.
export default function GlassCard({ children, style, className, onClick, ...rest }) {
  const cls = ['liquid-glass', className].filter(Boolean).join(' ')
  const interactive = typeof onClick === 'function'
  return (
    <div
      className={cls}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      style={style}
      {...rest}
    >
      {children}
    </div>
  )
}
