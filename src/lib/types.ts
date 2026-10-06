export type GoalId = 'emergency' | 'moveout'
export type TxType = 'deposit' | 'withdrawal'

export interface Goal {
  id: GoalId
  name: string
  targetCents: number
  /** ISO date (YYYY-MM-DD) or null */
  targetDate: string | null
}

export interface Transaction {
  id: string
  goalId: GoalId
  type: TxType
  amountCents: number
  note: string
  /** ISO date (YYYY-MM-DD) */
  date: string
  createdAt: string
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>

export interface ChecklistItem {
  id: string
  label: string
  amountCents: number
}

export interface Settings {
  monthlyExpensesCents: number
}

export const DEFAULT_SETTINGS: Settings = { monthlyExpensesCents: 0 }

export const DEFAULT_GOALS: Goal[] = [
  { id: 'emergency', name: 'Emergency Fund', targetCents: 1000000, targetDate: null },
  { id: 'moveout', name: 'Move-Out Fund', targetCents: 800000, targetDate: null },
]

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'rent', label: "First month's rent", amountCents: 0 },
  { id: 'deposit', label: 'Security deposit', amountCents: 0 },
  { id: 'movers', label: 'Movers', amountCents: 0 },
  { id: 'furniture', label: 'Furniture', amountCents: 0 },
]
