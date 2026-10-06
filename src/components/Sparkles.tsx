const SPOTS = [
  { left: '8%', top: '20%', delay: '0s' },
  { left: '30%', top: '5%', delay: '0.2s' },
  { left: '55%', top: '15%', delay: '0.4s' },
  { left: '78%', top: '8%', delay: '0.1s' },
  { left: '90%', top: '30%', delay: '0.3s' },
]

/** Gentle sparkle burst. CSS disables the animation under prefers-reduced-motion. */
export function Sparkles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPOTS.map((s, i) => (
        <span key={i} className="sparkle absolute text-2xl" style={{ left: s.left, top: s.top, animationDelay: s.delay }}>
          ✨
        </span>
      ))}
    </div>
  )
}
