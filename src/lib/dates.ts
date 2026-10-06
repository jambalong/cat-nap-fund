const pad = (n: number) => String(n).padStart(2, '0')

/** Local-time ISO date (YYYY-MM-DD). */
export const toIsoDate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const formatDate = (iso: string): string =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
