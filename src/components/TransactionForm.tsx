import { useState, type FormEvent } from 'react'
import { parseToCents } from '../lib/money'
import type { GoalId, NewTransaction, Transaction, TxType } from '../lib/types'
import { toIsoDate } from '../lib/dates'

interface Props {
  goalId: GoalId
  initial?: Transaction
  defaultType?: TxType
  onSave: (tx: NewTransaction) => Promise<void> | void
  onCancel: () => void
}

export const inputCls =
  'w-full rounded-xl border border-surface bg-base px-3 py-2 text-ink placeholder:text-muted'
export const primaryBtn = 'rounded-xl bg-accent px-4 py-2.5 font-semibold text-onaccent'

export function TransactionForm({ goalId, initial, defaultType = 'deposit', onSave, onCancel }: Props) {
  const [type, setType] = useState<TxType>(initial?.type ?? defaultType)
  const [amount, setAmount] = useState(initial ? (initial.amountCents / 100).toFixed(2) : '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(initial?.date ?? toIsoDate(new Date()))
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    const cents = parseToCents(amount)
    if (!cents) return setError('Enter an amount greater than $0.')
    if (!date) return setError('Pick a date.')
    setError('')
    await onSave({ goalId, type, amountCents: cents, note: note.trim(), date })
  }

  const id = `${goalId}-${initial?.id ?? 'new'}`
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl bg-base p-3" aria-label={initial ? 'Edit entry' : 'Add entry'}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-type`} className="text-sm font-semibold">Type</label>
          <select id={`${id}-type`} className={inputCls} value={type} onChange={(e) => setType(e.target.value as TxType)}>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-amount`} className="text-sm font-semibold">Amount ($)</label>
          <input id={`${id}-amount`} inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label htmlFor={`${id}-date`} className="text-sm font-semibold">Date</label>
          <input id={`${id}-date`} type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-note`} className="text-sm font-semibold">Note (optional)</label>
        <input id={`${id}-note`} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-red">{error}</p>}
      <div className="flex gap-2">
        <button className={primaryBtn}>Save</button>
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 font-semibold underline">Cancel</button>
      </div>
    </form>
  )
}
