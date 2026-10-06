import type {
  ChecklistItem, Goal, GoalId, NewTransaction, Settings, Transaction,
} from '../lib/types'

export interface AppData {
  goals: Goal[]
  transactions: Transaction[]
  settings: Settings
  checklist: ChecklistItem[]
}

/** Single seam for all persistence. Tests and keyless dev use InMemoryRepository. */
export interface SavingsRepository {
  load(): Promise<AppData>
  addTransaction(tx: NewTransaction): Promise<Transaction>
  updateTransaction(id: string, patch: Partial<NewTransaction>): Promise<void>
  deleteTransaction(id: string): Promise<void>
  updateGoal(id: GoalId, patch: Partial<Omit<Goal, 'id'>>): Promise<void>
  saveSettings(settings: Settings): Promise<void>
  saveChecklist(items: ChecklistItem[]): Promise<void>
  /** Called when data changes remotely (Supabase) or locally (in-memory). Returns unsubscribe. */
  subscribe(onChange: () => void): () => void
}
