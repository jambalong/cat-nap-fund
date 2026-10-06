const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatCents = (cents: number): string => usd.format(cents / 100)

/** Parse user input like "12.5", "$1,200" into integer cents; null if invalid or negative. */
export function parseToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, '')
  if (!/^\d*\.?\d{0,2}$/.test(cleaned) || cleaned === '' || cleaned === '.') return null
  return Math.round(parseFloat(cleaned) * 100)
}
