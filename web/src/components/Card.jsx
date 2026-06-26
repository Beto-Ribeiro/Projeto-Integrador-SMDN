const Card = ({ children, className = '', onClick, ...props }) => {
  const base =
    'a11y-card bg-bg-surface rounded-card shadow-card p-6 border border-border-soft transition-shadow duration-200' +
    (onClick ? ' cursor-pointer hover:shadow-card-hover' : '')

  return (
    <div className={`${base} ${className}`} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

export default Card