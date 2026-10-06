import { InMemoryRepository } from './inMemoryRepository'

const base = { goalId: 'emergency', type: 'deposit', amountCents: 2500, person: 'a', note: 'x', date: '2026-01-02' } as const

describe('InMemoryRepository', () => {
  it('starts with the two default goals', async () => {
    const d = await new InMemoryRepository().load()
    expect(d.goals.map((g) => g.id)).toEqual(['emergency', 'moveout'])
  })
  it('adds, updates and deletes transactions', async () => {
    const r = new InMemoryRepository()
    const t = await r.addTransaction(base)
    await r.updateTransaction(t.id, { amountCents: 9900 })
    expect((await r.load()).transactions[0].amountCents).toBe(9900)
    await r.deleteTransaction(t.id)
    expect((await r.load()).transactions).toHaveLength(0)
  })
  it('throws on unknown ids', async () => {
    const r = new InMemoryRepository()
    await expect(r.updateTransaction('nope', {})).rejects.toThrow()
    await expect(r.updateGoal('nope' as 'emergency', {})).rejects.toThrow()
  })
  it('updates goals, settings and checklist', async () => {
    const r = new InMemoryRepository()
    await r.updateGoal('moveout', { targetCents: 123, targetDate: '2027-01-01' })
    await r.saveSettings({ names: { a: 'J', b: 'K' }, monthlyExpensesCents: 5 })
    await r.saveChecklist([{ id: 'x', label: 'L', amountCents: 7 }])
    const d = await r.load()
    expect(d.goals[1]).toMatchObject({ targetCents: 123, targetDate: '2027-01-01' })
    expect(d.settings.names.b).toBe('K')
    expect(d.checklist).toHaveLength(1)
  })
  it('returns copies, not live references', async () => {
    const r = new InMemoryRepository()
    const d = await r.load()
    d.goals[0].targetCents = 1
    expect((await r.load()).goals[0].targetCents).not.toBe(1)
  })
  it('notifies subscribers until unsubscribed', async () => {
    const r = new InMemoryRepository()
    let n = 0
    const off = r.subscribe(() => n++)
    await r.addTransaction(base)
    off()
    await r.addTransaction(base)
    expect(n).toBe(1)
  })
})
