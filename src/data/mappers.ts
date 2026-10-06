import type { ChecklistItem, Goal, Settings, Transaction } from '../lib/types'

export interface GoalRow { id: string; name: string; target_cents: number; target_date: string | null }
export interface TxRow {
  id: string; goal_id: string; type: string; amount_cents: number
  note: string; date: string; created_at: string
}
export interface SettingsRow { monthly_expenses_cents: number }
export interface ChecklistRow { id: string; label: string; amount_cents: number; position: number }

export const goalFromRow = (r: GoalRow): Goal => ({
  id: r.id as Goal['id'], name: r.name, targetCents: Number(r.target_cents), targetDate: r.target_date,
})

export const txFromRow = (r: TxRow): Transaction => ({
  id: r.id, goalId: r.goal_id as Transaction['goalId'], type: r.type as Transaction['type'],
  amountCents: Number(r.amount_cents),
  note: r.note, date: r.date, createdAt: r.created_at,
})

export const txToRow = (t: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => ({
  ...(t.goalId !== undefined && { goal_id: t.goalId }),
  ...(t.type !== undefined && { type: t.type }),
  ...(t.amountCents !== undefined && { amount_cents: t.amountCents }),
  ...(t.note !== undefined && { note: t.note }),
  ...(t.date !== undefined && { date: t.date }),
})

export const goalToRow = (p: Partial<Omit<Goal, 'id'>>) => ({
  ...(p.name !== undefined && { name: p.name }),
  ...(p.targetCents !== undefined && { target_cents: p.targetCents }),
  ...(p.targetDate !== undefined && { target_date: p.targetDate }),
})

export const settingsFromRow = (r: SettingsRow): Settings => ({
  monthlyExpensesCents: Number(r.monthly_expenses_cents),
})

export const settingsToRow = (s: Settings) => ({
  id: 1, monthly_expenses_cents: s.monthlyExpensesCents,
})

export const checklistFromRow = (r: ChecklistRow): ChecklistItem => ({
  id: r.id, label: r.label, amountCents: Number(r.amount_cents),
})
