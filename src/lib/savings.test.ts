import {
  balanceCents, progressPercent, sortNewestFirst,
  monthsUntil, monthlyNeededCents, highestMilestone, crossedMilestone, monthsCovered,
  checklistTotalCents, napMessage,
} from './savings'
import type { Transaction } from './types'

let n = 0
const tx = (o: Partial<Transaction>): Transaction => ({
  id: String(++n), goalId: 'emergency', type: 'deposit', amountCents: 1000,
  note: '', date: '2026-01-01', createdAt: `2026-01-01T00:00:0${n % 10}Z`, ...o,
})

describe('balance', () => {
  it('sums deposits minus withdrawals', () => {
    const txs = [tx({ amountCents: 5000 }), tx({ amountCents: 3000 }), tx({ type: 'withdrawal', amountCents: 1000 })]
    expect(balanceCents(txs)).toBe(7000)
  })
  it('is zero with no transactions', () => expect(balanceCents([])).toBe(0))
})

describe('progress', () => {
  it('floors and clamps', () => {
    expect(progressPercent(6200, 10000)).toBe(62)
    expect(progressPercent(999, 1000)).toBe(99)
    expect(progressPercent(20000, 10000)).toBe(100)
    expect(progressPercent(-5, 100)).toBe(0)
    expect(progressPercent(5, 0)).toBe(0)
  })
})

describe('sorting', () => {
  it('newest date first, createdAt breaks ties', () => {
    const a = tx({ date: '2026-02-01', createdAt: '2026-02-01T10:00:00Z' })
    const b = tx({ date: '2026-03-01' })
    const c = tx({ date: '2026-02-01', createdAt: '2026-02-01T12:00:00Z' })
    expect(sortNewestFirst([a, b, c])).toEqual([b, c, a])
  })
})

describe('projection', () => {
  const today = new Date('2026-01-15T00:00:00')
  it('months until', () => {
    expect(monthsUntil('2026-07-01', today)).toBe(6)
    expect(monthsUntil('2026-01-30', today)).toBe(1)
    expect(monthsUntil('2025-01-01', today)).toBeNull()
    expect(monthsUntil(null, today)).toBeNull()
  })
  it('monthly needed rounds up', () => {
    expect(monthlyNeededCents(0, 100000, '2026-07-01', today)).toBe(16667)
    expect(monthlyNeededCents(100000, 100000, '2026-07-01', today)).toBe(0)
    expect(monthlyNeededCents(0, 100000, null, today)).toBeNull()
  })
})

describe('milestones', () => {
  it('finds highest', () => {
    expect(highestMilestone(10)).toBe(0)
    expect(highestMilestone(25)).toBe(25)
    expect(highestMilestone(74)).toBe(50)
    expect(highestMilestone(100)).toBe(100)
  })
  it('detects crossing', () => {
    expect(crossedMilestone(20, 26)).toBe(25)
    expect(crossedMilestone(20, 80)).toBe(75)
    expect(crossedMilestone(30, 40)).toBeNull()
    expect(crossedMilestone(60, 40)).toBeNull()
  })
})

describe('helpers', () => {
  it('months covered', () => {
    expect(monthsCovered(900000, 300000)).toBe(3)
    expect(monthsCovered(1000000, 300000)).toBe(3.3)
    expect(monthsCovered(1000, 0)).toBeNull()
  })
  it('checklist total', () => expect(checklistTotalCents([{ amountCents: 100 }, { amountCents: 250 }])).toBe(350))
  it('microcopy', () => {
    expect(napMessage(62)).toContain('62%')
    expect(napMessage(100)).toContain('Purrfect')
    expect(napMessage(0)).toContain('empty')
  })
})
