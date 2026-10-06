interface Props {
  className?: string
  wiggle?: boolean
}

/** Sleeping cat photo cutout with floating z's; moon and stars appear in evening mode. */
export function CatMascot({ className, wiggle }: Props) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <div className="absolute inset-x-2 bottom-0 top-6 rounded-full bg-surface/50" aria-hidden="true" />
      <img
        src="/cat.png" alt="A sleepy black and white cat curled up for a nap"
        className={`relative mx-auto w-full ${wiggle ? 'wiggle' : ''}`}
      />
      <svg viewBox="0 0 120 60" className="pointer-events-none absolute -top-2 right-0 h-14 w-28" aria-hidden="true">
        <g className="evening-only">
          <path d="M20 8a10 10 0 1 0 8 16a8 8 0 0 1-8-16z" fill="rgb(var(--pink))" />
          <circle cx="45" cy="14" r="1.6" fill="rgb(var(--ink))" />
          <circle cx="8" cy="34" r="1.4" fill="rgb(var(--ink))" />
          <circle cx="36" cy="40" r="1.2" fill="rgb(var(--ink))" />
        </g>
        <g fill="rgb(var(--muted))" fontWeight="700">
          <text x="62" y="50" fontSize="13" className="z-float">z</text>
          <text x="80" y="36" fontSize="17" className="z-float" style={{ animationDelay: '1s' }}>z</text>
          <text x="100" y="20" fontSize="21" className="z-float" style={{ animationDelay: '2s' }}>z</text>
        </g>
      </svg>
    </div>
  )
}
