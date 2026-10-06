import { useId } from 'react'

interface Props {
  percent: number
  label: string
}

const BODY = { x: 15, y: 30, w: 70, h: 95 }

export function Jar({ percent, label }: Props) {
  const clipId = useId()
  const offset = BODY.h * (1 - percent / 100)
  return (
    <svg viewBox="0 0 100 135" className="h-36 w-28 shrink-0" role="img" aria-label={`${label} jar is ${percent}% full`}>
      <defs>
        <clipPath id={clipId}>
          <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx="18" />
        </clipPath>
      </defs>
      <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx="18" fill="rgb(var(--card))" />
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} fill="rgb(var(--peach))"
          style={{ transform: `translateY(${offset}px)`, transition: 'transform 0.8s ease' }}
          className="motion-reduce:!transition-none"
        />
        <circle cx="38" cy="108" r="5" fill="rgb(var(--rose))" opacity="0.5" />
        <circle cx="62" cy="96" r="3.5" fill="rgb(var(--rose))" opacity="0.5" />
      </g>
      <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx="18" fill="none" stroke="rgb(var(--ink))" strokeWidth="3" opacity="0.7" />
      <rect x="25" y="14" width="50" height="14" rx="6" fill="rgb(var(--sage))" stroke="rgb(var(--ink))" strokeWidth="3" />
      <path d="M30 45q-4 20 0 36" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}
