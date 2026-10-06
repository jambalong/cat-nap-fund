interface Props {
  className?: string
  wiggle?: boolean
}

/** Original sleeping-cat mascot: one curled pose, floating z's, moon + stars in evening mode. */
export function CatMascot({ className, wiggle }: Props) {
  return (
    <svg
      viewBox="0 0 220 150" className={className} role="img" aria-label="A sleepy cat curled up for a nap"
    >
      <g className="evening-only">
        <path d="M185 18a14 14 0 1 0 12 22a11 11 0 0 1-12-22z" fill="#f6e6a8" />
        <circle cx="160" cy="30" r="2" fill="#f6e6a8" />
        <circle cx="205" cy="62" r="1.8" fill="#f6e6a8" />
        <circle cx="140" cy="14" r="1.5" fill="#f6e6a8" />
      </g>
      <g className={wiggle ? 'wiggle' : undefined}>
        <ellipse cx="112" cy="116" rx="78" ry="30" fill="#e8c9a8" />
        <path d="M178 112q30-6 22 18q-6 14-60 14" fill="none" stroke="#d6a77f" strokeWidth="14" strokeLinecap="round" />
        <path d="M60 112q6 20 40 22M80 100q10 14 40 14" fill="none" stroke="#d6a77f" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        <circle cx="62" cy="102" r="30" fill="#efd3b3" />
        <path d="M38 84l4-26l22 16zM86 84l-4-26l-22 16z" fill="#efd3b3" />
        <path d="M43 76l1-10l9 6zM81 76l-1-10l-9 6z" fill="#d68c96" />
        <path d="M47 104q6 6 12 0M67 104q6 6 12 0" fill="none" stroke="#543a2c" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="63" cy="113" rx="4" ry="3" fill="#d68c96" />
        <circle cx="42" cy="112" r="5" fill="#f6a98c" opacity="0.6" />
        <circle cx="84" cy="112" r="5" fill="#f6a98c" opacity="0.6" />
      </g>
      <g fill="#8a6a58" fontWeight="600">
        <text x="96" y="62" fontSize="16" className="z-float">z</text>
        <text x="110" y="46" fontSize="20" className="z-float" style={{ animationDelay: '1s' }}>z</text>
        <text x="126" y="28" fontSize="24" className="z-float" style={{ animationDelay: '2s' }}>z</text>
      </g>
    </svg>
  )
}
