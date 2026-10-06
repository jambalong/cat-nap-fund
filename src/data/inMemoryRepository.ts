import {
  DEFAULT_CHECKLIST, DEFAULT_GOALS, DEFAULT_SETTINGS,
  type ChecklistItem, type Goal, type GoalId, type NewTransaction, type Settings, type Transaction,
} from '../lib/types'
import type { AppData, SavingsRepository } from './repository'

const clone = <T,>(v: T): T => structuredClone(v)

export class InMemoryRepository implements SavingsRepository {
  private goals: Goal[]
  private transactions: Transaction[]
  private settings: Settings
  private checklist: ChecklistItem[]
  private listeners = new Set<() => void>()
  private seq = 0

  constructor(seed: Partial<AppData> = {}) {
    this.goals = clone(seed.goals ?? DEFAULT_GOALS)
    this.transactions = clone(seed.transactions ?? [])
    this.settings = clone(seed.settings ?? DEFAULT_SETTINGS)
    this.checklist = clone(seed.checklist ?? DEFAULT_CHECKLIST)
  }

  private emit() {
    this.listeners.forEach((l) => l())
  }

  async load(): Promise<AppData> {
    return clone({
      goals: this.goals,
      transactions: this.transactions,
      settings: this.settings,
      checklist: this.checklist,
    })
  }

  async addTransaction(tx: NewTransaction): Promise<Transaction> {
    const created: Transaction = {
      ...tx,
      id: `tx-${++this.seq}`,
      createdAt: new Date(Date.now() + this.seq).toISOString(),
    }
    this.transactions.push(created)
    this.emit()
    return clone(created)
  }

  async updateTransaction(id: string, patch: Partial<NewTransaction>): Promise<void> {
    const i = this.transactions.findIndex((t) => t.id === id)
    if (i < 0) throw new Error(`Transaction ${id} not found`)
    this.transactions[i] = { ...this.transactions[i], ...patch }
    this.emit()
  }

  async deleteTransaction(id: string): Promise<void> {
    this.transactions = this.transactions.filter((t) => t.id !== id)
    this.emit()
  }

  async updateGoal(id: GoalId, patch: Partial<Omit<Goal, 'id'>>): Promise<void> {
    const i = this.goals.findIndex((g) => g.id === id)
    if (i < 0) throw new Error(`Goal ${id} not found`)
    this.goals[i] = { ...this.goals[i], ...patch }
    this.emit()
  }

  async saveSettings(settings: Settings): Promise<void> {
    this.settings = clone(settings)
    this.emit()
  }

  async saveChecklist(items: ChecklistItem[]): Promise<void> {
    this.checklist = clone(items)
    this.emit()
  }

  subscribe(onChange: () => void): () => void {
    this.listeners.add(onChange)
    return () => this.listeners.delete(onChange)
  }
}
