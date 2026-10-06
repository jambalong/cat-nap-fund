import {
  checklistFromRow, goalFromRow, goalToRow, settingsFromRow, settingsToRow, txFromRow, txToRow,
} from './mappers'

describe('mappers', () => {
  it('maps transaction rows both ways (bigint strings become numbers)', () => {
    const t = txFromRow({
      id: '1', goal_id: 'moveout', type: 'withdrawal', amount_cents: '1250' as unknown as number,
      person: 'b', note: 'n', date: '2026-02-03', created_at: '2026-02-03T00:00:00Z',
    })
    expect(t).toMatchObject({ goalId: 'moveout', amountCents: 1250, person: 'b' })
    expect(txToRow({ amountCents: 5, note: '' })).toEqual({ amount_cents: 5, note: '' })
  })
  it('maps goals, partial patches only include given keys', () => {
    expect(goalFromRow({ id: 'emergency', name: 'E', target_cents: 100, target_date: null }).targetCents).toBe(100)
    expect(goalToRow({ targetDate: null })).toEqual({ target_date: null })
  })
  it('maps settings and checklist', () => {
    const s = settingsFromRow({ name_a: 'J', name_b: 'K', monthly_expenses_cents: 300 })
    expect(settingsToRow(s)).toEqual({ id: 1, name_a: 'J', name_b: 'K', monthly_expenses_cents: 300 })
    expect(checklistFromRow({ id: 'x', label: 'L', amount_cents: 9, position: 0 })).toEqual({ id: 'x', label: 'L', amountCents: 9 })
  })
})
