import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChecklistItem, Goal, GoalId, NewTransaction, Settings, Transaction } from '../lib/types'
import type { AppData, SavingsRepository } from './repository'
import {
  checklistFromRow, goalFromRow, goalToRow, settingsFromRow, settingsToRow, txFromRow, txToRow,
} from './mappers'

const TABLES = ['goals', 'transactions', 'settings', 'checklist_items'] as const

function check<R extends { data: unknown; error: { message: string } | null }>(
  res: R,
): NonNullable<R['data']> {
  if (res.error) throw new Error(res.error.message)
  return res.data as NonNullable<R['data']>
}

export class SupabaseRepository implements SavingsRepository {
  constructor(private db: SupabaseClient) {}

  async load(): Promise<AppData> {
    const [goals, txs, settings, checklist] = await Promise.all([
      this.db.from('goals').select('*').order('id', { ascending: false }),
      this.db.from('transactions').select('*'),
      this.db.from('settings').select('*').eq('id', 1).single(),
      this.db.from('checklist_items').select('*').order('position'),
    ])
    return {
      goals: check(goals).map(goalFromRow),
      transactions: check(txs).map(txFromRow),
      settings: settingsFromRow(check(settings)),
      checklist: check(checklist).map(checklistFromRow),
    }
  }

  async addTransaction(tx: NewTransaction): Promise<Transaction> {
    const row = check(await this.db.from('transactions').insert(txToRow(tx)).select().single())
    return txFromRow(row)
  }

  async updateTransaction(id: string, patch: Partial<NewTransaction>): Promise<void> {
    check(await this.db.from('transactions').update(txToRow(patch)).eq('id', id))
  }

  async deleteTransaction(id: string): Promise<void> {
    check(await this.db.from('transactions').delete().eq('id', id))
  }

  async updateGoal(id: GoalId, patch: Partial<Omit<Goal, 'id'>>): Promise<void> {
    check(await this.db.from('goals').update(goalToRow(patch)).eq('id', id))
  }

  async saveSettings(settings: Settings): Promise<void> {
    check(await this.db.from('settings').upsert(settingsToRow(settings)))
  }

  async saveChecklist(items: ChecklistItem[]): Promise<void> {
    // Replace-all keeps ordering simple for a ~10 row list.
    check(await this.db.from('checklist_items').delete().not('id', 'is', null))
    if (items.length === 0) return
    check(
      await this.db.from('checklist_items').insert(
        items.map((i, position) => ({
          ...(/^[0-9a-f-]{36}$/.test(i.id) && { id: i.id }),
          label: i.label,
          amount_cents: i.amountCents,
          position,
        })),
      ),
    )
  }

  subscribe(onChange: () => void): () => void {
    const channel = this.db.channel('cat-nap-sync')
    for (const table of TABLES) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    }
    channel.subscribe()
    return () => {
      void this.db.removeChannel(channel)
    }
  }
}
