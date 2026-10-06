import { useState } from 'react'
import { formatCents } from '../lib/money'
import { formatDate } from '../lib/dates'
import { sortNewestFirst } from '../lib/savings'
import type { GoalId, Transaction } from '../lib/types'
import { useSavings } from '../store'
import { TransactionForm } from './TransactionForm'

export function History({ goalId, transactions }: { goalId: GoalId; transactions: Transaction[] }) {
  const { repo } = useSavings()
  const [editing, setEditing] = useState<string | null>(null)
  const rows = sortNewestFirst(transactions)

  if (rows.length === 0) return <p className="text-muted">No entries yet. The jar is waiting 🐾</p>
  return (
    <ul className="flex flex-col gap-2" aria-label="History">
      {rows.map((t) => (
        <li key={t.id} className="rounded-xl bg-base p-3">
          {editing === t.id ? (
            <TransactionForm
              goalId={goalId} initial={t}
              onCancel={() => setEditing(null)}
              onSave={async (patch) => { await repo.updateTransaction(t.id, patch); setEditing(null) }}
            />
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold">{t.type === 'deposit' ? '+' : '-'}{formatCents(t.amountCents)}</p>
                <p className="truncate text-sm text-muted">{formatDate(t.date)}{t.note && ` | ${t.note}`}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEditing(t.id)} className="rounded-xl px-2 py-1 text-sm underline" aria-label={`Edit ${t.note || formatCents(t.amountCents)}`}>Edit</button>
                <button onClick={() => void repo.deleteTransaction(t.id)} className="rounded-xl px-2 py-1 text-sm underline" aria-label={`Delete ${t.note || formatCents(t.amountCents)}`}>Delete</button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
