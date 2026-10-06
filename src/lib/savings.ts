import type { Person, Transaction } from './types'

export const MILESTONES = [25, 50, 75, 100] as const

const signed = (t: Transaction) => (t.type === 'deposit' ? t.amountCents : -t.amountCents)

export const balanceCents = (txs: Transaction[]): number => txs.reduce((s, t) => s + signed(t), 0)

/** Whole-number percent, clamped to 0..100. A zero target yields 0. */
export function progressPercent(balance: number, target: number): number {
  if (target <= 0) return 0
  return Math.max(0, Math.min(100, Math.floor((balance / target) * 100)))
}

/** Net contribution (deposits minus withdrawals) per person. */
export function contributionsByPerson(txs: Transaction[]): Record<Person, number> {
  const out: Record<Person, number> = { a: 0, b: 0 }
  for (const t of txs) out[t.person] += signed(t)
  return out
}

/** Share of the positive net total per person, as 0..1. Both 0 when nothing contributed. */
export function contributionShares(txs: Transaction[]): Record<Person, number> {
  const c = contributionsByPerson(txs)
  const a = Math.max(0, c.a)
  const b = Math.max(0, c.b)
  const total = a + b
  return total === 0 ? { a: 0, b: 0 } : { a: a / total, b: b / total }
}

export function sortNewestFirst(txs: Transaction[]): Transaction[] {
  return [...txs].sort((x, y) =>
    y.date === x.date ? y.createdAt.localeCompare(x.createdAt) : y.date.localeCompare(x.date),
  )
}

/** Whole months from `today` until `targetDate` (at least 1 when the date is in the future). Null if no/past date. */
export function monthsUntil(targetDate: string | null, today: Date): number | null {
  if (!targetDate) return null
  const t = new Date(targetDate + 'T00:00:00')
  const months = (t.getFullYear() - today.getFullYear()) * 12 + (t.getMonth() - today.getMonth())
  return t.getTime() <= today.getTime() ? null : Math.max(1, months)
}

/** Cents to save per month to hit the target by the date; null when no usable date, 0 if already reached. */
export function monthlyNeededCents(
  balance: number,
  target: number,
  targetDate: string | null,
  today: Date,
): number | null {
  const months = monthsUntil(targetDate, today)
  if (months === null) return null
  const remaining = target - balance
  return remaining <= 0 ? 0 : Math.ceil(remaining / months)
}

/** Highest milestone (25/50/75/100) reached, or 0. */
export function highestMilestone(percent: number): number {
  return [...MILESTONES].reverse().find((m) => percent >= m) ?? 0
}

/** The milestone newly crossed going from prevPercent to nextPercent, or null. */
export function crossedMilestone(prevPercent: number, nextPercent: number): number | null {
  const next = highestMilestone(nextPercent)
  return next > highestMilestone(prevPercent) ? next : null
}

/** Months of expenses the balance covers, one decimal; null when expenses are unset. */
export function monthsCovered(balance: number, monthlyExpenses: number): number | null {
  if (monthlyExpenses <= 0) return null
  return Math.max(0, Math.floor((balance / monthlyExpenses) * 10) / 10)
}

export const checklistTotalCents = (items: { amountCents: number }[]): number =>
  items.reduce((s, i) => s + i.amountCents, 0)

export function napMessage(percent: number): string {
  if (percent >= 100) return 'Purrfect! The nap fund is full 🐾'
  if (percent === 0) return 'A fresh, empty jar — time for a first deposit 🐾'
  return `You two are ${percent}% of the way to a cozy nap 🐾`
}
